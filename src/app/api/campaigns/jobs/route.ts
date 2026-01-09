import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";

/**
 * GET /api/campaigns/jobs
 * Fetches pending campaign jobs (recipients) for a specific Instagram account
 * Query params: ig_user_id (Instagram user ID)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const igUserId = searchParams.get("ig_user_id");

    if (!igUserId) {
      return NextResponse.json(
        { success: false, error: "ig_user_id query parameter is required" },
        { status: 400 }
      );
    }

    console.log("📥 [REQUEST] Ig User id received:", igUserId);

    // Find the Instagram account
    console.log("🔍 [DB QUERY] Fetching Instagram account by igUserId...");
    const account = await prisma.instagramAccount.findMany({
      where: { igUserId: igUserId },
      select: { id: true, igUserId: true },
    });
    console.log(
      "✅ [DB RESULT] Instagram account query result:",
      JSON.stringify(account, null, 2)
    );

    if (!account || account.length === 0) {
      return NextResponse.json(
        { success: false, error: "Instagram account not found" },
        { status: 404 }
      );
    }

    const accountId = account[0].id;
    const igUserIdFound = account[0].igUserId;
    const now = new Date();
    console.log(
      "📋 [INFO] Using accountId:",
      accountId,
      "| Current time:",
      now.toISOString()
    );

    // Fetch the Instagram account with cookies
    console.log(
      "🔍 [DB QUERY] Fetching Instagram account details with cookies..."
    );
    const instagramAccount = await prisma.instagramAccount.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        igUsername: true,
        cookies: true,
        dailyDmLimit: true,
      },
    });
    console.log("✅ [DB RESULT] Instagram account details:", {
      id: instagramAccount?.id,
      username: instagramAccount?.igUsername,
      hasCookies: !!instagramAccount?.cookies,
      dailyDmLimit: instagramAccount?.dailyDmLimit,
    });

    if (!instagramAccount || !instagramAccount.cookies) {
      return NextResponse.json(
        { success: false, error: "Instagram account cookies not found" },
        { status: 404 }
      );
    }

    // Check daily message count for this account
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(
      "📅 [INFO] Checking daily message count for date:",
      today.toISOString()
    );

    console.log("🔍 [DB QUERY] Fetching daily message count...");
    const dailyCount = await prisma.accountDailyMessageCount.findUnique({
      where: {
        instagramAccountId_date: {
          instagramAccountId: accountId,
          date: today,
        },
      },
    });
    console.log(
      "✅ [DB RESULT] Daily count record:",
      dailyCount ? JSON.stringify(dailyCount, null, 2) : "No record found"
    );

    const messagesSentToday = dailyCount?.messageCount || 0;
    const dailyLimit = instagramAccount.dailyDmLimit;

    console.log(
      `📊 [LIMIT CHECK] Daily limit: ${messagesSentToday}/${dailyLimit} messages sent today`
    );
    console.log(
      `📊 [LIMIT CHECK] Available slots: ${dailyLimit - messagesSentToday}`
    );

    if (messagesSentToday >= dailyLimit) {
      console.log(
        "⚠️ [LIMIT REACHED] Daily message limit reached. Returning early."
      );
      return NextResponse.json({
        success: true,
        jobs: [],
        message: "Daily message limit reached",
        limit: {
          sent: messagesSentToday,
          max: dailyLimit,
        },
      });
    }

    // Calculate how many messages we can send
    const availableSlots = dailyLimit - messagesSentToday;
    console.log(`💡 [INFO] Available slots for sending: ${availableSlots}`);

    // Fetch pending campaign recipients for this account
    console.log("🔍 [DB QUERY] Fetching pending campaign recipients...");

    // Pull the jobs from the job_queue table
    const pendingJobs = await prisma.jobQueue.findMany({
      where: {
        status: "QUEUED",
        scheduled_at: {
          lte: now, // Jobs scheduled for now or earlier
        },
        sender_username: instagramAccount.igUsername,
      },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        campaign_recipients: {
          select: {
            id: true,
            status: true,
            contact: {
              select: {
                igUsername: true,
                igUserId: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduled_at: "asc",
      },
      take: availableSlots, // Limit by available daily message slots
    });

    console.log(
      `✅ [DB RESULT] Found ${pendingJobs.length} pending jobs`,
      JSON.stringify(pendingJobs, null, 2)
    );

    // Format jobs for response
    const jobs = pendingJobs.map((job) => ({
      id: job.id,
      campaignId: job.campaign_id,
      campaignName: job.campaigns.name,
      leadId: job.lead_id,
      recipientUsername: job.campaign_recipients.contact?.igUsername,
      recipientUserId: job.campaign_recipients.contact?.igUserId,
      jobType: job.job_type,
      message: (job.payload as any).message || "",
      scheduledAt: job.scheduled_at,
    }));

    console.log("📤 [RESPONSE] Returning jobs:", JSON.stringify(jobs, null, 2));

    return NextResponse.json({
      success: true,
      jobs: jobs,
      limit: {
        sent: messagesSentToday,
        max: dailyLimit,
        available: availableSlots,
      },
    });
  } catch (error: any) {
    console.error("❌ [CRITICAL ERROR] Error fetching campaign jobs:", error);
    console.error("❌ [CRITICAL ERROR] Stack trace:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch campaign jobs",
      },
      { status: 500 }
    );
  }
}
