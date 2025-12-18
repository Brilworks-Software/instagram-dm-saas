import { NextRequest } from 'next/server';
import { instagramBrowserService } from '@/lib/backend/instagram/browser-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId } = body as { workspaceId?: string };
    
    const defaultWorkspaceId = workspaceId || '11111111-1111-1111-1111-111111111111';
    
    console.log('Checking for existing Instagram session...');
    
    const result = await instagramBrowserService.checkExistingSession(defaultWorkspaceId);
    
    return Response.json({
      success: result.found,
      ...result,
    });
  } catch (error: any) {
    console.error('Failed to check existing session:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to check existing session' },
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

