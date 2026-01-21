import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";
import { campaignService } from "@/lib/server/campaigns/campaign-service";

export async function GET(request: NextRequest) {
  try {
    const igUserId = request.nextUrl.searchParams.get("ig_user_id");

    if (!igUserId) {
      const errorResponse = {
        success: false,
        error: "ig_user_id query parameter is required",
      };
      console.log("API Response (Missing ig_user_id):", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const now = new Date();

    // --------------------------------------------------
    // 1. FETCH ACCOUNT (LIMIT + COOKIES CHECK)
    // --------------------------------------------------
    const account = await prisma.instagramAccount.findFirst({
      where: { igUserId },
      select: {
        id: true,
        dailyDmLimit: true,
        cookies: true,
      },
    });

    if (!account || !account.cookies) {
      const errorResponse = {
        success: false,
        error: "Instagram account not ready",
      };
      console.log("API Response (Account not ready):", errorResponse);
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // --------------------------------------------------
    // 2. DAILY LIMIT CHECK
    // --------------------------------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyCount = await prisma.accountDailyMessageCount.findUnique({
      where: {
        instagramAccountId_date: {
          instagramAccountId: account.id,
          date: today,
        },
      },
    });

    const sentToday = dailyCount?.messageCount ?? 0;
    const limit = account.dailyDmLimit;
    const available = Math.max(0, limit - sentToday);

    if (available === 0) {
      const response = {
        success: true,
        jobs: [],
        limit: {
          sent: sentToday,
          max: limit,
          available: 0,
        },
      };
      console.log("API Response (Limit reached):", response);
      return NextResponse.json(response);
    }

    // --------------------------------------------------
    // 3. FETCH JOBS DIRECTLY FROM JOB_QUEUE
    // --------------------------------------------------
    const jobs = await prisma.jobQueue.findMany({
      where: {
        senderIgUserId: igUserId,
        status: "QUEUED", // <-- already filtering by QUEUED status
        scheduledAt: { lte: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: available,
    });

    // --------------------------------------------------
    // 4. FORMAT RESPONSE (STATIC_JOB SHAPE)
    //    ⚠️ ALL IDENTITY DATA COMES FROM JOB_QUEUE COLUMNS
    // --------------------------------------------------

    const formattedJobs = jobs.map((job: any) => {
      let message = job.payload?.message ?? "";
      // Personalize the message
      const contact = { name: job.recipientName || "", igUsername: job.recipientUsername || "" };
      if (typeof message === "string") {
        message = campaignService.personalizeMessage(message, contact);
      }
      return {
        id: job.id,
        campaignId: job.campaignId,
        campaignName: job.campaignName,
        leadId: job.leadId,
        recipientUsername: job.recipientUsername,
        recipientUserId: job.recipientUserId,
        jobType: "DM",
        message,
        scheduledAt: job.scheduledAt.toISOString(),
      };
    });

    // Only return the top 5 jobs
    const top5Jobs = formattedJobs.slice(0, 5);

    const response = {
      success: true,
      jobs: top5Jobs,
      limit: {
        sent: sentToday,
        max: limit,
        available,
      },
    };
    console.log("API Response (Success):", response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("❌ Error fetching jobs:", error);
    const errorResponse = {
      success: false,
      error: error.message || "Failed to fetch campaign jobs",
    };
    console.log("API Response (Exception):", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
