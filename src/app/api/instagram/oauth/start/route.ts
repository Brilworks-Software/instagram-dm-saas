import { NextRequest } from 'next/server';
import { instagramOAuthService } from '@/lib/instagram/oauth-service';

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, use default workspace and user
    // In production, this should use actual user context from auth
    const workspaceId = '11111111-1111-1111-1111-111111111111';
    const userId = '22222222-2222-2222-2222-222222222222';
    
    const authUrl = await instagramOAuthService.startOAuth(workspaceId, userId);

    return Response.json({ url: authUrl });
  } catch (error: any) {
    console.error('OAuth start failed:', error);
    return Response.json(
      { error: error?.message || 'Failed to start OAuth' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const workspaceId = '11111111-1111-1111-1111-111111111111';
    const userId = '22222222-2222-2222-2222-222222222222';
    
    const authUrl = await instagramOAuthService.startOAuth(workspaceId, userId);
    
    return Response.redirect(authUrl);
  } catch (error: any) {
    console.error('OAuth start failed:', error);
    return Response.json(
      { error: error?.message || 'Failed to start OAuth' },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

