import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';
import { prisma } from '@/lib/server/prisma/client';
import type { InstagramCookies } from '@/lib/server/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cookies } = body as { cookies: InstagramCookies };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", "*");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid cookies. Missing sessionId or dsUserId.",
        },
        { status: 400, headers }
      );
    }

    // Verify session to get Instagram user info
    const userInfo = await instagramCookieService.verifySession(cookies);

    // Find the Instagram account in database to get workspace ID
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: {
        igUserId: userInfo.pk,
      },
      select: {
        workspaceId: true,
      },
    });

    if (!instagramAccount) {
      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", "*");
      return NextResponse.json(
        {
          success: false,
          error:
            "Instagram account not found in database. Please connect your account first.",
        },
        { status: 404, headers }
      );
    }

    const workspaceId = instagramAccount.workspaceId;

    // Format date as YYYY-MM-DD to ensure proper DATE field storage (without timezone)
    // This ensures the date is stored as '2026-01-21' format, not '2026-01-21T00:00:00.000Z'
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format
    const today = new Date(todayStr);

    // Get all Instagram accounts in the workspace
    const workspaceAccounts = await prisma.instagramAccount.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
      },
    });

    const accountIds = workspaceAccounts.map((account) => account.id);

    // Count messages sent today using accountDailyMessageCount table
    // Sum up messageCount for all accounts in the workspace for today's date
    let messagesToday = 0;
    if (accountIds.length > 0) {
      const dailyCounts = await prisma.accountDailyMessageCount.findMany({
        where: {
          instagramAccountId: {
            in: accountIds,
          },
          date: today,
        },
        select: {
          messageCount: true,
        },
      });

      // Sum up all message counts for today
      messagesToday = dailyCounts.reduce(
        (sum, count) => sum + (count.messageCount || 0),
        0
      );
    }

    // Also reset stale dms_sent_today counters in the background (don't block)
    // Note: This is kept for backward compatibility, but accountDailyMessageCount is now the source of truth
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    
    prisma.instagramAccount
      .findMany({
        where: {
          workspaceId,
        },
        select: {
          id: true,
          dmsSentToday: true,
          dmLimitResetAt: true,
        },
      })
      .then((accounts) => {
        const resetPromises = accounts
          .filter((account) => {
            const resetAt = account.dmLimitResetAt;
            return (
              (!resetAt || resetAt < todayStart) && account.dmsSentToday > 0
            );
          })
          .map((account) =>
            prisma.instagramAccount.update({
              where: { id: account.id },
              data: {
                dmsSentToday: 0,
                dmLimitResetAt: new Date(
                  todayStart.getTime() + 24 * 60 * 60 * 1000
                ),
              },
            })
          );

        return Promise.allSettled(resetPromises);
      })
      .catch((error) => {
        console.error("Error resetting stale DM counters:", error);
      });

    // Get total messages: Count of all OUTBOUND messages in workspace
    // Messages are linked through conversations -> instagramAccount -> workspace
    const totalMessages = await prisma.message.count({
      where: {
        direction: "OUTBOUND",
        conversation: {
          instagramAccount: {
            workspaceId,
          },
        },
      },
    });

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    return NextResponse.json(
      {
        success: true,
        messagesToday,
        totalMessages,
      },
      { headers }
    );
  } catch (error: any) {
    console.error('Error fetching extension stats:', error);
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statistics',
        messagesToday: 0,
        totalMessages: 0,
      },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

