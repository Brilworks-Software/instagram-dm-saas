import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/server/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const { cookies, query, limit } = await request.json() as {
      cookies: InstagramCookies;
      query: string;
      limit?: number;
    };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'query is required' },
        { status: 400 }
      );
    }

    const users = await instagramCookieService.searchUsers(cookies, query, limit || 10);

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search users',
      },
      { status: 500 }
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

