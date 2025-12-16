import { createClient } from './server';
import type { Database } from '@/types/database';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type User = Database['public']['Tables']['users']['Row'];

/**
 * Get the current user's workspace
 * Creates a workspace if one doesn't exist
 * Returns null if user is not authenticated
 */
export async function getUserWorkspace(): Promise<Workspace | null> {
  const supabase = await createClient();
  
  // Get current authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    return null;
  }

  // Get user record from users table
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('workspace_id, workspace:workspaces(*), email, name')
    .eq('supabase_auth_id', authUser.id)
    .single();

  // If user doesn't exist, create user and workspace
  if (userError || !user) {
    console.log('User not found in database, creating workspace...');
    const result = await createUserWorkspace(
      authUser.id,
      authUser.email || '',
      authUser.user_metadata?.full_name || authUser.user_metadata?.name
    );
    
    if (!result) {
      console.error('Failed to create workspace for user');
      return null;
    }
    
    return result.workspace;
  }

  // If user exists but has no workspace, create one
  if (!user.workspace_id || !user.workspace) {
    console.log('User has no workspace, creating one...');
    
    const workspaceSlug = (user.email || authUser.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: user.name || user.email?.split('@')[0] || 'My Workspace',
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

    return workspace;
  }

  const workspace = Array.isArray(user.workspace) ? user.workspace[0] : user.workspace;
  return (workspace as Workspace) || null;
}

/**
 * Get the current user's workspace ID
 * Creates a workspace if one doesn't exist
 * Returns null if user is not authenticated
 */
export async function getUserWorkspaceId(): Promise<string | null> {
  const workspace = await getUserWorkspace();
  return workspace?.id || null;
}

/**
 * Ensure user has a workspace, creating one if needed
 * This is a helper function to guarantee workspace exists
 */
export async function ensureUserWorkspace(): Promise<{ workspace: Workspace; workspaceId: string } | null> {
  const workspace = await getUserWorkspace();
  if (!workspace) {
    return null;
  }
  return { workspace, workspaceId: workspace.id };
}

/**
 * Get the current authenticated user record
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_auth_id', authUser.id)
    .single();

  if (userError || !user) {
    return null;
  }

  return user;
}

/**
 * Create a workspace for a new user
 * Called during signup
 */
export async function createUserWorkspace(
  supabaseAuthId: string,
  email: string,
  name?: string
): Promise<{ workspace: Workspace; user: User } | null> {
  const supabase = await createClient();
  
  // Create workspace
  const workspaceSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: name || email.split('@')[0],
      slug: workspaceSlug,
    })
    .select()
    .single();

  if (workspaceError || !workspace) {
    console.error('Error creating workspace:', workspaceError);
    return null;
  }

  // Create user record linked to workspace
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email,
      supabase_auth_id: supabaseAuthId,
      workspace_id: workspace.id,
      name: name || null,
      role: 'OWNER',
    })
    .select()
    .single();

  if (userError || !user) {
    console.error('Error creating user:', userError);
    // Cleanup workspace if user creation fails
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    return null;
  }

  return { workspace, user };
}

