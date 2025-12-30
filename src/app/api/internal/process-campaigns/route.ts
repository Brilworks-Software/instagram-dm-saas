export const runtime = "nodejs"; // or 'edge'
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { campaignService } from "@/lib/server/campaigns/campaign-service";
import { prisma } from "@/lib/server/prisma/client";

/**
 * Internal API endpoint for processing campaigns
 * Called by Supabase Edge Function via pg_cron
 *
 * Authentication: Uses INTERNAL_API_SECRET token
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication token
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.INTERNAL_API_SECRET;

    if (!expectedSecret) {
      console.error("INTERNAL_API_SECRET is not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find all RUNNING campaigns
    const runningCampaigns = await prisma.campaign.findMany({
      where: { status: "RUNNING" },
      select: {
        id: true,
        name: true,
        totalRecipients: true,
        sentCount: true,
        failedCount: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (runningCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No running campaigns to process",
        processed: 0,
        campaigns: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Process each campaign sequentially
    const results = [];
    let totalProcessed = 0;
    let totalFailed = 0;

    for (const campaign of runningCampaigns) {
      try {
        console.log(`Processing campaign: ${campaign.name} (${campaign.id})`);

        await campaignService.processCampaign(campaign.id);

        // Get updated stats
        const updatedCampaign = await prisma.campaign.findUnique({
          where: { id: campaign.id },
          select: {
            sentCount: true,
            failedCount: true,
            status: true,
          },
        });

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          success: true,
          sentCount: updatedCampaign?.sentCount || 0,
          failedCount: updatedCampaign?.failedCount || 0,
          status: updatedCampaign?.status || "RUNNING",
        });

        totalProcessed++;
      } catch (error: any) {
        console.error(`Failed to process campaign ${campaign.id}:`, error);

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          success: false,
          error: error?.message || "Unknown error",
        });

        totalFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${totalProcessed} campaigns successfully, ${totalFailed} failed`,
      processed: totalProcessed,
      failed: totalFailed,
      total: runningCampaigns.length,
      campaigns: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Campaign processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process campaigns",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check (optional)
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.INTERNAL_API_SECRET;

  if (
    !expectedSecret ||
    !authHeader ||
    authHeader !== `Bearer ${expectedSecret}`
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Return status of running campaigns
  try {
    const runningCampaigns = await prisma.campaign.findMany({
      where: { status: "RUNNING" },
      select: {
        id: true,
        name: true,
        totalRecipients: true,
        sentCount: true,
        failedCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      runningCampaigns: runningCampaigns.length,
      campaigns: runningCampaigns,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch campaign status",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
