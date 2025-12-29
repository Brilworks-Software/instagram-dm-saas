import { NextRequest, NextResponse } from 'next/server';
import { formatToolUsageSlackMessage, postToSlack } from '@/lib/slack';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Extract video URL from Instagram HTML by parsing JSON data
 */
function extractVideoUrl(html: string): string | null {
  try {
    // Method 1: Look for video_url in various formats
    const videoUrlPatterns = [
      /"video_url":"([^"]+)"/,
      /"videoUrl":"([^"]+)"/,
      /video_url":"([^"]+)"/,
      /"video_url\\*":\\*"([^"]+)"/,
    ];

    for (const pattern of videoUrlPatterns) {
      const match = html.match(pattern);
      if (match) {
        console.log('[Reel Download] Found with pattern:', pattern.source);
        return match[1]
          .replace(/\\u0026/g, '&')
          .replace(/\\\//g, '/');
      }
    }

    // Method 2: Look for VideoObject in JSON-LD
    const jsonLdPattern = /<script type="application\/ld\+json">([^<]+)<\/script>/g;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'VideoObject' && jsonData.contentUrl) {
          console.log('[Reel Download] Found via VideoObject');
          return jsonData.contentUrl;
        }
      } catch (e) {
        continue;
      }
    }

    // Method 3: Look for playback_url (alternative field)
    const playbackMatch = html.match(/"playback_url":"([^"]+)"/);
    if (playbackMatch) {
      console.log('[Reel Download] Found via playback_url');
      return playbackMatch[1]
        .replace(/\\u0026/g, '&')
        .replace(/\\\//g, '/');
    }

    // Method 4: Search for any .mp4 CDN URLs
    const cdnPattern = /https:\\\/\\\/[^"]+\.cdninstagram\.com[^"]+\.mp4[^"]*/g;
    const cdnMatches = html.match(cdnPattern);
    if (cdnMatches && cdnMatches.length > 0) {
      // Take the longest URL (usually the highest quality)
      const longestUrl = cdnMatches.reduce((a, b) => a.length > b.length ? a : b);
      console.log('[Reel Download] Found via CDN pattern');
      return longestUrl
        .replace(/\\u0026/g, '&')
        .replace(/\\\//g, '/');
    }

    // Method 5: Try to find in __additionalDataLoaded
    const additionalDataMatch = html.match(/"__additionalDataLoaded\('extra',({.+?})\)"/);
    if (additionalDataMatch) {
      try {
        const data = JSON.parse(additionalDataMatch[1]);
        if (data?.video_url) {
          console.log('[Reel Download] Found via additionalDataLoaded');
          return data.video_url;
        }
      } catch (e) {
        // Continue to next method
      }
    }

    // Method 6: Look for data in <script> tags
    const scriptPattern = /<script[^>]*>([^<]+)<\/script>/g;
    let scriptMatch;
    while ((scriptMatch = scriptPattern.exec(html)) !== null) {
      const scriptContent = scriptMatch[1];
      if (scriptContent.includes('video_url') || scriptContent.includes('.mp4')) {
        const videoMatch = scriptContent.match(/https?:[^"'\s]+\.mp4[^"'\s]*/);
        if (videoMatch) {
          console.log('[Reel Download] Found video URL in script tag');
          return videoMatch[0]
            .replace(/\\u0026/g, '&')
            .replace(/\\\//g, '/');
        }
      }
    }

    console.log('[Reel Download] No video URL found with any method');
    return null;
  } catch (error) {
    console.error('Error extracting video URL:', error);
    return null;
  }
}

/**
 * Extract metadata from Instagram HTML
 */
function extractMetadata(html: string): { username?: string; caption?: string; thumbnailUrl?: string } {
  try {
    const metadata: { username?: string; caption?: string; thumbnailUrl?: string } = {};

    // Extract username - try multiple patterns
    const usernamePatterns = [
      /"owner":\{"username":"([^"]+)"/,
      /"username":"([^"]+)"/,
      /instagram\.com\/([^\/\?"]+)/,
    ];
    
    for (const pattern of usernamePatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1] !== 'reel') {
        metadata.username = match[1];
        break;
      }
    }

    // Extract caption
    const captionPatterns = [
      /"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"([^"]+)"/,
      /"caption":"([^"]+)"/,
    ];
    
    for (const pattern of captionPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        metadata.caption = match[1].replace(/\\n/g, '\n').substring(0, 200);
        break;
      }
    }

    // Extract thumbnail - look for high quality images
    const thumbnailPatterns = [
      /"display_url":"([^"]+)"/,
      /"thumbnail_src":"([^"]+)"/,
      /"og:image"\s+content="([^"]+)"/,
      /property="og:image"\s+content="([^"]+)"/,
    ];
    
    for (const pattern of thumbnailPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let url = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/&amp;/g, '&');
        if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('cdninstagram.com')) {
          metadata.thumbnailUrl = url;
          break;
        }
      }
    }
    
    // Fallback: search for any cdninstagram image URLs
    if (!metadata.thumbnailUrl) {
      const imageMatch = html.match(/https?:[\\\/]*[^"]+cdninstagram\.com[^"]+\.jpg/);
      if (imageMatch) {
        metadata.thumbnailUrl = imageMatch[0].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
      }
    }

    console.log('[Reel Download] Metadata extracted:', {
      hasUsername: !!metadata.username,
      hasCaption: !!metadata.caption,
      hasThumbnail: !!metadata.thumbnailUrl
    });

    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
}

/**
 * GET/POST /api/tools/reel-download
 * Extract video URL from Instagram reel by scraping HTML
 */
