import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/instagram/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { hashtag: string } }
) {
  try {
    const { cookies, limit, searchSource, bioKeywords } = await request.json() as {
      cookies: InstagramCookies;
      limit?: number;
      searchSource?: 'posts' | 'bio' | 'both';
      bioKeywords?: string[];
    };
    const { hashtag } = params;

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    const source = searchSource || 'posts';
    const result = await instagramCookieService.searchByKeyword(
      cookies,
      hashtag,
      source,
      limit || 50,
      bioKeywords
    );

    return NextResponse.json({
      success: true,
      hashtag,
      searchSource: source,
      users: result.users,
      count: result.users.length,
    });
  } catch (error: any) {
    console.error('Error getting hashtag users:', error);
    return NextResponse.json(
      {
        success: false,
        hashtag: params.hashtag,
        searchSource: 'posts',
        users: [],
        count: 0,
        error: error.message || 'Failed to get hashtag users',
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

