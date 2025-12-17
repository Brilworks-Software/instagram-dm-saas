import { NextRequest } from 'next/server';
import { instagramCookieService } from '@/lib/backend/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/backend/instagram/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { hashtag: string } }
) {
  try {
    const { hashtag } = params;
    const body = await request.json();
    const { cookies } = body as { cookies: InstagramCookies };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return Response.json(
        { success: false, error: 'Invalid cookies. Missing required fields.' },
        { status: 400 }
      );
    }

    // Get client to access hashtag feed
    const ig = await instagramCookieService.getClient(cookies);
    const cleanHashtag = hashtag.replace(/^#/, '');
    const hashtagFeed = ig.feed.tag(cleanHashtag);
    const page = await hashtagFeed.items();
    
    if (page.length === 0) {
      return Response.json({
        success: false,
        message: 'No posts found',
        posts: [],
      });
    }
    
    // Get first post structure
    const firstPost = page[0] as any;
    const postInfo: any = {
      keys: Object.keys(firstPost),
      hasUser: !!firstPost.user,
      hasOwner: !!firstPost.owner,
      userPk: firstPost.user_pk || null,
      userId: firstPost.user_id || null,
    };
    
    // Try to serialize user if exists
    if (firstPost.user) {
      try {
        if (typeof firstPost.user.toJSON === 'function') {
          postInfo.user = firstPost.user.toJSON();
        } else {
          postInfo.user = {
            pk: firstPost.user.pk,
            id: firstPost.user.id,
            username: firstPost.user.username,
            keys: Object.keys(firstPost.user),
          };
        }
      } catch (e: any) {
        postInfo.userError = e?.message;
      }
    }
    
    return Response.json({
      success: true,
      postsFound: page.length,
      firstPost: postInfo,
    });
  } catch (error: any) {
    console.error('Hashtag debug failed:', error);
    return Response.json({
      success: false,
      error: error?.message || 'Failed to debug hashtag',
      stack: error?.stack,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

