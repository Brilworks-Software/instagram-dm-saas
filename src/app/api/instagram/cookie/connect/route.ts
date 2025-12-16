import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/backend/instagram/cookie-service';
import { prisma } from '@/lib/backend/prisma/client';
import type { InstagramCookies } from '@/lib/backend/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cookies, workspaceId } = body as { cookies: InstagramCookies; workspaceId?: string };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cookies. Missing sessionId or dsUserId.',
        },
        { status: 400, headers }
      );
    }

    // Verify session first
    const userInfo = await instagramCookieService.verifySession(cookies);

    // Save to database
    const defaultWorkspaceId = workspaceId || '11111111-1111-1111-1111-111111111111';
    let savedAccountId = `cookie_${userInfo.pk}`;
    
    try {
      const savedAccount = await instagramCookieService.saveAccountWithCookies(
        defaultWorkspaceId,
        cookies,
        userInfo
      );
      savedAccountId = savedAccount.id;
    } catch (dbError: any) {
      console.warn('Database unavailable, account verified but not persisted:', dbError.message);
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json({
      success: true,
      account: {
        id: savedAccountId,
        pk: userInfo.pk,
        username: userInfo.username,
        fullName: userInfo.fullName,
        profilePicUrl: userInfo.profilePicUrl,
        isPrivate: userInfo.isPrivate,
      },
      cookiesEncrypted: Buffer.from(JSON.stringify(cookies)).toString('base64'),
    }, { headers });
  } catch (error: any) {
    console.error('Error connecting account:', error);
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect Instagram account',
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

