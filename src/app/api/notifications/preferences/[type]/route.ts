import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/backend/notifications/notification-service';
import { requireAuth } from '@/lib/backend/auth';
import { NotificationType } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const { type } = params;
    const body = await request.json();
    const preferences = body as { email?: boolean; push?: boolean; inApp?: boolean };

    const result = await notificationService.updatePreference(
      auth.workspaceId,
      type as NotificationType,
      preferences,
      auth.userId,
    );

    return Response.json(result);
  } catch (error: any) {
    console.error('Failed to update preference:', error);
    return Response.json(
      { error: error?.message || 'Failed to update preference' },
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

