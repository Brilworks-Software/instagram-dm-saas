import { NextRequest } from 'next/server';
import { instagramOAuthService } from '@/lib/server/instagram/oauth-service';

export async function GET(request: NextRequest) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const searchParams = request.nextUrl.searchParams;
  
  // Handle OAuth errors
  const error = searchParams.get('error');
  if (error) {
    console.error(`OAuth error: ${error}`);
    return Response.redirect(`${frontendUrl}/settings/instagram?error=${encodeURIComponent(error)}`);
  }

  // Validate required parameters
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code || !state) {
    console.error('Missing code or state in OAuth callback');
    return Response.redirect(`${frontendUrl}/settings/instagram?error=missing_params`);
  }

  try {
    const result = await instagramOAuthService.handleOAuthCallback(code, state);

    console.log(`Successfully connected Instagram account: ${result.igUsername}`);

    return Response.redirect(
      `${frontendUrl}/settings/instagram?success=true&account=${encodeURIComponent(result.igUsername)}`,
    );
  } catch (error: any) {
    console.error(`OAuth callback failed: ${error?.message}`, error?.stack);
    return Response.redirect(`${frontendUrl}/settings/instagram?error=callback_failed`);
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

