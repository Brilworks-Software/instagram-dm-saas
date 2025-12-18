import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/notifications/notification-service';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const { id: notificationId } = params;
    await notificationService.markAsRead(notificationId, auth.userId);
    
    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Failed to mark notification as read:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to mark notification as read' },
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

