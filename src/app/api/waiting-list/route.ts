import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientIP, getIPLocation } from "@/lib/waiting-list/ip-utils";
import { sendSlackNotification } from "@/lib/waiting-list/slack";
import {
  validateEmail,
  validateInstagramId,
} from "@/lib/waiting-list/validation";

// ============================================================================
// API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, instagram_id, message, previous_page, client_ip, ip_info } = body as {
      email: string | null;
      instagram_id: string | null;
      message?: string | null;
      previous_page?: string | null;
      client_ip?: string | null;
      ip_info?: { city?: string; region?: string; country_name?: string, country_code?: string, timezone?: string, isp?: string } | null;
    };

    // Get client IP - prefer client-provided IP (from ipify.org), fallback to headers
    // This avoids localhost issues (::1, 127.0.0.1) when running locally
    let clientIP = client_ip || getClientIP(request);

    // Use client-provided location info if available, otherwise fallback to server-side lookup
    let location = null;
    if (ip_info && (ip_info.city || ip_info.region || ip_info.country_name)) {
      // Use client-provided location data
      location = {
        city: ip_info.city || "",
        region: ip_info.region || "",
        country: ip_info.country_name || "",
        countryCode: ip_info.country_code || "",
        timezone: ip_info.timezone || "",
        isp: ip_info.isp || "",
      };
      console.log("✅ Using client-provided location:", location);
    } else {
      // Fallback to server-side location lookup (only if not localhost)
      const isLocalhost =
        clientIP === "::1" ||
        clientIP === "127.0.0.1" ||
        clientIP === "localhost" ||
        clientIP === "unknown";

      if (!isLocalhost) {
        console.log("🔍 Falling back to server-side location lookup for IP:", clientIP);
        try {
          const locationPromise = getIPLocation(clientIP);
          const timeoutPromise = new Promise<null>(
            (resolve) => setTimeout(() => {
              console.warn("⏱️ Location lookup timed out after 3 seconds");
              resolve(null);
            }, 3000)
          );
          location = await Promise.race([locationPromise, timeoutPromise]);
          if (location) {
            console.log("✅ Server-side location lookup successful:", location);
          }
        } catch (locationError) {
          console.error("❌ Server-side location lookup failed:", locationError);
        }
      } else {
        console.log("🏠 Skipping location lookup for localhost IP:", clientIP);
      }
    }

    const referer = request.headers.get("referer");
    const pageURL = referer || null;
    const previousPage = previous_page || null;

    // Validation
    if (!email && !instagram_id) {
      return NextResponse.json(
        { success: false, error: "Either email or instagram_id is required" },
        { status: 400 }
      );
    }

    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (instagram_id && !validateInstagramId(instagram_id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Instagram ID format" },
        { status: 400 }
      );
    }

    // Save to database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("waiting_list")
      .insert({
        email: email || null,
        instagram_id: instagram_id || null,
        message: message?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate email
      if (error.code === "23505" || error.message.includes("unique")) {
        return NextResponse.json(
          {
            success: false,
            error: "This email is already on the waiting list",
          },
          { status: 409 }
        );
      }

      console.error("Error inserting into waiting_list:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to join waiting list. Please try again.",
        },
        { status: 500 }
      );
    }

    // Send Slack notification and store status
    // Must await this to ensure it completes before serverless function terminates
    const waitingListId = data?.id;
    console.log("🔔 Starting Slack notification process", { waitingListId, email, instagram_id });
    
    if (waitingListId) {
      try {
        // Location is already fetched (client-side preferred, server-side fallback)
        console.log("🌍 Using location data:", { location, clientIP });

        // Send notification with location data (or empty if unavailable)
        console.log("📤 Sending Slack notification...");
        const notificationResult = await sendSlackNotification({
          email: email || null,
          instagramId: instagram_id || null,
          message: message || null,
          previousPage,
          pageURL,
          region: location?.region || "",
          city: location?.city || "",
          country: location?.country || "",
        });

        console.log("📬 Slack notification result:", notificationResult);

        // Store notification status in Supabase
        // If successful: set sent=true, store timestamp, clear error
        // If failed: set sent=false, clear timestamp, store error
        const updateData = {
          slack_notification_sent: notificationResult.success,
          slack_notification_sent_at: notificationResult.success
            ? new Date().toISOString()
            : null,
          slack_notification_error: notificationResult.success
            ? null // Clear error on success
            : notificationResult.error || null, // Store error on failure
        };

        // Create a fresh Supabase client for the update
        const updateSupabase = await createClient();
        const { error: updateError } = await updateSupabase
          .from("waiting_list")
          .update(updateData)
          .eq("id", waitingListId)
          .select();

        if (updateError) {
          console.error(
            "❌ Failed to update notification status in database:",
            updateError
          );
        } else {
          console.log("✅ Successfully updated notification status in database");
        }
      } catch (notificationError) {
        // Log error and store failure status
        const errorMessage =
          notificationError instanceof Error
            ? notificationError.message
            : String(notificationError);

        console.error("Failed to send Slack notification:", {
          error: errorMessage,
          email: email,
          instagramId: instagram_id,
        });

        // Store failure status in Supabase
        try {
          // Create a fresh Supabase client for the error update
          const errorSupabase = await createClient();
          const { error: updateError } = await errorSupabase
            .from("waiting_list")
            .update({
              slack_notification_sent: false,
              slack_notification_sent_at: null,
              slack_notification_error: errorMessage,
            })
            .eq("id", waitingListId);

          if (updateError) {
            console.error(
              "Failed to update notification error status in database:",
              updateError
            );
          }
        } catch (dbError) {
          console.error("Error updating notification status:", dbError);
        }
      }
    } else {
      console.error("No waiting list ID available to track notification");
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined waiting list",
      data,
    });
  } catch (error: any) {
    console.error("Error in waiting-list API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
