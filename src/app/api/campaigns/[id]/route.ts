import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";
import { requireAuth } from "@/lib/server/auth";

/**
 * GET /api/campaigns/[id]
 * Fetches detailed campaign data including steps, recipients, accounts, and messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { id: campaignId } = params;

    // Fetch campaign with all related data
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        steps: {
          include: {
            variants: true,
          },
          orderBy: {
            stepOrder: "asc",
          },
        },
        recipients: {
          include: {
            contact: {
              select: {
                id: true,
                igUserId: true,
                igUsername: true,
                name: true,
                profilePictureUrl: true,
              },
            },
            assignedAccount: {
              select: {
                id: true,
                igUsername: true,
                profilePictureUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        campaignAccounts: {
          include: {
            instagramAccount: {
              select: {
                id: true,
                igUsername: true,
                profilePictureUrl: true,
                isActive: true,
              },
            },
          },
        },
        instagramAccount: {
          select: {
            id: true,
            igUsername: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Verify campaign belongs to workspace
    if (campaign.workspaceId !== auth.workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch job queue stats for this campaign
    const jobStats = await prisma.jobQueue.groupBy({
      by: ["status"],
      where: {
        campaignId: campaignId,
      },
      _count: {
        id: true,
      },
    });

    // Fetch messages sent for this campaign (via campaignStepId)
    const stepIds = campaign.steps.map((s) => s.id);
    const messages = await prisma.message.findMany({
      where: {
        campaignStepId: {
          in: stepIds,
        },
      },
      include: {
        conversation: {
          include: {
            contact: {
              select: {
                id: true,
                igUsername: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 100, // Limit to most recent 100 messages
    });

    // Count recipients by status
    const recipientStatusCounts = await prisma.campaignRecipient.groupBy({
      by: ["status"],
      where: {
        campaignId: campaignId,
      },
      _count: {
        id: true,
      },
    });

    // Format response
    const jobStatsMap = Object.fromEntries(
      jobStats.map((stat) => [stat.status, stat._count.id])
    );

    const recipientStatusMap = Object.fromEntries(
      recipientStatusCounts.map((stat) => [stat.status, stat._count.id])
    );

    // Format TIME columns properly (they come as Date objects but represent time only)
    let sendStartTimeStr: string | null = null;
    let sendEndTimeStr: string | null = null;
    
    if (campaign.sendStartTime) {
      const time = campaign.sendStartTime;
      if (time instanceof Date) {
        const hours = String(time.getUTCHours()).padStart(2, '0');
        const minutes = String(time.getUTCMinutes()).padStart(2, '0');
        sendStartTimeStr = `${hours}:${minutes}`;
      } else if (typeof time === 'string') {
        sendStartTimeStr = (time as string).substring(0, 5); // HH:mm
      }
    }
    
    if (campaign.sendEndTime) {
      const time = campaign.sendEndTime as unknown as Date;
      if (time instanceof Date) {
        const hours = String(time.getUTCHours()).padStart(2, '0');
        const minutes = String(time.getUTCMinutes()).padStart(2, '0');
        sendEndTimeStr = `${hours}:${minutes}`;
      } else if (typeof time === 'string') {
        sendEndTimeStr = (time as string).substring(0, 5); // HH:mm
      }
    }

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        sendStartTime: sendStartTimeStr,
        sendEndTime: sendEndTimeStr,
        jobStats: jobStatsMap,
        recipientStatusCounts: recipientStatusMap,
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          direction: m.direction,
          status: m.status,
          sentAt: m.sentAt,
          errorMessage: m.errorMessage,
          contact: m.conversation.contact,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching campaign details:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch campaign details",
      },
      { status: 500 }
    );
  }
}
