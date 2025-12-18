'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, MessageSquare, Instagram, AlertCircle, Send, Plus, ChevronDown, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConversationList } from '@/components/inbox/conversation-list';
import { MessageThread } from '@/components/inbox/message-thread';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/types';

// All API calls use relative URLs since backend and frontend are on the same domain

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
  const [viewMode, setViewMode] = useState<'all' | 'account'>('account'); // 'all' for all inbox, 'account' for specific account
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [newDmUsername, setNewDmUsername] = useState('');
  const [newDmMessage, setNewDmMessage] = useState('');
  const [isSendingNewDm, setIsSendingNewDm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

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
    if (viewMode === 'account' && !selectedAccount) {
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    try {
      const supabase = createClient();
      
      // Build query based on view mode
      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          instagram_account:instagram_accounts(id, ig_username)
        `);
      
      // If viewing specific account, filter by account ID
      if (viewMode === 'account' && selectedAccount) {
        query = query.eq('instagram_account_id', selectedAccount.id);
      }
      // If viewing all, get all conversations (no filter)
      
      const { data, error } = await query
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
  }, [selectedAccount, viewMode]);

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

  // Load conversations when account or view mode changes
  useEffect(() => {
    if (viewMode === 'all' || selectedAccount) {
      fetchConversations();
    }
  }, [selectedAccount, viewMode, fetchConversations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };

    if (isAccountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAccountDropdownOpen]);

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
      
      // Insert new message into database
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          content,
          direction: 'OUTBOUND',
          status: 'PENDING',
          sent_at: new Date().toISOString(),
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
          
          // Check if user ID is valid (numeric) or use username fallback
          const userId = selectedConversation.contact.igUserId;
          const username = selectedConversation.contact.igUsername;
          const isValidUserId = userId && /^\d+$/.test(String(userId).trim());
          
          let response;
          let result;
          
          if (isValidUserId) {
            // Use user ID-based sending
            response = await fetch('/api/instagram/cookie/dm/send-by-id', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cookies,
                recipientUserId: userId,
                message: content,
                accountId: selectedAccount.id, // Pass account ID to update daily limit
              }),
            });
          } else if (username) {
            // Fallback to username-based sending
            console.log('Using username fallback for sending DM:', username);
            response = await fetch('/api/instagram/cookie/dm/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cookies,
                recipientUsername: username.replace('@', ''),
                message: content,
                accountId: selectedAccount.id, // Pass account ID to update daily limit
              }),
            });
          } else {
            throw new Error('No valid user ID or username available');
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to send`);
          }

          result = await response.json();
          
          if (result.success) {
            // Update message status to SENT
            await supabase
              .from('messages')
              .update({ status: 'SENT', ig_message_id: result.itemId })
              .eq('id', newMessage.id);

            setMessages(prev =>
              prev.map(m => m.id === newMessage.id ? { ...m, status: 'SENT', igMessageId: result.itemId } : m)
            );
            
            // Update conversation last message time
            await supabase
              .from('conversations')
              .update({ last_message_at: new Date().toISOString() })
              .eq('id', selectedConversation.id);
            
            // Refresh conversations to update the list and show new messages
            await fetchConversations();
            await fetchAccounts();
            
            // Refresh messages to show the updated message with correct status
            await fetchMessages(selectedConversation.id);
          } else {
            throw new Error(result.error || result.message || 'Failed to send');
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

      // Update conversation last_message_at (only if not already updated above)
      // This ensures the conversation appears at the top of the list
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      // Refresh conversations to update the side panel
      await fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [selectedConversation, selectedAccount, fetchConversations, fetchMessages, fetchAccounts]);

  // Handle sending new DM
  const handleSendNewDm = async () => {
    // For new DM, we need a specific account selected
    const accountToUse = selectedAccount || (accounts.length > 0 ? accounts[0] : null);
    if (!accountToUse || !newDmUsername || !newDmMessage) {
      if (!accountToUse) {
        toast.error('Account required', {
          description: 'Please select an Instagram account to send a message.',
        });
      }
      return;
    }

    setIsSendingNewDm(true);
    try {
      const supabase = createClient();
      const username = newDmUsername.replace('@', '').trim();
      
      // Get cookies from localStorage
      const cookiesStr = localStorage.getItem(`bulkdm_cookies_${accountToUse.igUserId}`);
      
      if (!cookiesStr) {
        toast.error('Session expired', {
          description: 'Please reconnect your Instagram account.',
        });
        setIsSendingNewDm(false);
        return;
      }

      const cookies = JSON.parse(cookiesStr);
      
      // First, get user info from Instagram
      let recipientInfo: any = null;
      try {
        const userResponse = await fetch(`/api/instagram/cookie/user/${username}`, {
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
      const response = await fetch('/api/instagram/cookie/dm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cookies,
          recipientUsername: username,
          message: newDmMessage,
          accountId: accountToUse.id, // Pass account ID to update daily limit
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Get current user's workspace
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          toast.error('Authentication required', {
            description: 'Please log in to continue.',
          });
          return;
        }

        const { data: user } = await supabase
          .from('users')
          .select('workspace_id')
          .eq('supabase_auth_id', authUser.id)
          .single();

        if (!user?.workspace_id) {
          toast.error('Workspace not found', {
            description: 'Please refresh the page and try again.',
          });
          return;
        }

        // Get valid user ID - only use numeric IDs, otherwise leave null
        const recipientUserId = recipientInfo?.pk || result.recipientId;
        const validUserId = recipientUserId && /^\d+$/.test(String(recipientUserId).trim()) 
          ? String(recipientUserId).trim() 
          : null;
        
        // Upsert contact (RLS will verify workspace_id)
        // Note: ig_user_id can be null if we don't have a valid numeric ID
        const { data: contact } = await supabase
          .from('contacts')
          .upsert({
            workspace_id: user.workspace_id,
            ig_user_id: validUserId, // Can be null if invalid
            ig_username: username,
            name: recipientInfo?.fullName || username,
            profile_picture_url: recipientInfo?.profilePicUrl,
          }, {
            onConflict: 'ig_username,workspace_id' // Use username as conflict key instead
          })
          .select()
          .single();

        if (contact) {
          // Upsert conversation
          const { data: conversation } = await supabase
            .from('conversations')
            .upsert({
              instagram_account_id: accountToUse.id,
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
              });
          }
        }

        setShowNewDmModal(false);
        setNewDmUsername('');
        setNewDmMessage('');
        
        // Refresh conversations and accounts (to update daily limit)
        await fetchConversations();
        await fetchAccounts();
        
        // Select the newly created conversation if it exists
        if (contact) {
            // Wait a moment for the conversation to be in the list
            setTimeout(async () => {
              const { data: updatedConversations } = await supabase
                .from('conversations')
                .select(`
                  *,
                  contact:contacts(*),
                  instagram_account:instagram_accounts(id, ig_username)
                `)
                .eq('instagram_account_id', accountToUse.id)
              .eq('contact_id', contact.id)
              .order('last_message_at', { ascending: false })
              .limit(1)
              .single();
            
            if (updatedConversations) {
              // Transform to match Conversation type
              const transformedConv: Conversation = {
                id: updatedConversations.id,
                status: updatedConversations.status,
                lastMessageAt: updatedConversations.last_message_at,
                unreadCount: updatedConversations.unread_count,
                isAutomationPaused: updatedConversations.is_automation_paused,
                contact: {
                  id: updatedConversations.contact.id,
                  igUserId: updatedConversations.contact.ig_user_id,
                  igUsername: updatedConversations.contact.ig_username,
                  name: updatedConversations.contact.name,
                  profilePictureUrl: updatedConversations.contact.profile_picture_url,
                  followerCount: updatedConversations.contact.follower_count,
                  isVerified: updatedConversations.contact.is_verified,
                  tags: updatedConversations.contact.tags || [],
                  notes: updatedConversations.contact.notes,
                },
                instagramAccount: {
                  id: updatedConversations.instagram_account.id,
                  igUsername: updatedConversations.instagram_account.ig_username,
                },
              };
              
              setSelectedConversation(transformedConv);
              await fetchMessages(transformedConv.id);
            }
          }, 500);
        }
        
        // Show success
        toast.success('Message sent!', {
          description: `Successfully sent message to @${username}`,
        });
      } else {
        toast.error('Failed to send message', {
          description: result.message || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error sending DM:', error);
      toast.error('Failed to send message', {
        description: (error as Error).message || 'Please try again.',
      });
    } finally {
      setIsSendingNewDm(false);
    }
  };

  // Sync Instagram inbox
  const handleSyncInbox = async (showAlert = true) => {
    if (!selectedAccount) {
      if (showAlert) {
        toast.error('Account required', {
          description: 'Please select an Instagram account first.',
        });
      }
      return;
    }

    const cookies = getCookies();
    if (!cookies) {
      if (showAlert) {
        toast.error('Session expired', {
          description: 'Please reconnect your Instagram account.',
        });
      }
      return;
    }

    setIsSyncing(true);
    try {
      // Get workspace ID
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        if (showAlert) {
          toast.error('Authentication required', {
            description: 'Please log in to continue.',
          });
        }
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('supabase_auth_id', authUser.id)
        .single();

      if (!user?.workspace_id) {
        if (showAlert) {
          toast.error('Workspace not found', {
            description: 'Please refresh the page and try again.',
          });
        }
        return;
      }

      const response = await fetch('/api/instagram/cookie/inbox/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cookies,
          accountId: selectedAccount.id,
          workspaceId: user.workspace_id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (showAlert) {
          toast.success('Inbox synced!', {
            description: `Synced ${result.syncedConversations} conversations and ${result.syncedMessages} messages.`,
          });
        }
        await fetchConversations();
        
        // Refresh messages if conversation is selected
        if (selectedConversation) {
          await fetchMessages(selectedConversation.id);
        }
      } else {
        if (showAlert) {
          toast.error('Sync failed', {
            description: result.error || 'Unknown error occurred.',
          });
        }
      }
    } catch (error) {
      console.error('Error syncing inbox:', error);
      if (showAlert) {
        toast.error('Failed to sync inbox', {
          description: 'Please try again later.',
        });
      }
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

  // Auto-poll for new messages every 30 seconds (only for specific account view)
  useEffect(() => {
    if (viewMode !== 'account' || !selectedAccount) return;

    const pollInterval = setInterval(async () => {
      try {
        // Auto-sync inbox (silent, no alert)
        await handleSyncInbox(false);
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [selectedAccount?.id, viewMode]); // Only depend on account ID and view mode

  // Auto-sync inbox when account changes (initial sync)
  useEffect(() => {
    if (viewMode === 'account' && selectedAccount) {
      // Sync inbox when account is selected (with a small delay to avoid rate limits)
      const syncTimer = setTimeout(() => {
        handleSyncInbox(false); // Silent sync on account change
      }, 2000);
      return () => clearTimeout(syncTimer);
    }
  }, [selectedAccount?.id, viewMode]); // Only sync when account ID or view mode changes

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
          {/* Enhanced Account Selector */}
          {accounts.length > 0 && (
            <div className="p-4 border-b border-border bg-background-elevated/50">
              <label className="block text-xs font-medium text-foreground-muted mb-2">
                View Inbox
              </label>
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-medium hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {viewMode === 'all' ? (
                      <>
                        <Users className="h-4 w-4 text-accent" />
                        <span>All Inbox</span>
                        <span className="text-xs text-foreground-muted ml-1">
                          ({conversations.length})
                        </span>
                      </>
                    ) : selectedAccount ? (
                      <>
                        <Instagram className="h-4 w-4 text-accent" />
                        <span>@{selectedAccount.igUsername}</span>
                        <span className="text-xs text-foreground-muted ml-1">
                          ({conversations.length})
                        </span>
                      </>
                    ) : (
                      <span>Select account</span>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-foreground-muted transition-transform",
                    isAccountDropdownOpen && "transform rotate-180"
                  )} />
                </button>

                {isAccountDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-background-elevated border border-border rounded-lg shadow-xl overflow-hidden">
                    {/* All Inbox Option */}
                    <button
                      onClick={() => {
                        setViewMode('all');
                        setSelectedAccount(null);
                        setSelectedConversation(null);
                        setIsAccountDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-background-secondary transition-colors",
                        viewMode === 'all' && "bg-background-secondary border-l-2 border-accent"
                      )}
                    >
                      <Users className={cn(
                        "h-4 w-4",
                        viewMode === 'all' ? "text-accent" : "text-foreground-muted"
                      )} />
                      <span className={cn(
                        "text-sm font-medium flex-1",
                        viewMode === 'all' ? "text-foreground" : "text-foreground-muted"
                      )}>
                        All Inbox
                      </span>
                      {viewMode === 'all' && (
                        <Check className="h-4 w-4 text-accent" />
                      )}
                    </button>

                    {/* Divider */}
                    {accounts.length > 0 && (
                      <div className="border-t border-border my-1" />
                    )}

                    {/* Account List */}
                    <div className="max-h-64 overflow-y-auto">
                      {accounts.map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setViewMode('account');
                            setSelectedAccount(acc);
                            setSelectedConversation(null);
                            setIsAccountDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-background-secondary transition-colors",
                            viewMode === 'account' && selectedAccount?.id === acc.id && "bg-background-secondary border-l-2 border-accent"
                          )}
                        >
                          <Instagram className={cn(
                            "h-4 w-4",
                            viewMode === 'account' && selectedAccount?.id === acc.id ? "text-accent" : "text-foreground-muted"
                          )} />
                          <span className={cn(
                            "text-sm font-medium flex-1",
                            viewMode === 'account' && selectedAccount?.id === acc.id ? "text-foreground" : "text-foreground-muted"
                          )}>
                            @{acc.igUsername}
                          </span>
                          {viewMode === 'account' && selectedAccount?.id === acc.id && (
                            <Check className="h-4 w-4 text-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-foreground-subtle mt-2">
                {viewMode === 'all' 
                  ? `${accounts.length} account${accounts.length > 1 ? 's' : ''} connected`
                  : selectedAccount && `Viewing @${selectedAccount.igUsername} inbox`
                }
              </p>
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
                onClick={() => {
                  if (viewMode === 'all') {
                    toast.info('Sync individual accounts', {
                      description: 'Please select a specific account to sync its inbox.',
                    });
                  } else {
                    handleSyncInbox(true);
                  }
                }}
                disabled={isSyncing || (viewMode === 'account' && !selectedAccount)}
                className="ml-auto"
                title={viewMode === 'all' ? 'Select an account to sync' : 'Sync messages from Instagram'}
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
