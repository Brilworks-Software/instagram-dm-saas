import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const { cookies, recipientUsername, message } = await request.json() as {
      cookies: InstagramCookies;
      recipientUsername: string;
      message: string;
    };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    if (!recipientUsername || !message) {
      return NextResponse.json(
        { success: false, error: 'recipientUsername and message are required' },
        { status: 400 }
      );
    }

    const result = await instagramCookieService.sendDM(cookies, {
      recipientUsername,
      message,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending DM:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send DM',
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

