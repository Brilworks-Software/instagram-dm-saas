'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, MessageSquare, Instagram, AlertCircle, Send, Plus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConversationList } from '@/components/inbox/conversation-list';
import { MessageThread } from '@/components/inbox/message-thread';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface InstagramAccount {
  id: string;
  igUserId: string;
  igUsername: string;
  profilePictureUrl?: string;
  isActive: boolean;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [newDmUsername, setNewDmUsername] = useState('');
  const [newDmMessage, setNewDmMessage] = useState('');
  const [isSendingNewDm, setIsSendingNewDm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch Instagram accounts first
  const fetchAccounts = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('id, ig_user_id, ig_username, profile_picture_url, is_active, access_token')
        .eq('is_active', true);

      if (error) throw error;

      const transformedAccounts: InstagramAccount[] = (data || []).map((acc: any) => ({
        id: acc.id,
        igUserId: acc.ig_user_id,
        igUsername: acc.ig_username,
        profilePictureUrl: acc.profile_picture_url,
        isActive: acc.is_active,
      }));

      setAccounts(transformedAccounts);
      
      // Select first account by default
      if (transformedAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(transformedAccounts[0]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, [selectedAccount]);

  // Fetch conversations from Supabase
  const fetchConversations = useCallback(async () => {
    if (!selectedAccount) {
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          instagram_account:instagram_accounts(id, ig_username)
        `)
        .eq('instagram_account_id', selectedAccount.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Transform to match our Conversation type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedConversations: Conversation[] = (data || []).map((conv: any) => ({
        id: conv.id,
        status: conv.status,
        lastMessageAt: conv.last_message_at,
        unreadCount: conv.unread_count,
        isAutomationPaused: conv.is_automation_paused,
        contact: {
          id: conv.contact.id,
          igUserId: conv.contact.ig_user_id,
          igUsername: conv.contact.ig_username,
          name: conv.contact.name,
          profilePictureUrl: conv.contact.profile_picture_url,
          followerCount: conv.contact.follower_count,
          isVerified: conv.contact.is_verified,
          tags: conv.contact.tags || [],
          notes: conv.contact.notes,
        },
        instagramAccount: {
          id: conv.instagram_account.id,
          igUsername: conv.instagram_account.ig_username,
        },
      }));

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [selectedAccount]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform to match our Message type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        igMessageId: msg.ig_message_id,
        content: msg.content,
        messageType: msg.message_type,
        direction: msg.direction,
        status: msg.status,
        sentAt: msg.sent_at,
        deliveredAt: msg.delivered_at,
        readAt: msg.read_at,
        errorMessage: msg.error_message,
        aiGenerated: msg.ai_generated,
        createdAt: msg.created_at,
        isFirstMessage: msg.is_first_message,
        isPendingApproval: msg.is_pending_approval,
        approvalStatus: msg.approval_status,
      }));

      setMessages(transformedMessages);

      // Mark conversation as read
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      // Update local state
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Load accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Load conversations when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchConversations();
    }
  }, [selectedAccount, fetchConversations]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  }, [fetchMessages]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!selectedConversation || !selectedAccount) return;

    try {
      const supabase = createClient();
      
      // Get cookies from localStorage
      const cookiesStr = localStorage.getItem(`bulkdm_cookies_${selectedAccount.igUserId}`);
      
      // Check if this is the first message
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', selectedConversation.id)
        .eq('direction', 'OUTBOUND')
        .limit(1);
      
      const isFirstMessage = !existingMessages || existingMessages.length === 0;
      
      // Insert new message into database
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          content,
          direction: 'OUTBOUND',
          status: 'PENDING',
          sent_at: new Date().toISOString(),
          is_first_message: isFirstMessage,
          is_pending_approval: isFirstMessage, // First messages typically need approval
          approval_status: isFirstMessage ? 'pending' : 'approved',
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local messages immediately
      const transformedMessage: Message = {
        id: newMessage.id,
        igMessageId: newMessage.ig_message_id,
        content: newMessage.content,
        messageType: newMessage.message_type,
        direction: newMessage.direction,
        status: 'PENDING',
        sentAt: newMessage.sent_at,
        deliveredAt: newMessage.delivered_at,
        readAt: newMessage.read_at,
        errorMessage: newMessage.error_message,
        aiGenerated: newMessage.ai_generated,
        createdAt: newMessage.created_at,
      };

      setMessages(prev => [...prev, transformedMessage]);

      // If we have cookies, actually send via Instagram
      if (cookiesStr) {
        try {
          const cookies = JSON.parse(cookiesStr);
          const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/dm/send-by-id`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cookies,
              recipientUserId: selectedConversation.contact.igUserId,
              message: content,
            }),
          });

          const result = await response.json();
          
          if (result.success) {
            // Update message status to SENT
            await supabase
              .from('messages')
              .update({ status: 'SENT', ig_message_id: result.itemId })
              .eq('id', newMessage.id);

            setMessages(prev =>
              prev.map(m => m.id === newMessage.id ? { ...m, status: 'SENT' } : m)
            );
          } else {
            throw new Error(result.message || 'Failed to send');
          }
        } catch (sendError) {
          console.error('Error sending via Instagram:', sendError);
          // Update status to FAILED
          await supabase
            .from('messages')
            .update({ status: 'FAILED', error_message: (sendError as Error).message })
            .eq('id', newMessage.id);

          setMessages(prev =>
            prev.map(m => m.id === newMessage.id ? { ...m, status: 'FAILED' } : m)
          );
        }
      } else {
        // No cookies - just simulate sending
        setTimeout(async () => {
          await supabase
            .from('messages')
            .update({ status: 'SENT' })
            .eq('id', newMessage.id);

          setMessages(prev =>
            prev.map(m => m.id === newMessage.id ? { ...m, status: 'SENT' } : m)
          );
        }, 500);
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [selectedConversation, selectedAccount]);

  // Handle sending new DM
  const handleSendNewDm = async () => {
    if (!selectedAccount || !newDmUsername || !newDmMessage) return;

    setIsSendingNewDm(true);
    try {
      const supabase = createClient();
      const username = newDmUsername.replace('@', '').trim();
      
      // Get cookies from localStorage
      const cookiesStr = localStorage.getItem(`bulkdm_cookies_${selectedAccount.igUserId}`);
      
      if (!cookiesStr) {
        alert('Session expired. Please reconnect your Instagram account.');
        setIsSendingNewDm(false);
        return;
      }

      const cookies = JSON.parse(cookiesStr);
      
      // First, get user info from Instagram
      let recipientInfo: any = null;
      try {
        const userResponse = await fetch(`${BACKEND_URL}/api/instagram/cookie/user/${username}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies }),
        });
        const userResult = await userResponse.json();
        if (userResult.success) {
          recipientInfo = userResult.user;
        }
      } catch (e) {
        console.log('Could not fetch user info, continuing with username only');
      }

      // Send the DM
      const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/dm/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cookies,
          recipientUsername: username,
          message: newDmMessage,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Get current user's workspace
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          alert('Please log in');
          return;
        }

        const { data: user } = await supabase
          .from('users')
          .select('workspace_id')
          .eq('supabase_auth_id', authUser.id)
          .single();

        if (!user?.workspace_id) {
          alert('No workspace found');
          return;
        }

        const recipientUserId = recipientInfo?.pk || result.recipientId || `user_${username}`;
        
        // Upsert contact (RLS will verify workspace_id)
        const { data: contact } = await supabase
          .from('contacts')
          .upsert({
            workspace_id: user.workspace_id,
            ig_user_id: String(recipientUserId),
            ig_username: username,
            name: recipientInfo?.fullName || username,
            profile_picture_url: recipientInfo?.profilePicUrl,
          }, {
            onConflict: 'ig_user_id,workspace_id'
          })
          .select()
          .single();

        if (contact) {
          // Upsert conversation
          const { data: conversation } = await supabase
            .from('conversations')
            .upsert({
              instagram_account_id: selectedAccount.id,
              contact_id: contact.id,
              status: 'OPEN',
              last_message_at: new Date().toISOString(),
              unread_count: 0,
            }, {
              onConflict: 'instagram_account_id,contact_id'
            })
            .select()
            .single();

          if (conversation) {
            // Check if this is first message
            const { data: existingMsgs } = await supabase
              .from('messages')
              .select('id')
              .eq('conversation_id', conversation.id)
              .limit(1);
            
            const isFirstMessage = !existingMsgs || existingMsgs.length === 0;
            
            // Insert message
            await supabase
              .from('messages')
              .insert({
                conversation_id: conversation.id,
                content: newDmMessage,
                direction: 'OUTBOUND',
                status: 'SENT',
                sent_at: new Date().toISOString(),
                ig_message_id: result.itemId,
                is_first_message: isFirstMessage,
                is_pending_approval: isFirstMessage,
                approval_status: isFirstMessage ? 'pending' : 'approved',
              });
            
            // Update conversation tracking
            if (isFirstMessage) {
              await supabase
                .from('conversations')
                .update({
                  first_message_sent_at: new Date().toISOString(),
                  is_request_pending: true,
                })
                .eq('id', conversation.id);
            }
          }
        }

        setShowNewDmModal(false);
        setNewDmUsername('');
        setNewDmMessage('');
        
        // Refresh conversations
        await fetchConversations();
        
        // Show success
        alert(`Message sent to @${username}!`);
      } else {
        alert(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending DM:', error);
      alert('Failed to send message: ' + (error as Error).message);
    } finally {
      setIsSendingNewDm(false);
    }
  };

  // Sync Instagram inbox
  const handleSyncInbox = async () => {
    if (!selectedAccount) {
      alert('Please select an Instagram account first');
      return;
    }

    const cookies = getCookies();
    if (!cookies) {
      alert('Please reconnect your Instagram account');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/inbox/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cookies,
          accountId: selectedAccount.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Synced ${result.syncedConversations} conversations and ${result.syncedMessages} messages!`);
        await fetchConversations();
      } else {
        alert('Sync failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error syncing inbox:', error);
      alert('Failed to sync inbox');
    } finally {
      setIsSyncing(false);
    }
  };

  // Get cookies helper
  const getCookies = () => {
    if (!selectedAccount) return null;
    const cookiesStr = localStorage.getItem(`bulkdm_cookies_${selectedAccount.igUserId}`);
    return cookiesStr ? JSON.parse(cookiesStr) : null;
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    if (statusFilter !== 'all' && conv.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.contact.igUsername?.toLowerCase().includes(query) ||
        conv.contact.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Select first conversation when loaded
  useEffect(() => {
    if (filteredConversations.length > 0 && !selectedConversation) {
      handleSelectConversation(filteredConversations[0]);
    }
  }, [filteredConversations, selectedConversation, handleSelectConversation]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="h-screen flex flex-col">
      <Header
        title="Inbox"
        subtitle={`${totalUnread} unread messages`}
        action={{
          label: 'New DM',
          onClick: () => setShowNewDmModal(true),
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List Sidebar */}
        <div className="w-96 border-r border-border flex flex-col bg-background-secondary/30">
          {/* Account Selector */}
          {accounts.length > 0 && (
            <div className="p-4 border-b border-border bg-background-elevated/50">
              <label className="block text-xs font-medium text-foreground-muted mb-2">
                Instagram Account
              </label>
              <select
                value={selectedAccount?.id || ''}
                onChange={(e) => {
                  const acc = accounts.find(a => a.id === e.target.value);
                  if (acc) {
                    setSelectedAccount(acc);
                    setSelectedConversation(null);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    @{acc.igUsername} {acc.id === selectedAccount?.id ? '✓' : ''}
                  </option>
                ))}
              </select>
              {accounts.length > 1 && (
                <p className="text-xs text-foreground-subtle mt-1.5">
                  {accounts.length} account{accounts.length > 1 ? 's' : ''} connected
                </p>
              )}
            </div>
          )}

          {/* No Accounts Warning */}
          {accounts.length === 0 && !isLoadingConversations && (
            <div className="p-4 border-b border-border">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center text-center gap-2">
                <AlertCircle className="h-6 w-6 text-amber-400" />
                <p className="text-sm text-amber-400">No Instagram accounts connected</p>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => window.location.href = '/settings/instagram'}
                >
                  <Instagram className="h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="p-4 space-y-3 border-b border-border">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            <div className="flex items-center gap-2">
              {['all', 'OPEN', 'SNOOZED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    statusFilter === status
                      ? 'bg-accent text-white'
                      : 'bg-background-elevated text-foreground-muted hover:text-foreground'
                  )}
                >
                  {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}

              <Button
                size="sm"
                variant="secondary"
                onClick={handleSyncInbox}
                disabled={isSyncing || !selectedAccount}
                className="ml-auto"
                title="Sync messages from Instagram"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
            </div>
          </div>

          {isLoadingConversations ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-foreground-muted animate-pulse">Loading conversations...</div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedConversation?.id || null}
              onSelect={handleSelectConversation}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-foreground-subtle mx-auto mb-3" />
                <p className="text-foreground-muted text-sm">No conversations yet</p>
                <Button 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowNewDmModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Start a conversation
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 bg-background">
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingMessages}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-background-elevated flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-foreground-subtle" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">Select a conversation</h3>
                <p className="text-sm text-foreground-muted">
                  Choose a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New DM Modal */}
      {showNewDmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary rounded-2xl border border-border max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Send New DM</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Send From Account
                  {accounts.length > 1 && (
                    <span className="text-xs text-foreground-muted ml-2">
                      ({accounts.length} accounts available)
                    </span>
                  )}
                </label>
                <select
                  value={selectedAccount?.id || ''}
                  onChange={(e) => {
                    const acc = accounts.find(a => a.id === e.target.value);
                    if (acc) setSelectedAccount(acc);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      @{acc.igUsername} {acc.id === selectedAccount?.id ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">To Username</label>
                <input
                  type="text"
                  value={newDmUsername}
                  onChange={(e) => setNewDmUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">Message</label>
                <textarea
                  value={newDmMessage}
                  onChange={(e) => setNewDmMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowNewDmModal(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSendNewDm}
                disabled={!newDmUsername || !newDmMessage || isSendingNewDm}
              >
                {isSendingNewDm ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSendingNewDm ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
