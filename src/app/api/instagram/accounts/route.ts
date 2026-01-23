/**
 * Instagram Accounts API
 * Returns a list of Instagram accounts linked to the authenticated workspace.
 * Method: GET
 */
import { NextRequest } from 'next/server';
import { instagramOAuthService } from '@/lib/server/instagram/oauth-service';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const accounts = await instagramOAuthService.listAccounts(auth.workspaceId);
    return Response.json(accounts);
  } catch (error: any) {
    console.error('Failed to list accounts:', error);
    return Response.json(
      { error: error?.message || 'Failed to list accounts' },
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

