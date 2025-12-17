import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/backend/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/backend/instagram/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string; followListType: string } }
) {
  try {
    const { cookies, limit } = await request.json() as {
      cookies: InstagramCookies;
      limit?: number;
    };
    const { userId, followListType } = params;

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    if (followListType === 'followers') {
      const followers = await instagramCookieService.getUserFollowers(cookies, userId, limit || 50);
      return NextResponse.json({
        success: true,
        followers,
        count: followers.length,
      });
    } else if (followListType === 'following') {
      const following = await instagramCookieService.getUserFollowing(cookies, userId, limit || 50);
      return NextResponse.json({
        success: true,
        following,
        count: following.length,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'followListType must be "followers" or "following"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error getting follow list:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get follow list',
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

