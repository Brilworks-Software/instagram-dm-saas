import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/server/notifications/notification-service';
import { requireAuth } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const body = await request.json();
    const { campaignId, campaignName } = body as { campaignId: string; campaignName: string };

    await notificationService.createNotification(
      auth.workspaceId,
      'CAMPAIGN_COMPLETE',
      'Campaign Completed',
      `Campaign "${campaignName}" has finished sending all messages.`,
      {
        campaignId,
      },
    );

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Failed to create campaign complete notification:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

