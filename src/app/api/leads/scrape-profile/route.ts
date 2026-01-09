import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Extract profile data and recent posts from Instagram HTML
 */
function extractProfileData(html: string): {
  profilePicUrl?: string;
  fullName?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isVerified?: boolean;
  isPrivate?: boolean;
  isBusiness?: boolean;
  externalUrl?: string;
  recentPosts?: Array<{
    thumbnail: string;
    postUrl: string;
    likes?: number;
    comments?: number;
  }>;
} | null {
  try {
    console.log('[Profile Scraper] Starting data extraction from HTML');
    
    // Extract JSON data from various script tags (Instagram embeds data in multiple places)
    const scriptRegex = /<script type="application\/ld\+json">({[\s\S]*?})<\/script>/g;
    const sharedDataRegex = /window\._sharedData = ({[\s\S]*?});<\/script>/;
    const additionalDataRegex = /"graphql":\s*\{[\s\S]*?"user":\s*({[\s\S]*?})\s*\}/;
    
    // NEW: Instagram now uses require statements and JSON embedded differently
    const requireDataRegex = /"ProfilePage"\s*:\s*\[\s*\{\s*"graphql"\s*:\s*\{\s*"user"\s*:\s*({[\s\S]*?})\s*\}\s*\}\s*\]/;
    const xigSharedDataRegex = /window\.__additionalDataLoaded\s*\('extra',\s*({[\s\S]*?})\);?<\/script>/;

    let profileData: any = {};

    // Try new Instagram data format first (most common now)
    const requireMatch = html.match(requireDataRegex);
    if (requireMatch) {
      try {
        console.log('[Profile Scraper] Found require data format');
        profileData = JSON.parse(requireMatch[1]);
      } catch (e) {
        console.log('[Profile Scraper] Could not parse require data:', e);
      }
    }

    // Try to extract from shared data (old format)
    if (!profileData.id) {
      const sharedDataMatch = html.match(sharedDataRegex);
      if (sharedDataMatch) {
        try {
          console.log('[Profile Scraper] Found shared data format');
          const sharedData = JSON.parse(sharedDataMatch[1]);
          const user = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;
          if (user) {
            profileData = user;
          }
        } catch (e) {
          console.log('[Profile Scraper] Could not parse shared data:', e);
        }
      }
    }

    // Try additional data format
    if (!profileData.id) {
      const additionalMatch = html.match(additionalDataRegex);
      if (additionalMatch) {
        try {
          console.log('[Profile Scraper] Found additional data format');
          profileData = JSON.parse(additionalMatch[1]);
        } catch (e) {
          console.log('[Profile Scraper] Could not parse additional data:', e);
        }
      }
    }

    // Try XIG shared data format
    if (!profileData.id) {
      const xigMatch = html.match(xigSharedDataRegex);
      if (xigMatch) {
        try {
          console.log('[Profile Scraper] Found XIG data format');
          const xigData = JSON.parse(xigMatch[1]);
          const user = xigData?.graphql?.user;
          if (user) {
            profileData = user;
          }
        } catch (e) {
          console.log('[Profile Scraper] Could not parse XIG data:', e);
        }
      }
    }

    // Extract from JSON-LD schema (fallback for basic info)
    let jsonLdData: any = null;
    const scriptMatches = html.match(scriptRegex);
    if (scriptMatches) {
      for (const match of scriptMatches) {
        try {
          // Extract just the JSON part from the match
          const jsonMatch = match.match(/>({[\s\S]*?})</)
          if (jsonMatch && jsonMatch[1]) {
            const data = JSON.parse(jsonMatch[1]);
            if (data['@type'] === 'Person' || data['@context']?.includes('schema.org')) {
              jsonLdData = data;
              console.log('[Profile Scraper] Found JSON-LD data');
              break;
            }
          }
        } catch (e) {
          // Continue to next match
        }
      }
    }

    console.log('[Profile Scraper] ProfileData keys:', Object.keys(profileData));
    console.log('[Profile Scraper] Has JSON-LD:', !!jsonLdData);

    // Build result from available data
    const result: any = {};

    // Profile picture
    result.profilePicUrl = profileData.profile_pic_url_hd || 
                           profileData.profile_pic_url || 
                           jsonLdData?.image;

    // Basic info
    result.fullName = profileData.full_name || jsonLdData?.name;
    result.bio = profileData.biography || jsonLdData?.description;
    result.externalUrl = profileData.external_url || jsonLdData?.url;

    // Counts
    result.followerCount = profileData.edge_followed_by?.count;
    result.followingCount = profileData.edge_follow?.count;
    result.postCount = profileData.edge_owner_to_timeline_media?.count;

    // Flags
    result.isVerified = profileData.is_verified || false;
    result.isPrivate = profileData.is_private || false;
    result.isBusiness = profileData.is_business_account || false;

    // Extract recent posts
    const posts = profileData.edge_owner_to_timeline_media?.edges;
    if (posts && Array.isArray(posts)) {
      result.recentPosts = posts.slice(0, 3).map((edge: any) => {
        const node = edge.node;
        return {
          thumbnail: node.thumbnail_src || node.display_url,
          postUrl: `https://www.instagram.com/p/${node.shortcode}/`,
          likes: node.edge_liked_by?.count,
          comments: node.edge_media_to_comment?.count,
        };
      });
    }

    console.log('[Profile Scraper] Extracted data:', {
      hasProfilePic: !!result.profilePicUrl,
      hasFullName: !!result.fullName,
      hasBio: !!result.bio,
      followerCount: result.followerCount,
      isPrivate: result.isPrivate,
    });

    // Validate we have at least some data
    if (!result.profilePicUrl && !result.fullName && !result.bio) {
      console.log('[Profile Scraper] No valid data extracted');
      return null;
    }

    return result;
  } catch (error) {
    console.error('[Profile Scraper] Error extracting data:', error);
    return null;
  }
}

/**
 * GET/POST /api/leads/scrape-profile
 * Scrape public Instagram profile data without authentication
 */
async function handleRequest(request: NextRequest) {
  try {
    let username: string | null = null;

    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url);
      username = searchParams.get('username');
    } else {
      const body = await request.json();
      username = body.username;
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '');
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

    console.log('[Profile Scraper] Fetching:', cleanUsername);

    // Fetch Instagram profile page with proper browser headers
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.instagram.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error('[Profile Scraper] Instagram fetch failed:', response.status);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Profile not found. User may not exist or account is deleted.' },
          { status: 404 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limited. Please try again in a few minutes.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Unable to fetch profile from Instagram' },
        { status: 502 }
      );
    }

    const html = await response.text();
    console.log('[Profile Scraper] HTML length:', html.length);

    // Extract profile data
    const profileData = extractProfileData(html);

    if (!profileData) {
      // For private accounts or when we can't extract data, return basic info
      console.log('[Profile Scraper] Could not extract full data, returning minimal info');
      return NextResponse.json({
        success: true,
        username: cleanUsername,
        profileUrl,
        isPrivate: true,
        fullName: cleanUsername,
        bio: '',
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
      });
    }

    console.log('[Profile Scraper] Successfully extracted profile data');

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      profileUrl,
      ...profileData,
    });
  } catch (error) {
    console.error('[Profile Scraper] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Support both GET and POST methods
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
