import { NextRequest } from 'next/server';
import { instagramCookieService } from '@/lib/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/instagram/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const body = await request.json();
    const { cookies } = body as { cookies: InstagramCookies };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return Response.json(
        { success: false, error: 'Invalid cookies. Missing required fields.' },
        { status: 400 }
      );
    }

    await instagramCookieService.markThreadAsSeen(cookies, threadId);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Failed to mark thread as seen:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to mark thread as seen' },
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

