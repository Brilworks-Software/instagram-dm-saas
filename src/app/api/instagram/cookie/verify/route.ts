import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/backend/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/backend/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cookies } = body as { cookies: InstagramCookies };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cookies. Missing sessionId or dsUserId.',
          message: 'Invalid cookies. Please make sure you are logged in to Instagram.',
        },
        { status: 400, headers }
      );
    }

    const userInfo = await instagramCookieService.verifySession(cookies);

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json({
      success: true,
      user: userInfo,
    }, { headers });
  } catch (error: any) {
    console.error('Error verifying cookies:', error);
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify Instagram session',
        message: error.message || 'Session expired. Please re-login to Instagram.',
      },
      { status: 400, headers }
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

