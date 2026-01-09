import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";

/**
 * GET /api/campaigns/jobs/count
 * Returns the count of pending campaign jobs for a specific Instagram account
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

    // Find the Instagram account
    const account = await prisma.instagramAccount.findFirst({
      where: { igUserId: igUserId },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({
        success: true,
        count: 0,
      });
    }

    const now = new Date();

    // Count pending recipients that are due for processing
    const count = await prisma.campaignRecipient.count({
      where: {
        assignedAccountId: account.id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        campaign: {
          status: "RUNNING",
        },
        OR: [{ nextActionAt: null }, { nextActionAt: { lte: now } }],
      },
    });

    return NextResponse.json({
      success: true,
      count: count,
    });
  } catch (error: any) {
    console.error("Error counting campaign jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to count campaign jobs",
        count: 0,
      },
      { status: 500 }
    );
  }
}
