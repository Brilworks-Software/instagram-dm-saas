'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Workspace = Database['public']['Tables']['workspaces']['Row'];

/**
 * Client-side hook to get current user's workspace
 */
export function useUserWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const supabase = createClient();
        
        // Get current authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          setError(new Error('Not authenticated'));
          setIsLoading(false);
          return;
        }

        // Get user record with workspace
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('workspace_id, workspace:workspaces(*)')
          .eq('supabase_auth_id', authUser.id)
          .single();

        if (userError || !user) {
          setError(new Error('User not found'));
          setIsLoading(false);
          return;
        }

        const workspaceData = (Array.isArray(user.workspace) ? user.workspace[0] : user.workspace) as Workspace | null;
        setWorkspace(workspaceData);
        setWorkspaceId(user.workspace_id);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    }

    fetchWorkspace();
  }, []);

  return { workspace, workspaceId, isLoading, error };
}

/**
 * Fetch the whole user record for the current authenticated user.
 */
export async function getCurrentUserFromClientSide() {
  const supabase = createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new Error('Not authenticated');
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_auth_id', authUser.id)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Fetch a user record by their supabase_auth_id.
 * @param authId The Supabase Auth user ID
 */
export async function getUserByAuthId(authId: string) {
  const supabase = createClient();
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_auth_id', authId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  return user;
}

