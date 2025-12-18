import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/server/instagram/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { cookies } = await request.json() as { cookies: InstagramCookies };
    const { username } = params;

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    // Get user ID by username first
    const ig = await instagramCookieService.createClientFromCookies(cookies);
    const user = await ig.user.searchExact(username);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: `User @${username} not found` },
        { status: 404 }
      );
    }

    // Get full profile
    const profile = await ig.user.info(user.pk);
    
    // Get friendship status
    let friendshipStatus: any = null;
    try {
      friendshipStatus = await ig.friendship.show(user.pk);
    } catch (e) {
      // Ignore friendship errors
    }

    const profileData = {
      pk: profile.pk.toString(),
      username: profile.username,
      fullName: profile.full_name || profile.username,
      bio: profile.biography || '',
      profilePicUrl: profile.profile_pic_url,
      followerCount: (profile as any).follower_count || 0,
      followingCount: (profile as any).following_count || 0,
      postCount: (profile as any).media_count || 0,
      isPrivate: profile.is_private || false,
      isVerified: (profile as any).is_verified || false,
      isBusiness: (profile as any).is_business || false,
      externalUrl: (profile as any).external_url || null,
      category: (profile as any).category || null,
      followedByViewer: friendshipStatus?.following || false,
      followsViewer: friendshipStatus?.followed_by || false,
      blockedByViewer: friendshipStatus?.blocking || false,
    };

    return NextResponse.json({
      success: true,
      profile: profileData,
    });
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get user profile',
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

