import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/tools/reel-download/proxy?url=<instagram-cdn-url>
 * Proxy video download through our server to avoid CORS issues
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    console.log('[Proxy] Video URL received:', videoUrl);

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate it's an Instagram/Facebook CDN URL
    const validDomains = ['cdninstagram.com', 'instagram.com', 'fbcdn.net', 'facebook.com'];
    const isValid = validDomains.some(domain => videoUrl.includes(domain));
    
    if (!isValid) {
      console.error('[Proxy] Invalid domain in URL:', videoUrl);
      return NextResponse.json(
        { error: 'Invalid video URL. Only Instagram CDN URLs are allowed.' },
        { status: 400 }
      );
    }

    console.log('[Proxy] Fetching video from CDN...');

    // Fetch the video from Instagram CDN
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
      },
    });

    if (!response.ok) {
      console.error('[Proxy] Failed to fetch video:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch video from Instagram' },
        { status: response.status }
      );
    }

    console.log('[Proxy] Video fetched successfully, size:', response.headers.get('content-length'));

    // Get video data
    const videoBuffer = await response.arrayBuffer();
    console.log('[Proxy] Streaming video, size:', videoBuffer.byteLength);

    // Stream the video back to client
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.byteLength.toString(),
        'Content-Disposition': 'attachment; filename="instagram-reel.mp4"',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error proxying video:', error);
    return NextResponse.json(
      { error: 'Failed to download video. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