async function handleRequest(request: NextRequest) {
  try {
    console.log('[Reel Download] Request received:', request.method);
    
    // Support both GET and POST
    let reelUrl: string | null = null;
    let clientIp: string | null = null;
    let ipInfo: Record<string, unknown> | null = null;

    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url);
      reelUrl = searchParams.get('url');
    } else {
      const body = await request.json();
      reelUrl = body.reelUrl || body.url;
      clientIp = body.clientIp || null;
      ipInfo = body.ipInfo || null;
    }

    console.log('[Reel Download] URL received:', reelUrl);
    console.log('[Reel Download] IP received:', clientIp);

    if (!reelUrl) {
      return NextResponse.json(
        { error: 'Reel URL is required' },
        { status: 400 }
      );
    }

    // STEP 2: Validate URL and extract shortcode
    if (!reelUrl.includes('instagram.com') || !reelUrl.includes('/reel/')) {
      return NextResponse.json(
        { error: 'Invalid Instagram reel URL. Must contain /reel/' },
        { status: 400 }
      );
    }

    const match = reelUrl.match(/\/reel\/([A-Za-z0-9_-]+)/);
    if (!match) {
      return NextResponse.json(
        { error: 'Could not extract reel shortcode from URL' },
        { status: 400 }
      );
    }

    const shortcode = match[1];
    const cleanUrl = `https://www.instagram.com/reel/${shortcode}/`;
    console.log('[Reel Download] Fetching shortcode:', shortcode);

    // STEP 4: Fetch Instagram page with proper browser headers
    const response = await fetch(cleanUrl, {
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
      console.error('Instagram fetch failed:', response.status, response.statusText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Reel not found. It may be deleted or private.' },
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
        { error: 'Unable to fetch reel from Instagram' },
        { status: 502 }
      );
    }

    // STEP 5: Extract video URL from HTML
    const html = await response.text();
    console.log('[Reel Download] HTML length:', html.length);
    
    // Look for any video-related patterns in the HTML
    const hasVideoUrl = html.includes('video_url');
    const hasPlaybackUrl = html.includes('playback_url');
    const hasCdnInstagram = html.includes('cdninstagram.com');
    const hasMp4 = html.includes('.mp4');
    
    console.log('[Reel Download] Patterns found:', { hasVideoUrl, hasPlaybackUrl, hasCdnInstagram, hasMp4 });
    
    const videoUrl = extractVideoUrl(html);
    console.log('[Reel Download] Extracted video URL:', videoUrl ? 'Found' : 'Not found');

    if (!videoUrl) {
      // Log a snippet to help debug
      const snippet = html.substring(html.indexOf('video') > 0 ? html.indexOf('video') - 100 : 0, html.indexOf('video') + 500);
      console.error('[Reel Download] Failed to extract. Snippet:', snippet.substring(0, 300));
      
      return NextResponse.json(
        { error: 'Could not extract video URL. The reel may be private or unavailable.' },
        { status: 404 }
      );
    }

    // Extract additional metadata
    const metadata = extractMetadata(html);

    // Use IP info from client if available, otherwise try to get it server-side
    if (!clientIp || !ipInfo) {
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const cfConnectingIp = request.headers.get('cf-connecting-ip');
      
      clientIp = clientIp || forwardedFor?.split(',')[0].trim() || 
                 cfConnectingIp || 
                 realIp || 
                 'unknown';
      
      const isLocalhost = clientIp === '::1' || 
                         clientIp === '127.0.0.1' || 
                         clientIp === 'localhost' ||
                         clientIp === '::ffff:127.0.0.1';
      
      if (isLocalhost) {
        console.log('[Reel Download] Localhost detected');
        clientIp = 'localhost';
      }
    }

    // Save to Supabase (best-effort)
    try {
      const supabase = await createClient();
      console.log('[DB] Attempting to save reel download to Supabase...');
      
      const { data: savedData, error: dbError } = await supabase
        .from('tool_usage')
        .insert({
          tool_type: 'instagram-reels-downloader',
          insta_id: metadata.username || null,
          niche: null,
          form_data: {
            reel_url: reelUrl,
            shortcode: shortcode,
            username: metadata.username,
            caption: metadata.caption,
            video_url: videoUrl,
          },
          ip_address: clientIp,
          location: ipInfo,
        })
        .select()
        .single();

      if (dbError) {
        console.error('[DB] ❌ Supabase insert error:', {
          error: dbError,
          code: dbError.code,
          message: dbError.message,
        });
      } else {
        console.log('[DB] ✅ Reel download saved successfully to Supabase!', savedData);
      }
    } catch (dbError) {
      console.error('[DB] ❌ Exception saving to Supabase:', dbError);
    }

    // Send Slack notification (best-effort)
    try {
      const slackMessage = formatToolUsageSlackMessage({
        toolType: 'instagram-reels-downloader',
        instaId: reelUrl,
        ip: clientIp,
        ipInfo: ipInfo,
        additionalData: ` Reel Url: ${reelUrl}`,
      });
      
      await postToSlack(slackMessage);
      console.log('[Reel Download] Slack notification sent');
    } catch (slackError) {
      console.warn('[Reel Download] Slack notification failed:', slackError);
      // Don't fail the request if Slack fails
    }

    // STEP 6: Return response to frontend
    return NextResponse.json({
      success: true,
      videoUrl,
      shortcode,
      ...metadata,
    });

  } catch (error) {
    console.error('Error fetching reel:', error);
    
    // STEP 9: Handle errors gracefully
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to fetch reel. Please try again.' },
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
