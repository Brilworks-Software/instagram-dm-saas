'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Bot,
  Settings2,
  Play,
  Pause,
  MoreHorizontal,
  Plus,
  Instagram,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';

interface AIAutomation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  status: 'active' | 'paused' | 'draft';
  messagesHandled: number;
  instagramAccountId?: string;
  instagramUsername?: string;
}

interface InstagramAccount {
  id: string;
  igUsername: string;
  profilePictureUrl?: string;
  isActive: boolean;
}

const templates = [
  {
    name: 'Customer Support Bot',
    description: 'Handle common support queries automatically',
    icon: Bot,
  },
  {
    name: 'Lead Generator',
    description: 'Capture and qualify leads from DMs',
    icon: Zap,
  },
  {
    name: 'Order Status',
    description: 'Let customers check their order status',
    icon: MessageSquare,
  },
];

export default function AIStudioPage() {
  const [automations, setAutomations] = useState<AIAutomation[]>([]);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    trigger: 'New follower',
    accountId: '',
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

      // Fetch automations
      const { data: automationsData, error: automationsError } = await supabase
        .from('automations')
        .select(`
          *,
          instagram_account:instagram_accounts(ig_username)
        `)
        .order('created_at', { ascending: false });

      if (automationsError) {
        // Table might not exist yet, just log and continue
        console.warn('Error fetching automations (table may not exist):', automationsError);
        setAutomations([]);
      } else if (automationsData) {
        setAutomations(automationsData.map((auto: any) => ({
          id: auto.id,
          name: auto.name,
          description: auto.description || '',
          trigger: auto.trigger_type || 'New message',
          status: auto.is_active ? 'active' : 'paused',
          messagesHandled: auto.messages_handled || 0,
          instagramAccountId: auto.instagram_account_id,
          instagramUsername: auto.instagram_account?.ig_username,
        })));
      } else {
        setAutomations([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAutomation = async () => {
    if (!newAutomation.name || !newAutomation.accountId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const supabase = createClient();
      
      // Get workspace
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1)
        .single();

      if (!workspaces?.id) {
        alert('No workspace found');
        return;
      }

      // Build insert object with all required fields
      const insertData: any = {
        name: newAutomation.name,
        description: newAutomation.description || null,
        trigger_type: newAutomation.trigger,
        trigger_keywords: [], // Empty array for now, can be configured later
        instagram_account_id: newAutomation.accountId,
        workspace_id: workspaces.id,
        is_active: false,
        messages_handled: 0,
      };

      const { data, error } = await supabase
        .from('automations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating automation:', error);
        alert('Failed to create automation: ' + error.message);
        return;
      }

      setShowCreateModal(false);
      setNewAutomation({ name: '', description: '', trigger: 'New follower', accountId: '' });
      fetchData();
      alert('Automation created successfully!');
    } catch (error) {
      console.error('Error creating automation:', error);
      alert('Failed to create automation: ' + (error as Error).message);
    }
  };

  const toggleAutomationStatus = async (id: string, currentStatus: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('automations')
        .update({ is_active: currentStatus !== 'active' })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating automation:', error);
        alert('Failed to update automation: ' + error.message);
        return;
      }
      
      fetchData();
    } catch (error) {
      console.error('Error updating automation:', error);
      alert('Failed to update automation: ' + (error as Error).message);
    }
  };

  const getStatusColor = (status: AIAutomation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'paused':
        return 'bg-amber-500/20 text-amber-400';
      case 'draft':
        return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="AI Studio"
        subtitle="Create intelligent automations for your Instagram DMs"
        action={{
          label: 'Create Automation',
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
            <p className="text-amber-400/70 text-sm">Connect an Instagram account first to create automations</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.location.href = '/settings/instagram'}>
            <Instagram className="h-4 w-4" />
            Connect Account
          </Button>
        </div>
      )}

      {/* Quick Templates */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.name}
                onClick={() => {
                  setNewAutomation(prev => ({ ...prev, name: template.name, description: template.description }));
                  setShowCreateModal(true);
                }}
                className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-pink-500/50 hover:bg-zinc-900 transition-all text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-zinc-500">{template.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automations List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Automations</h2>
        {isLoading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-400">Loading automations...</p>
          </div>
        ) : automations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-12 text-center">
            <Bot className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No automations yet</h3>
            <p className="text-zinc-500 mb-6">Create your first AI automation to handle DMs automatically</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create Automation
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Automation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {automations.map((automation) => (
                  <tr
                    key={automation.id}
                    className={`hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                      selectedAutomation === automation.id ? 'bg-zinc-800/50' : ''
                    }`}
                    onClick={() => setSelectedAutomation(automation.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{automation.name}</p>
                        <p className="text-sm text-zinc-500 max-w-xs truncate">
                          {automation.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-400">
                        @{automation.instagramUsername || 'Not set'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-800 text-xs font-medium text-zinc-300">
                        {automation.trigger}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                        {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {automation.messagesHandled.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAutomationStatus(automation.id, automation.status);
                          }}
                          className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        >
                          {automation.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                          <Settings2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {automations.reduce((sum, a) => sum + a.messagesHandled, 0).toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500">Total messages automated</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {automations.filter(a => a.status === 'active').length}
              </p>
              <p className="text-sm text-zinc-500">Active automations</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{accounts.length}</p>
              <p className="text-sm text-zinc-500">Connected accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Create Automation</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Instagram Account</label>
                <select
                  value={newAutomation.accountId}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, accountId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-pink-500 outline-none"
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>@{acc.igUsername}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Welcome Message"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                <textarea
                  value={newAutomation.description}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What does this automation do?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-pink-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Trigger</label>
                <select
                  value={newAutomation.trigger}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, trigger: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-pink-500 outline-none"
                >
                  <option value="New follower">New follower</option>
                  <option value="New message">New message</option>
                  <option value="Keyword match">Keyword match</option>
                  <option value="Story mention">Story mention</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleCreateAutomation}
                disabled={!newAutomation.name || !newAutomation.accountId}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
