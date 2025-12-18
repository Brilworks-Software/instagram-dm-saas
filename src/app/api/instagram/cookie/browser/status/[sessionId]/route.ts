import { NextRequest } from 'next/server';
import { instagramBrowserService } from '@/lib/instagram/browser-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const session = instagramBrowserService.getSessionStatus(sessionId);
    
    if (!session) {
      return Response.json({
        success: false,
        error: 'Session not found',
      });
    }

    return Response.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error('Failed to get browser login status:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to get session status' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

