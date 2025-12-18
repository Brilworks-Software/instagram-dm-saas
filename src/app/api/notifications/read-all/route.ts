import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/server/notifications/notification-service';
import { requireAuth } from '@/lib/server/auth';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    await notificationService.markAllAsRead(auth.userId, auth.workspaceId);
    
    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Failed to mark all notifications as read:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

