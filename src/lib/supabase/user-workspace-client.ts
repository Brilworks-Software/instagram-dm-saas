'use client';

import { createClient } from './client';
import type { Database } from '@/types/database';

type Workspace = Database['public']['Tables']['workspaces']['Row'];

/**
 * Client-side function to get or create user's workspace
 * This ensures the user always has a workspace
 */
export async function getOrCreateUserWorkspaceId(): Promise<string | null> {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    console.error('Not authenticated:', authError);
    return null;
  }

  console.log('Authenticated user:', authUser.id, authUser.email);

  // Get user record from users table
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('workspace_id, workspace:workspaces(*), email, name')
    .eq('supabase_auth_id', authUser.id)
    .single();

  console.log('User lookup result:', { user, userError });

  // If user doesn't exist, create user and workspace
  if (userError || !user) {
    console.log('User not found in database, creating workspace...');
    
    const email = authUser.email || '';
    const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
    const workspaceSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: name || email.split('@')[0] || 'My Workspace',
        slug: workspaceSlug,
      })
      .select()
      .single();

    if (workspaceError || !workspace) {
      console.error('Error creating workspace:', workspaceError);
      return null;
    }

    // Create user record linked to workspace
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert({
        email,
        supabase_auth_id: authUser.id,
        workspace_id: workspace.id,
        name: name || null,
        role: 'OWNER',
      })
      .select()
      .single();

    if (newUserError || !newUser) {
      console.error('Error creating user:', newUserError);
      console.error('User error details:', JSON.stringify(newUserError, null, 2));
      // Cleanup workspace if user creation fails
      await supabase.from('workspaces').delete().eq('id', workspace.id);
      return null;
    }

    return workspace.id;
  }

  // If user exists but has no workspace, create one
  if (!user.workspace_id || !user.workspace) {
    console.log('User has no workspace, creating one...');
    
    const email = user.email || authUser.email || '';
    const workspaceSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: user.name || email.split('@')[0] || 'My Workspace',
        slug: workspaceSlug,
      })
      .select()
      .single();

    if (workspaceError || !workspace) {
      console.error('Error creating workspace:', workspaceError);
      return null;
    }

    // Update user with workspace_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ workspace_id: workspace.id })
      .eq('supabase_auth_id', authUser.id);

    if (updateError) {
      console.error('Error updating user with workspace:', updateError);
      return null;
    }

    return workspace.id;
  }

  return user.workspace_id;
}

