import { NextRequest } from 'next/server';
import { instagramBrowserService } from '@/lib/backend/instagram/browser-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId } = body as { workspaceId?: string };
    
    const defaultWorkspaceId = workspaceId || '11111111-1111-1111-1111-111111111111';
    
    const result = await instagramBrowserService.startBrowserLogin(defaultWorkspaceId);
    
    return Response.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Browser login start failed:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to start browser login' },
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

