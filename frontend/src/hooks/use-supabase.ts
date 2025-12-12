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

// Workspace hook
export function useWorkspace() {
  return useSupabaseQuery<Tables['workspaces']['Row'][]>(
    async (supabase) => supabase.from('workspaces').select('*').limit(1),
    []
  );
}

// Instagram accounts hook
export function useInstagramAccounts(workspaceId?: string) {
  return useSupabaseQuery<Tables['instagram_accounts']['Row'][]>(
    async (supabase) => {
      let query = supabase.from('instagram_accounts').select('*');
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      return query.order('created_at', { ascending: false });
    },
    [workspaceId]
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

// Campaigns hook
export function useCampaigns(workspaceId?: string) {
  return useSupabaseQuery<Tables['campaigns']['Row'][]>(
    async (supabase) => {
      let query = supabase.from('campaigns').select('*');
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      return query.order('created_at', { ascending: false });
    },
    [workspaceId]
  );
}

// Contacts hook
export function useContacts(workspaceId?: string) {
  return useSupabaseQuery<Tables['contacts']['Row'][]>(
    async (supabase) => {
      let query = supabase.from('contacts').select('*');
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      return query.order('created_at', { ascending: false });
    },
    [workspaceId]
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

