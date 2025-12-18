import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/backend/notifications/notification-service';
import { requireAuth } from '@/lib/backend/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const preferences = await notificationService.getPreferences(
      auth.workspaceId,
      auth.userId,
    );

    return Response.json(preferences);
  } catch (error: any) {
    console.error('Failed to get preferences:', error);
    return Response.json(
      { error: error?.message || 'Failed to get preferences' },
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

