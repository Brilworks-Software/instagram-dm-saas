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
    const { email, instagram_id, message, previous_page, client_ip } = body as {
      email: string | null;
      instagram_id: string | null;
      message?: string | null;
      previous_page?: string | null;
      client_ip?: string | null;
    };

    // Get client IP - prefer client-provided IP (from ipify.org), fallback to headers
    // This avoids localhost issues (::1, 127.0.0.1) when running locally
    let clientIP = client_ip || getClientIP(request);

    // Skip location lookup for localhost IPs (they won't work with ipapi.co)
    const isLocalhost =
      clientIP === "::1" ||
      clientIP === "127.0.0.1" ||
      clientIP === "localhost" ||
      clientIP === "unknown";

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

    // Send Slack notification independently from location lookup
    // This ensures notification is always sent, even if location lookup fails
    // Also store notification status in Supabase
    (async () => {
      const waitingListId = data?.id;
      if (!waitingListId) {
        console.error("No waiting list ID available to track notification");
        return;
      }

      try {
        // Start location lookup (non-blocking) - only if not localhost
        let location = null;
        if (!isLocalhost) {
          try {
            // Wait for location with a timeout to avoid blocking notification
            location = await Promise.race([
              getIPLocation(clientIP),
              new Promise<null>(
                (resolve) => setTimeout(() => resolve(null), 2000) // 2 second timeout
              ),
            ]);
          } catch (locationError) {
            console.warn(
              "Location lookup failed, sending notification without location:",
              locationError
            );
          }
        }

        // Send notification with location data (or empty if unavailable)
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

        const { error: updateError, data: updateDataResult } = await supabase
          .from("waiting_list")
          .update(updateData)
          .eq("id", waitingListId)
          .select();

        if (updateError) {
          console.error(
            "❌ Failed to update notification status in database:",
            updateError
          );
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
          const { error: updateError } = await supabase
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
    })();

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
