import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";
import type { CampaignRecipientStatus } from "@prisma/client";

/**
 * POST /api/campaigns/jobs/status
 * Updates the status of a campaign job (recipient)
 * Body: { jobId: string, status: 'SENT' | 'FAILED', error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, status, error } = body;

    if (!jobId || !status) {
      return NextResponse.json(
        { success: false, error: "jobId and status are required" },
        { status: 400 }
      );
    }

    if (!["SENT", "FAILED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "status must be SENT or FAILED" },
        { status: 400 }
      );
    }

    // Get the recipient to check current state
    const recipient = await prisma.campaignRecipient.findUnique({
      where: { id: jobId },
      include: {
        campaign: {
          include: {
            steps: {
              orderBy: { stepOrder: "asc" },
            },
          },
        },
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    if (status === "SENT") {
      // Message sent successfully
      const currentStepOrder = recipient.currentStepOrder + 1;
      const totalSteps = recipient.campaign.steps.length;

      // Check if there are more steps
      const hasMoreSteps = currentStepOrder < totalSteps;

      if (hasMoreSteps) {
        // Get the next step to calculate delay
        const nextStep = recipient.campaign.steps.find(
          (s) => s.stepOrder === currentStepOrder + 1
        );

        let nextActionAt = null;

        if (nextStep) {
          // Calculate next action time based on delay
          const delayDays = nextStep.delayDays || 0;
          // delayHours field doesn't exist in schema, using delayMinutes only
          const delayMinutes = nextStep.delayMinutes || 0;

          const totalDelayMs =
            delayDays * 24 * 60 * 60 * 1000 + delayMinutes * 60 * 1000;

          if (totalDelayMs > 0) {
            nextActionAt = new Date(now.getTime() + totalDelayMs);
          } else {
            nextActionAt = now; // Process immediately if no delay
          }
        }

        // Update recipient: increment step, set next action time
        // Using raw SQL because nextActionAt might not be in generated Prisma types yet
        await prisma.$executeRaw`
          UPDATE campaign_recipients
          SET 
            current_step_order = ${currentStepOrder},
            status = 'IN_PROGRESS'::"CampaignRecipientStatus",
            last_processed_at = ${now},
            next_action_at = ${nextActionAt},
            error_message = NULL,
            updated_at = ${now}
          WHERE id = ${jobId}::uuid
        `;
      } else {
        // All steps completed
        // Using raw SQL because nextActionAt might not be in generated Prisma types yet
        await prisma.$executeRaw`
          UPDATE campaign_recipients
          SET 
            current_step_order = ${currentStepOrder},
            status = 'COMPLETED'::"CampaignRecipientStatus",
            last_processed_at = ${now},
            next_action_at = NULL,
            error_message = NULL,
            updated_at = ${now}
          WHERE id = ${jobId}::uuid
        `;

        // Check if campaign is complete (all recipients processed)
        const pendingCount = await prisma.campaignRecipient.count({
          where: {
            campaignId: recipient.campaignId,
            status: { in: ["PENDING", "IN_PROGRESS"] },
          },
        });

        if (pendingCount === 0) {
          // Campaign complete
          await prisma.campaign.update({
            where: { id: recipient.campaignId },
            data: {
              status: "COMPLETED",
              completedAt: now,
            },
          });
        }
      }

      // Increment sent count for campaign
      await prisma.campaign.update({
        where: { id: recipient.campaignId },
        data: {
          sentCount: { increment: 1 },
        },
      });
    } else if (status === "FAILED") {
      // Message failed to send
      await prisma.campaignRecipient.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          lastProcessedAt: now,
          errorMessage: error || "Failed to send message",
        },
      });

      // Increment failed count for campaign
      await prisma.campaign.update({
        where: { id: recipient.campaignId },
        data: {
          failedCount: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Job status updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update job status",
      },
      { status: 500 }
    );
  }
}
