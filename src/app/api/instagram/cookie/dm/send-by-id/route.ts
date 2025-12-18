import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const { cookies, recipientUserId, message } = await request.json() as {
      cookies: InstagramCookies;
      recipientUserId: string | number;
      message: string;
    };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    if (!recipientUserId || !message) {
      return NextResponse.json(
        { success: false, error: 'recipientUserId and message are required' },
        { status: 400 }
      );
    }

    // Ensure recipientUserId is a string (convert from number if needed)
    const userIdStr = String(recipientUserId).trim();
    
    // Log for debugging (remove in production if needed)
    console.log('Sending DM to user ID:', userIdStr, 'Message length:', message.length);

    const result = await instagramCookieService.sendDMByUserId(
      cookies,
      userIdStr,
      message
    );

    if (!result.success) {
      console.error('Failed to send DM:', result.error);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending DM by ID:', error);
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

