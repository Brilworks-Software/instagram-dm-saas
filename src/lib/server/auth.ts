import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/user-workspace';

/**
 * Gets the authenticated user and workspace from the request.
 * Returns null if not authenticated.
 */
export async function getAuthContext(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return null;
    }
    
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }
    
    return {
      userId: user.id,
      workspaceId: user.workspace_id,
      authUser,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Middleware helper to require authentication.
 * Returns the auth context or throws an error response.
 */
export async function requireAuth(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return Response.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  return auth;
}

