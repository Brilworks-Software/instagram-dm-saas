import { NextRequest } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/server/instagram/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const body = await request.json();
    const { cookies, limit = 50 } = body as { cookies: InstagramCookies; limit?: number };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return Response.json(
        { success: false, error: 'Invalid cookies. Missing required fields.' },
        { status: 400 }
      );
    }

    const messages = await instagramCookieService.getThreadMessages(cookies, threadId, limit);

    return Response.json({
      success: true,
      threadId,
      messages,
      count: messages.length,
    });
  } catch (error: any) {
    console.error('Failed to get thread messages:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to get thread messages' },
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

