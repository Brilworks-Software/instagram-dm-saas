import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/instagram/cookie-service';
import { prisma } from '@/lib/prisma/client';
import { getAuthContext } from '@/lib/auth';
import { getUserWorkspaceId } from '@/lib/supabase/user-workspace';
import type { InstagramCookies } from '@/lib/instagram/types';

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

    // Try to get workspace ID from authentication or use provided one
    let finalWorkspaceId = workspaceId;
    
    if (!finalWorkspaceId) {
      // Try to get from authenticated user
      const auth = await getAuthContext(request);
      if (auth) {
        finalWorkspaceId = auth.workspaceId;
        console.log(`✅ Got workspace ID from authenticated user: ${finalWorkspaceId}`);
      } else {
        // Try to get workspace ID from user workspace helper (server-side)
        const workspaceIdFromHelper = await getUserWorkspaceId();
        if (workspaceIdFromHelper) {
          finalWorkspaceId = workspaceIdFromHelper;
          console.log(`✅ Got workspace ID from server-side helper: ${finalWorkspaceId}`);
        }
      }
    }

    let savedAccountId = `cookie_${userInfo.pk}`;
    let savedToDatabase = false;
    
    // Only save to database if we have a valid workspace ID
    if (finalWorkspaceId) {
      try {
        const savedAccount = await instagramCookieService.saveAccountWithCookies(
          finalWorkspaceId,
          cookies,
          userInfo
        );
        savedAccountId = savedAccount.id;
        savedToDatabase = true;
        console.log(`✅ Saved Instagram account @${userInfo.username} to workspace ${finalWorkspaceId}`);
      } catch (dbError: any) {
        console.warn('Database save failed:', dbError.message);
        // Continue even if DB save fails - frontend can save it
      }
    } else {
      console.warn('⚠️ No workspace ID available - account not saved to database. Frontend will handle saving.');
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
      workspaceId: finalWorkspaceId, // Return workspace ID so frontend knows which one to use
      savedToDatabase, // Indicate if saved to database
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

