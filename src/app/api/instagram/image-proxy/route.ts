import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy endpoint for Instagram images to avoid CORS issues
 * Usage: /api/instagram/image-proxy?url=<encoded_instagram_image_url>
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl);

    // Validate that it's an Instagram CDN URL for security
    if (!decodedUrl.includes('instagram.com') && 
        !decodedUrl.includes('cdninstagram.com') && 
        !decodedUrl.includes('fbcdn.net')) {
      return NextResponse.json(
        { error: 'Invalid image URL. Only Instagram CDN URLs are allowed.' },
        { status: 400 }
      );
    }

    // Fetch the image from Instagram
    let response;
    try {
      response = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
    } catch (fetchError) {
      console.error('Image proxy fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch image from Instagram', details: fetchError instanceof Error ? fetchError.message : 'Network error' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error(`Image proxy: Instagram returned ${response.status} for ${decodedUrl}`);
      return NextResponse.json(
        { error: 'Failed to fetch image', status: response.status },
        { status: response.status }
      );
    }

    // Get the image data
    let imageBuffer;
    try {
      imageBuffer = await response.arrayBuffer();
    } catch (bufferError) {
      console.error('Image proxy buffer error:', bufferError);
      return NextResponse.json(
        { error: 'Failed to process image data' },
        { status: 500 }
      );
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper CORS headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
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

