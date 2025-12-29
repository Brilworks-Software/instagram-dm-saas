import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Download endpoint for Instagram Reels
 * Proxies the video from Instagram CDN to avoid CORS issues
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');
    const shortcode = searchParams.get('shortcode') || 'reel';

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Missing video URL parameter' },
        { status: 400 }
      );
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(videoUrl);

    // Validate that it's an Instagram CDN URL for security
    if (!decodedUrl.includes('instagram.com') && 
        !decodedUrl.includes('cdninstagram.com') && 
        !decodedUrl.includes('fbcdn.net')) {
      return NextResponse.json(
        { error: 'Invalid video URL. Only Instagram CDN URLs are allowed.' },
        { status: 400 }
      );
    }

    // Fetch the video from Instagram
    let response;
    try {
      response = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
          'Accept': 'video/mp4,video/*,*/*;q=0.8',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(60000), // 60 second timeout for videos
      });
    } catch (fetchError) {
      console.error('Video proxy fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch video from Instagram', details: fetchError instanceof Error ? fetchError.message : 'Network error' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error(`Video proxy: Instagram returned ${response.status} for ${decodedUrl}`);
      return NextResponse.json(
        { error: 'Failed to fetch video', status: response.status },
        { status: response.status }
      );
    }

    // Get the video data
    let videoBuffer;
    try {
      videoBuffer = await response.arrayBuffer();
    } catch (bufferError) {
      console.error('Video buffer error:', bufferError);
      return NextResponse.json(
        { error: 'Failed to read video data' },
        { status: 500 }
      );
    }

    // Get content type from response or default to mp4
    const contentType = response.headers.get('content-type') || 'video/mp4';

    // Return the video with appropriate headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="instagram-reel-${shortcode}.mp4"`,
        'Content-Length': videoBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Video download error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

