'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

// Generic hook for Supabase queries
export function useSupabaseQuery<T>(
  queryFn: (supabase: ReturnType<typeof createClient>) => Promise<{ data: T | null; error: Error | null }>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await queryFn(supabase);
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// Workspace hook - gets current user's workspace
export function useWorkspace() {
  return useSupabaseQuery<Tables['workspaces']['Row'] | null>(
    async (supabase) => {
      // Get current authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { data: null, error: null };

      // Get user's workspace
      const { data: user } = await supabase
        .from('users')
        .select('workspace_id, workspace:workspaces(*)')
        .eq('supabase_auth_id', authUser.id)
        .single();

      if (!user || !user.workspace) return { data: null, error: null };
      
      const workspace = Array.isArray(user.workspace) ? user.workspace[0] : user.workspace;
      return { data: workspace as Tables['workspaces']['Row'], error: null };
    },
    []
  );
}

// Instagram accounts hook - automatically filters by user's workspace
export function useInstagramAccounts() {
  return useSupabaseQuery<Tables['instagram_accounts']['Row'][]>(
    async (supabase) => {
      // RLS policies will automatically filter by user's workspace
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data: data || [], error };
    },
    []
  );
}

// Conversations with contacts hook
export function useConversations(instagramAccountId?: string) {
  return useSupabaseQuery<Tables['conversations']['Row'][]>(
    async (supabase) => {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          instagram_account:instagram_accounts(id, ig_username)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      
      if (instagramAccountId) {
        query = query.eq('instagram_account_id', instagramAccountId);
      }
      
      return query;
    },
    [instagramAccountId]
  );
}

// Messages hook
export function useMessages(conversationId: string) {
  return useSupabaseQuery<Tables['messages']['Row'][]>(
    async (supabase) => 
      supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true }),
    [conversationId]
  );
}

// Campaigns hook - automatically filters by user's workspace
export function useCampaigns() {
  return useSupabaseQuery<Tables['campaigns']['Row'][]>(
    async (supabase) => {
      // RLS policies will automatically filter by user's workspace
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data: data || [], error };
    },
    []
  );
}

// Contacts hook - automatically filters by user's workspace
export function useContacts() {
  return useSupabaseQuery<Tables['contacts']['Row'][]>(
    async (supabase) => {
      // RLS policies will automatically filter by user's workspace
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data: data || [], error };
    },
    []
  );
}

// Send message function
export async function sendMessage(conversationId: string, content: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      content,
      direction: 'OUTBOUND',
      status: 'SENT',
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

// Mark conversation as read
export async function markConversationAsRead(conversationId: string) {
  const supabase = createClient();
  
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);
}

