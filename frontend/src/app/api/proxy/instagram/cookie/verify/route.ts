import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL is not set');
      return NextResponse.json(
        { success: false, error: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    let response;
    try {
      response = await fetch(`${backendUrl}/api/instagram/cookie/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
    } catch (fetchError: any) {
      console.error('Failed to reach backend:', fetchError);
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Backend service is unavailable. Please check Railway deployment status.',
          details: fetchError.message 
        },
        { status: 503, headers }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      return NextResponse.json(
        { success: false, error: errorData.error || `Backend returned ${response.status}` },
        { status: response.status, headers }
      );
    }

    const data = await response.json();

    // Set CORS headers for extension
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return NextResponse.json(data, { status: response.status, headers });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect to backend' },
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

