import { NextRequest } from 'next/server';
import { instagramBrowserService } from '@/lib/server/instagram/browser-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    await instagramBrowserService.cancelSession(sessionId);
    
    return Response.json({
      success: true,
      message: 'Session cancelled',
    });
  } catch (error: any) {
    console.error('Failed to cancel browser login:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to cancel session' },
      { status: 500 }
    );
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

