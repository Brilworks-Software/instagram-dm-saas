import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/server/instagram/types';
import { urlSegmentToInstagramId } from 'instagram-id-to-url-segment';

export async function POST(
  request: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  try {
    const { cookies } = await request.json() as { cookies: InstagramCookies };
    const { shortcode } = params;

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    const ig = await instagramCookieService.createClientFromCookies(cookies);
    
    // Convert shortcode to media ID (pk)
    const mediaPk = urlSegmentToInstagramId(shortcode);
    
    // Get media info
    const mediaInfo = await ig.media.info(mediaPk);
    const mediaItem = mediaInfo.items[0];
    
    // Get likers (last 3)
    let likers: any[] = [];
    try {
      const likersResponse = await ig.media.likers(mediaPk);
      likers = likersResponse.users.slice(0, 3).map((user: any) => ({
        pk: user.pk.toString(),
        username: user.username,
        fullName: user.full_name || user.username,
        profilePicUrl: user.profile_pic_url,
        isVerified: user.is_verified || false,
      }));
    } catch (e) {
      console.log('Could not fetch likers:', e);
    }

    // Get commenters (last 3 unique commenters)
    let commenters: any[] = [];
    try {
      // Create comments feed
      const commentsFeed = ig.feed.mediaComments(mediaPk);
      const commentsResponse = await commentsFeed.items();
      
      console.log('Comments fetched:', commentsResponse.length);
      
      const uniqueCommenters = new Map();
      for (const comment of commentsResponse) {
        if (!uniqueCommenters.has(comment.user.pk) && uniqueCommenters.size < 3) {
          uniqueCommenters.set(comment.user.pk, {
            pk: comment.user.pk.toString(),
            username: comment.user.username,
            fullName: comment.user.full_name || comment.user.username,
            profilePicUrl: comment.user.profile_pic_url,
            isVerified: comment.user.is_verified || false,
            commentText: comment.text,
          });
        }
      }
      commenters = Array.from(uniqueCommenters.values());
      console.log('Commenters extracted:', commenters.length);
    } catch (e) {
      console.log('Could not fetch comments:', e);
    }

    // Handle carousel (multiple images)
    const images: string[] = [];
    if (mediaItem.carousel_media) {
      // This is a carousel post
      for (const carouselItem of mediaItem.carousel_media) {
        const imageUrl = carouselItem.image_versions2?.candidates?.[0]?.url || carouselItem.thumbnail_url;
        if (imageUrl) images.push(imageUrl);
      }
    } else {
      // Single image post
      const imageUrl = mediaItem.image_versions2?.candidates?.[0]?.url || mediaItem.thumbnail_url;
      if (imageUrl) images.push(imageUrl);
    }

    const postData = {
      id: mediaItem.id,
      shortcode: mediaItem.code,
      postUrl: `https://www.instagram.com/p/${mediaItem.code}/`,
      imageUrl: images[0], // Keep for backward compatibility
      images, // All images for carousel
      isCarousel: !!mediaItem.carousel_media,
      caption: mediaItem.caption?.text || '',
      likeCount: mediaItem.like_count || 0,
      commentCount: mediaItem.comment_count || 0,
      takenAt: new Date(mediaItem.taken_at * 1000).toISOString(),
      owner: {
        username: mediaItem.user.username,
        fullName: mediaItem.user.full_name || mediaItem.user.username,
        profilePicUrl: mediaItem.user.profile_pic_url,
      },
      likers,
      commenters,
    };

    return NextResponse.json({
      success: true,
      post: postData,
    });
  } catch (error: any) {
    console.error('Error getting post details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get post details',
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
