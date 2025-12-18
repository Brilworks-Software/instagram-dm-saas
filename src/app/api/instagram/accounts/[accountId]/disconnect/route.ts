import { NextRequest } from 'next/server';
import { instagramOAuthService } from '@/lib/server/instagram/oauth-service';
import { requireAuth } from '@/lib/server/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const { accountId } = params;
    const result = await instagramOAuthService.disconnectAccount(auth.workspaceId, accountId);
    
    return Response.json(result);
  } catch (error: any) {
    console.error('Failed to disconnect account:', error);
    return Response.json(
      { error: error?.message || 'Failed to disconnect account' },
      { status: error?.message?.includes('not found') ? 404 : 500 }
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

