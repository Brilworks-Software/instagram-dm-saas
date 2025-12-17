'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Play, Pause, MoreVertical, Users, Send, MessageCircle, Instagram, AlertCircle, X, Trash2, Check } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import type { Campaign, CampaignStatus } from '@/types';
import { usePostHog } from '@/hooks/use-posthog';

interface InstagramAccount {
  id: string;
  igUsername: string;
  profilePictureUrl?: string;
  isActive: boolean;
}

const statusColors: Record<CampaignStatus, { variant: 'default' | 'success' | 'warning' | 'error' | 'accent'; label: string }> = {
  DRAFT: { variant: 'default', label: 'Draft' },
  SCHEDULED: { variant: 'warning', label: 'Scheduled' },
  RUNNING: { variant: 'accent', label: 'Running' },
  PAUSED: { variant: 'warning', label: 'Paused' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'error', label: 'Cancelled' },
};

interface Contact {
  id: string;
  igUserId: string;
  igUsername: string;
  name?: string;
  profilePictureUrl?: string;
}

export default function CampaignsPage() {
  const { capture } = usePostHog();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1: Basic info, 2: Select recipients, 3: Message template
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    accountId: '',
    messageTemplate: '',
    selectedContactIds: [] as string[],
    selectedLeadIds: [] as string[],
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch Instagram accounts
      const { data: accountsData } = await supabase
        .from('instagram_accounts')
        .select('id, ig_username, profile_picture_url, is_active')
        .eq('is_active', true);

      if (accountsData) {
        setAccounts(accountsData.map(acc => ({
          id: acc.id,
          igUsername: acc.ig_username,
          profilePictureUrl: acc.profile_picture_url,
          isActive: acc.is_active,
        })));
      }

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('id, ig_user_id, ig_username, name, profile_picture_url')
        .order('created_at', { ascending: false });

      if (contactsData) {
        setContacts(contactsData.map(c => ({
          id: c.id,
          igUserId: c.ig_user_id,
          igUsername: c.ig_username || '',
          name: c.name,
          profilePictureUrl: c.profile_picture_url,
        })));
      }

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, ig_user_id, ig_username, full_name, profile_pic_url')
        .order('created_at', { ascending: false });

      if (leadsData) {
        setLeads(leadsData.map(l => ({
          id: l.id,
          igUserId: l.ig_user_id,
          igUsername: l.ig_username || '',
          name: l.full_name,
          profilePictureUrl: l.profile_pic_url,
        })));
      }

      // Fetch campaigns with account info
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          instagram_account:instagram_accounts(ig_username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedCampaigns: Campaign[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        status: c.status,
        scheduledAt: c.scheduled_at,
        startedAt: c.started_at,
        completedAt: c.completed_at,
        totalRecipients: c.total_recipients,
        sentCount: c.sent_count,
        failedCount: c.failed_count,
        replyCount: c.reply_count,
        createdAt: c.created_at,
        instagramUsername: c.instagram_account?.ig_username,
      }));

      setCampaigns(transformedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.accountId || !newCampaign.messageTemplate) return;
    
    const totalRecipients = newCampaign.selectedContactIds.length + newCampaign.selectedLeadIds.length;
    if (totalRecipients === 0) {
      alert('Please select at least one contact or lead');
      return;
    }

    try {
      const supabase = createClient();
      
      // Get current user's workspace (RLS will ensure it's the correct one)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('Please log in to create a campaign');
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('supabase_auth_id', authUser.id)
        .single();

      if (!user?.workspace_id) {
        console.error('No workspace found');
        alert('No workspace found. Please contact support.');
        return;
      }

      // Create campaign (RLS will verify workspace_id matches user's workspace)
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: newCampaign.name,
          description: newCampaign.description,
          workspace_id: user.workspace_id,
          instagram_account_id: newCampaign.accountId,
          status: 'DRAFT',
          total_recipients: totalRecipients,
          sent_count: 0,
          failed_count: 0,
          reply_count: 0,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const campaignId = campaignData.id;

      // Create campaign step
      const { error: stepError } = await supabase
        .from('campaign_steps')
        .insert({
          campaign_id: campaignId,
          step_order: 1,
          message_template: newCampaign.messageTemplate,
          delay_minutes: 0,
        });

      if (stepError) throw stepError;

      // Add contacts as recipients
      if (newCampaign.selectedContactIds.length > 0) {
        const contactRecipients = newCampaign.selectedContactIds.map(contactId => ({
          campaign_id: campaignId,
          contact_id: contactId,
          status: 'PENDING',
          current_step_order: 0,
        }));

        const { error: contactRecipientsError } = await supabase
          .from('campaign_recipients')
          .insert(contactRecipients);

        if (contactRecipientsError) throw contactRecipientsError;
      }

      // Add leads as recipients (first convert leads to contacts if needed)
      if (newCampaign.selectedLeadIds.length > 0) {
        for (const leadId of newCampaign.selectedLeadIds) {
          const lead = leads.find(l => l.id === leadId);
          if (!lead) continue;

          // Check if contact exists, if not create it
          let contact = contacts.find(c => c.igUserId === lead.igUserId);
          
          if (!contact) {
            // Create contact from lead
            const { data: newContact, error: contactError } = await supabase
              .from('contacts')
              .insert({
                workspace_id: user.workspace_id,
                ig_user_id: lead.igUserId,
                ig_username: lead.igUsername,
                name: lead.name,
                profile_picture_url: lead.profilePictureUrl,
              })
              .select()
              .single();

            if (contactError) {
              console.error('Error creating contact from lead:', contactError);
              continue;
            }
            contact = {
              id: newContact.id,
              igUserId: newContact.ig_user_id,
              igUsername: newContact.ig_username || '',
              name: newContact.name,
              profilePictureUrl: newContact.profile_picture_url,
            };
          }

          // Add as recipient
          const { error: recipientError } = await supabase
            .from('campaign_recipients')
            .insert({
              campaign_id: campaignId,
              contact_id: contact.id,
              status: 'PENDING',
              current_step_order: 0,
            });

          if (recipientError) {
            console.error('Error adding lead as recipient:', recipientError);
          }
        }
      }

      setShowCreateModal(false);
      setCreateStep(1);
      setNewCampaign({ 
        name: '', 
        description: '', 
        accountId: '', 
        messageTemplate: '',
        selectedContactIds: [],
        selectedLeadIds: [],
      });
      
      // Track campaign creation
      capture('campaign_created', {
        campaign_id: campaignId,
        total_recipients: totalRecipients,
        contacts_count: newCampaign.selectedContactIds.length,
        leads_count: newCampaign.selectedLeadIds.length,
        has_description: !!newCampaign.description,
      });
      
      fetchData();
      alert(`Campaign "${newCampaign.name}" created successfully with ${totalRecipients} recipients!`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      capture('campaign_creation_failed', {
        error: (error as Error).message,
      });
      alert('Failed to create campaign: ' + (error as Error).message);
    }
  };

  const handleUpdateStatus = async (campaignId: string, newStatus: CampaignStatus) => {
    try {
      const supabase = createClient();
      const updates: Record<string, string> = { status: newStatus };
      
      if (newStatus === 'RUNNING') {
        updates.started_at = new Date().toISOString();
      } else if (newStatus === 'COMPLETED') {
        updates.completed_at = new Date().toISOString();
      }

      await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId);

      // Track status update
      const campaign = campaigns.find(c => c.id === campaignId);
      capture('campaign_status_updated', {
        campaign_id: campaignId,
        old_status: campaign?.status,
        new_status: newStatus,
        total_recipients: campaign?.totalRecipients || 0,
      });

      // If starting campaign, trigger processing
      if (newStatus === 'RUNNING') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/campaigns/${campaignId}/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(typeof window !== 'undefined' && localStorage.getItem('workspaceId') ? {
                'x-workspace-id': localStorage.getItem('workspaceId') || '',
              } : {}),
              ...(typeof window !== 'undefined' && localStorage.getItem('userId') ? {
                'x-user-id': localStorage.getItem('userId') || '',
              } : {}),
            },
          });
          
          if (!response.ok) {
            console.warn('Failed to start campaign processing');
          } else {
            // Poll for updates
            setTimeout(() => fetchData(), 2000);
          }
        } catch (processError) {
          console.error('Failed to start campaign processing:', processError);
        }
      }

      // Send notification about campaign completion (after status update succeeds)
      if (newStatus === 'COMPLETED') {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (campaign) {
          try {
            // Call the notification endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/notifications/campaign-complete`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Add auth headers if needed
                ...(typeof window !== 'undefined' && localStorage.getItem('workspaceId') ? {
                  'x-workspace-id': localStorage.getItem('workspaceId') || '',
                } : {}),
                ...(typeof window !== 'undefined' && localStorage.getItem('userId') ? {
                  'x-user-id': localStorage.getItem('userId') || '',
                } : {}),
              },
              body: JSON.stringify({
                campaignId: campaignId,
                campaignName: campaign.name,
              }),
            });
            
            if (!response.ok) {
              console.warn('Failed to send campaign completion notification');
            }
          } catch (notifError) {
            console.error('Failed to send campaign completion notification:', notifError);
            // Don't fail the status update if notification fails
          }
        }
      }

      setCampaigns(prev =>
        prev.map(c => c.id === campaignId ? { ...c, status: newStatus, ...updates } : c)
      );
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const supabase = createClient();
      await supabase.from('campaigns').delete().eq('id', campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Campaigns"
        subtitle="Create and manage your DM outreach campaigns"
        action={{
          label: 'New Campaign',
          onClick: () => setShowCreateModal(true),
        }}
      />

      <div className="p-6">
        {/* No Accounts Warning */}
        {!isLoading && accounts.length === 0 && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-amber-400 font-medium">No Instagram accounts connected</p>
              <p className="text-amber-400/70 text-sm">Connect an Instagram account first to create campaigns</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/settings/instagram'}>
              <Instagram className="h-4 w-4" />
              Connect Account
            </Button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Campaigns', value: campaigns.length, icon: Send, color: 'text-accent' },
            { label: 'Active', value: campaigns.filter(c => c.status === 'RUNNING').length, icon: Play, color: 'text-success' },
            { label: 'Total Recipients', value: campaigns.reduce((sum, c) => sum + c.totalRecipients, 0), icon: Users, color: 'text-foreground' },
            { label: 'Reply Rate', value: campaigns.length > 0 ? `${Math.round((campaigns.reduce((sum, c) => sum + c.replyCount, 0) / Math.max(campaigns.reduce((sum, c) => sum + c.sentCount, 0), 1)) * 100)}%` : '0%', icon: MessageCircle, color: 'text-accent' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-background-secondary rounded-xl border border-border p-5 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-foreground-muted text-sm">{stat.label}</span>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Campaign List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-background-secondary rounded-xl border border-border p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 bg-background-elevated rounded" />
                    <div className="h-4 w-72 bg-background-elevated rounded" />
                    <div className="h-2 w-full bg-background-elevated rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : campaigns?.length ? (
          <div className="space-y-4">
            {campaigns.map((campaign, index) => {
              const progress = campaign.totalRecipients > 0
                ? (campaign.sentCount / campaign.totalRecipients) * 100
                : 0;
              const replyRate = campaign.sentCount > 0
                ? ((campaign.replyCount / campaign.sentCount) * 100).toFixed(1)
                : 0;
              const statusInfo = statusColors[campaign.status];

              return (
                <div
                  key={campaign.id}
                  className={cn(
                    'bg-background-secondary rounded-xl border border-border p-6 transition-all hover:border-border-hover',
                    'animate-slide-up'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {campaign.name}
                        </h3>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                        {(campaign as any).instagramUsername && (
                          <span className="text-sm text-foreground-muted">
                            @{(campaign as any).instagramUsername}
                          </span>
                        )}
                      </div>

                      {campaign.description && (
                        <p className="text-sm text-foreground-muted mb-4">
                          {campaign.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      {campaign.status !== 'DRAFT' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
                            <span>Progress</span>
                            <span>{campaign.sentCount} / {campaign.totalRecipients} sent</span>
                          </div>
                          <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-foreground-subtle" />
                          <span className="text-foreground-muted">
                            {campaign.totalRecipients} recipients
                          </span>
                        </div>
                        {campaign.status !== 'DRAFT' && (
                          <>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4 text-foreground-subtle" />
                              <span className="text-foreground-muted">
                                {campaign.replyCount} replies ({replyRate}%)
                              </span>
                            </div>
                            {campaign.failedCount > 0 && (
                              <div className="flex items-center gap-2 text-error">
                                <span>{campaign.failedCount} failed</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {campaign.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(campaign.id, 'RUNNING')}>
                          <Play className="h-4 w-4" />
                          Start
                        </Button>
                      )}
                      {campaign.status === 'RUNNING' && (
                        <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(campaign.id, 'PAUSED')}>
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      )}
                      {campaign.status === 'PAUSED' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(campaign.id, 'RUNNING')}>
                          <Play className="h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-background-elevated flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-foreground-subtle" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No campaigns yet</h3>
            <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
              Create your first DM campaign to start reaching out to potential collaborators
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Create Campaign</h2>
                <p className="text-sm text-foreground-muted mt-1">
                  Step {createStep} of 3
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateStep(1);
                  setNewCampaign({ 
                    name: '', 
                    description: '', 
                    accountId: '', 
                    messageTemplate: '',
                    selectedContactIds: [],
                    selectedLeadIds: [],
                  });
                }} 
                className="text-foreground-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Basic Info */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">Instagram Account *</label>
                    <select
                      value={newCampaign.accountId}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, accountId: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-accent outline-none"
                    >
                      <option value="">Select account</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>@{acc.igUsername}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">Campaign Name *</label>
                    <input
                      type="text"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Holiday Promotion"
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">Description</label>
                    <textarea
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What is this campaign about?"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Select Recipients */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">Select Contacts</h3>
                    <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 space-y-2">
                      {contacts.length === 0 ? (
                        <p className="text-sm text-foreground-muted text-center py-4">No contacts available</p>
                      ) : (
                        contacts.map(contact => (
                          <label
                            key={contact.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-elevated cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={newCampaign.selectedContactIds.includes(contact.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewCampaign(prev => ({
                                    ...prev,
                                    selectedContactIds: [...prev.selectedContactIds, contact.id]
                                  }));
                                } else {
                                  setNewCampaign(prev => ({
                                    ...prev,
                                    selectedContactIds: prev.selectedContactIds.filter(id => id !== contact.id)
                                  }));
                                }
                              }}
                              className="rounded border-border"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {contact.profilePictureUrl && (
                                <img 
                                  src={contact.profilePictureUrl} 
                                  alt={contact.igUsername}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {contact.name || contact.igUsername}
                                </p>
                                <p className="text-xs text-foreground-muted">@{contact.igUsername}</p>
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">Select Leads</h3>
                    <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 space-y-2">
                      {leads.length === 0 ? (
                        <p className="text-sm text-foreground-muted text-center py-4">No leads available</p>
                      ) : (
                        leads.map(lead => (
                          <label
                            key={lead.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-elevated cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={newCampaign.selectedLeadIds.includes(lead.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewCampaign(prev => ({
                                    ...prev,
                                    selectedLeadIds: [...prev.selectedLeadIds, lead.id]
                                  }));
                                } else {
                                  setNewCampaign(prev => ({
                                    ...prev,
                                    selectedLeadIds: prev.selectedLeadIds.filter(id => id !== lead.id)
                                  }));
                                }
                              }}
                              className="rounded border-border"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {lead.profilePictureUrl && (
                                <img 
                                  src={lead.profilePictureUrl} 
                                  alt={lead.igUsername}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {lead.name || lead.igUsername}
                                </p>
                                <p className="text-xs text-foreground-muted">@{lead.igUsername}</p>
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-foreground-subtle mt-2">
                      Selected: {newCampaign.selectedContactIds.length + newCampaign.selectedLeadIds.length} recipients
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Message Template */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">Message Template *</label>
                    <textarea
                      value={newCampaign.messageTemplate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, messageTemplate: e.target.value }))}
                      placeholder="Hi {{name}}, I wanted to reach out about..."
                      rows={8}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder-foreground-subtle focus:border-accent outline-none resize-none"
                    />
                    <p className="text-xs text-foreground-subtle mt-1">
                      Use {`{{name}}`} for personalization. This will be replaced with the contact's name or username.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              {createStep > 1 && (
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => setCreateStep(createStep - 1)}
                >
                  Back
                </Button>
              )}
              {createStep < 3 ? (
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    if (createStep === 1 && (!newCampaign.name || !newCampaign.accountId)) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    setCreateStep(createStep + 1);
                  }}
                  disabled={createStep === 1 && (!newCampaign.name || !newCampaign.accountId)}
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateStep(1);
                      setNewCampaign({ 
                        name: '', 
                        description: '', 
                        accountId: '', 
                        messageTemplate: '',
                        selectedContactIds: [],
                        selectedLeadIds: [],
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleCreateCampaign}
                    disabled={!newCampaign.messageTemplate || (newCampaign.selectedContactIds.length === 0 && newCampaign.selectedLeadIds.length === 0)}
                  >
                    Create Campaign
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
