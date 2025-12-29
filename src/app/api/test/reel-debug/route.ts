import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to test Reel download with detailed logging
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shortcode = searchParams.get('shortcode') || 'DOx_Zr_jubr';

    // Get service cookies
    const sessionId = process.env.INSTAGRAM_SERVICE_SESSION_ID;
    const dsUserId = process.env.INSTAGRAM_SERVICE_DS_USER_ID;
    const csrfToken = process.env.INSTAGRAM_SERVICE_CSRF_TOKEN;

    if (!sessionId || !dsUserId || !csrfToken) {
      return NextResponse.json({
        success: false,
        error: 'Service cookies not configured',
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

    console.log('[Debug] Testing Reel download for shortcode:', shortcode);
    console.log('[Debug] Service cookies configured:', {
      hasSessionId: !!sessionId,
      hasDsUserId: !!dsUserId,
      hasCsrfToken: !!csrfToken,
      dsUserId,
    });

    // Test authentication first
    try {
      const userInfo = await instagramCookieService.verifySession(serviceCookies);
      console.log('[Debug] Authentication successful:', userInfo.username);
    } catch (authError: any) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        message: authError.message,
      }, { status: 401 });
    }

    // Try to get media
    const mediaInfo = await instagramCookieService.getMediaByShortcode(
      serviceCookies,
      shortcode
    );

    if (!mediaInfo) {
      return NextResponse.json({
        success: false,
        error: 'Media not found',
        shortcode,
        message: 'Could not fetch Reel. Check server logs for details.',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      shortcode,
      mediaInfo: {
        id: mediaInfo.id,
        shortcode: mediaInfo.shortcode,
        isVideo: mediaInfo.isVideo,
        hasVideoUrl: !!mediaInfo.videoUrl,
        hasThumbnail: !!mediaInfo.thumbnailUrl,
        username: mediaInfo.username,
        videoUrl: mediaInfo.videoUrl?.substring(0, 100) + '...',
        thumbnailUrl: mediaInfo.thumbnailUrl?.substring(0, 100) + '...',
      },
    });
  } catch (error: any) {
    console.error('[Debug] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal error',
      message: error.message,
      stack: error.stack?.substring(0, 500),
    }, { status: 500 });
  }
}

