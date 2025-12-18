import { NextRequest } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/server/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cookies, limit = 20 } = body as { cookies: InstagramCookies; limit?: number };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return Response.json(
        { success: false, error: 'Invalid cookies. Missing required fields.' },
        { status: 400 }
      );
    }

    const threads = await instagramCookieService.getInbox(cookies, limit);

    return Response.json({
      success: true,
      threads,
      count: threads.length,
    });
  } catch (error: any) {
    console.error('Failed to get inbox:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to get inbox' },
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

