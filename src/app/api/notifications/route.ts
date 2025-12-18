import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/server/notifications/notification-service';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!, 10) : 0;

    const notifications = await notificationService.getNotifications(
      auth.userId,
      auth.workspaceId,
      limit,
      skip,
    );

    return Response.json(notifications);
  } catch (error: any) {
    console.error('Failed to get notifications:', error);
    return Response.json(
      { error: error?.message || 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

