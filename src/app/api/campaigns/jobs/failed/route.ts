import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, errorMessage, failedAt } = body ?? {};

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId is required" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 1. FETCH JOB
    // --------------------------------------------------
    const job = await prisma.jobQueue.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Idempotency guard
    if (job.status === "FAILED") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }
    if (job.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        note: "Job already completed",
      });
    }

    // --------------------------------------------------
    // 2. TRANSACTION (ALL OR NOTHING)
    // --------------------------------------------------
    await prisma.$transaction(async (tx) => {
      const now = failedAt ? new Date(failedAt) : new Date();
      const errMsg =
        typeof errorMessage === "string" && errorMessage.trim().length > 0
          ? errorMessage.trim()
          : "Unknown error";

      // 2.1 MARK JOB FAILED
      await tx.jobQueue.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          updatedAt: now,
        },
      });

      // 2.2 MARK RECIPIENT FAILED
      await tx.campaignRecipient.update({
        where: { id: job.leadId },
        data: {
          status: "FAILED",
          errorMessage: errMsg,
          lastProcessedAt: now,
          updatedAt: now,
        },
      });

      // 2.3 UPDATE CAMPAIGN COUNTERS
      await tx.campaign.update({
        where: { id: job.campaignId },
        data: {
          failedCount: { increment: 1 },
          updatedAt: now,
        },
      });

      // 2.4 CHECK IF ALL JOBS ARE TERMINAL FOR THIS CAMPAIGN
      // Terminal statuses: COMPLETED, FAILED
      const remainingJobs = await tx.jobQueue.count({
        where: {
          campaignId: job.campaignId,
          status: { notIn: ["COMPLETED", "FAILED"] },
        },
      });
      if (remainingJobs === 0) {
        await tx.campaign.update({
          where: { id: job.campaignId },
          data: {
            status: "COMPLETED",
            completedAt: now,
            updatedAt: now,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Job failure update failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Job update failed" },
      { status: 500 }
    );
  }
}

