import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify Instagram service account authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get service cookies from env
    const sessionId = process.env.INSTAGRAM_SERVICE_SESSION_ID;
    const dsUserId = process.env.INSTAGRAM_SERVICE_DS_USER_ID;
    const csrfToken = process.env.INSTAGRAM_SERVICE_CSRF_TOKEN;

    if (!sessionId || !dsUserId || !csrfToken) {
      return NextResponse.json({
        success: false,
        error: 'Service cookies not configured',
        message: 'Please set INSTAGRAM_SERVICE_* environment variables',
      }, { status: 400 });
    }

    const serviceCookies = {
      sessionId,
      dsUserId,
      csrfToken,
      igDid: process.env.INSTAGRAM_SERVICE_IG_DID,
      mid: process.env.INSTAGRAM_SERVICE_MID,
      rur: process.env.INSTAGRAM_SERVICE_RUR,
    };

    // Test authentication
    console.log('[Test Auth] Verifying service account...');
    const userInfo = await instagramCookieService.verifySession(serviceCookies);

    return NextResponse.json({
      success: true,
      message: 'Service account authenticated successfully',
      account: {
        username: userInfo.username,
        userId: userInfo.pk,
        isPrivate: userInfo.isPrivate,
      },
    });
  } catch (error: any) {
    console.error('[Test Auth] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication failed',
      message: error.message || 'Failed to verify Instagram session',
      details: error.stack?.substring(0, 500),
    }, { status: 500 });
  }
}

