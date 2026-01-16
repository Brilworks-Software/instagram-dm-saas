import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, igMessageId, sentAt } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId is required" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 1. FETCH JOB (AND LOCK INTENTIONALLY)
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
    if (job.status === "COMPLETED") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // --------------------------------------------------
    // 2. TRANSACTION (ALL OR NOTHING)
    // --------------------------------------------------
    await prisma.$transaction(async (tx) => {
      const now = sentAt ? new Date(sentAt) : new Date();

      // ----------------------------------------------
      // 2.1 MARK JOB COMPLETED
      // ----------------------------------------------
      await tx.jobQueue.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          updatedAt: now,
        },
      });

      // ----------------------------------------------
      // 2.2 DAILY MESSAGE COUNT
      // ----------------------------------------------
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      await tx.accountDailyMessageCount.upsert({
        where: {
          instagramAccountId_date: {
            instagramAccountId: job.senderInstagramAccountId!,
            date: today,
          },
        },
        update: {
          messageCount: { increment: 1 },
          updatedAt: now,
        },
        create: {
          instagramAccountId: job.senderInstagramAccountId!,
          date: today,
          messageCount: 1,
        },
      });

      // ----------------------------------------------
      // 2.3 CONVERSATION (UPSERT) - Ensure contactId is UUID
      // ----------------------------------------------
      // Fetch the Contact record using the Instagram user ID (job.recipientUserId)
      if (!job.recipientUserId) {
        throw new Error("recipientUserId is required and must be a string");
      }
      const contact = await tx.contact.findFirst({
        where: {
          igUserId: job.recipientUserId,
          workspaceId: job.workspaceId,
        },
      });
      if (!contact) {
        throw new Error("Contact not found for given Instagram user ID");
      }
      const conversation = await tx.conversation.upsert({
        where: {
          instagramAccountId_contactId: {
            instagramAccountId: job.senderInstagramAccountId!,
            contactId: contact.id,
          },
        },
        update: {
          lastMessageAt: now,
        },
        create: {
          instagramAccountId: job.senderInstagramAccountId!,
          contactId: contact.id,
          status: "OPEN",
          lastMessageAt: now,
        },
      });

      // ----------------------------------------------
      // 2.4 INSERT MESSAGE
      // ----------------------------------------------
      // Safely extract message and step_id from job.payload
      let messageContent: string | undefined = undefined;
      let campaignStepId: string | undefined = undefined;
      if (job.payload && typeof job.payload === "object" && job.payload !== null) {
        // @ts-ignore
        messageContent = job.payload.message;
        // @ts-ignore
        campaignStepId = job.payload.step_id;
      }

      await tx.message.create({
        data: {
          igMessageId: igMessageId ?? null,
          content: messageContent ?? "",
          direction: "OUTBOUND",
          status: "SENT",
          sentAt: now,
          conversationId: conversation.id,
          campaignStepId: campaignStepId,
        },
      });

      // ----------------------------------------------
      // 2.5 UPDATE RECIPIENT
      // ----------------------------------------------
      await tx.campaignRecipient.update({
        where: { id: job.leadId },
        data: {
          lastProcessedAt: now,
        },
      });

      // ----------------------------------------------
      // 2.6 UPDATE CAMPAIGN COUNTERS
      // ----------------------------------------------
      await tx.campaign.update({
        where: { id: job.campaignId },
        data: {
          sentCount: { increment: 1 },
          updatedAt: now,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Job completion failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Job update failed" },
      { status: 500 }
    );
  }
}
