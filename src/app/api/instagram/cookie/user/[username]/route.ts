import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/backend/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/backend/instagram/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { cookies } = await request.json() as { cookies: InstagramCookies };
    const { username } = params;

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    const user = await instagramCookieService.getUserByUsername(cookies, username);

    if (!user) {
      return NextResponse.json(
        { success: false, error: `User @${username} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get user',
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

