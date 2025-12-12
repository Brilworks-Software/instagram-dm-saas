'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Instagram,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalMessages: number;
  activeConversations: number;
  totalCampaigns: number;
  connectedAccounts: number;
  replyRate: number;
}

interface CampaignStat {
  name: string;
  sent: number;
  replyRate: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMessages: 0,
    activeConversations: 0,
    totalCampaigns: 0,
    connectedAccounts: 0,
    replyRate: 0,
  });
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [messagesByDay, setMessagesByDay] = useState<{ day: string; messages: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Fetch counts in parallel
      const [messagesResult, conversationsResult, campaignsResult, accountsResult] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('status', 'OPEN'),
        supabase.from('campaigns').select('id, name, sent_count, reply_count', { count: 'exact' }),
        supabase.from('instagram_accounts').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      // Calculate analytics
      const totalMessages = messagesResult.count || 0;
      const activeConversations = conversationsResult.count || 0;
      const totalCampaigns = campaignsResult.count || 0;
      const connectedAccounts = accountsResult.count || 0;

      // Calculate reply rate from campaigns
      const campaignData = campaignsResult.data || [];
      const totalSent = campaignData.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const totalReplies = campaignData.reduce((sum, c) => sum + (c.reply_count || 0), 0);
      const replyRate = totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0;

      setAnalytics({
        totalMessages,
        activeConversations,
        totalCampaigns,
        connectedAccounts,
        replyRate,
      });

      // Get top campaigns
      const topCampaigns: CampaignStat[] = campaignData
        .filter(c => c.sent_count > 0)
        .map(c => ({
          name: c.name,
          sent: c.sent_count || 0,
          replyRate: c.sent_count > 0 ? Math.round(((c.reply_count || 0) / c.sent_count) * 100) : 0,
        }))
        .sort((a, b) => b.replyRate - a.replyRate)
        .slice(0, 4);

      setCampaigns(topCampaigns);

      // Fetch messages by day for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: messagesData } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Group by day
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const messagesByDayMap = new Map<string, number>();
      
      // Initialize all days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        messagesByDayMap.set(dayName, 0);
      }

      // Count messages per day
      (messagesData || []).forEach(msg => {
        const date = new Date(msg.created_at);
        const dayName = dayNames[date.getDay()];
        messagesByDayMap.set(dayName, (messagesByDayMap.get(dayName) || 0) + 1);
      });

      setMessagesByDay(Array.from(messagesByDayMap.entries()).map(([day, messages]) => ({ day, messages })));

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = [
    {
      name: 'Total Messages',
      value: analytics.totalMessages.toLocaleString(),
      change: '+0%',
      trend: 'up',
      icon: MessageSquare,
    },
    {
      name: 'Active Conversations',
      value: analytics.activeConversations.toLocaleString(),
      change: '+0%',
      trend: 'up',
      icon: Users,
    },
    {
      name: 'Reply Rate',
      value: `${analytics.replyRate}%`,
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      name: 'Connected Accounts',
      value: analytics.connectedAccounts.toString(),
      change: '+0%',
      trend: 'up',
      icon: Instagram,
    },
  ];

  const maxValue = Math.max(...messagesByDay.map(d => d.messages), 1);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-zinc-400">Track your Instagram DM performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
          <Calendar className="h-4 w-4" />
          Last 7 days
        </button>
      </div>

      {/* No Accounts Warning */}
      {!isLoading && analytics.connectedAccounts === 0 && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-400 font-medium">No Instagram accounts connected</p>
            <p className="text-amber-400/70 text-sm">Connect an Instagram account to start tracking analytics</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.location.href = '/settings/instagram'}>
            <Instagram className="h-4 w-4" />
            Connect Account
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <div
              key={stat.name}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  <TrendIcon className="h-4 w-4" />
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {isLoading ? '...' : stat.value}
              </p>
              <p className="text-sm text-zinc-400">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Messages This Week</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-zinc-400">Loading...</p>
            </div>
          ) : messagesByDay.length > 0 ? (
            <div className="flex items-end justify-between h-48 gap-2">
              {messagesByDay.map((data) => (
                <div key={data.day} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-pink-500/80 to-purple-500/60 rounded-t-md transition-all hover:from-pink-500 hover:to-purple-500"
                    style={{ height: `${Math.max((data.messages / maxValue) * 100, 5)}%` }}
                  />
                  <span className="mt-2 text-xs text-zinc-500">{data.day}</span>
                  <span className="text-xs text-zinc-400">{data.messages}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-zinc-500">No message data available</p>
            </div>
          )}
        </div>

        {/* Top Campaigns */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Top Performing Campaigns</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-zinc-400">Loading...</p>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign, i) => (
                <div key={campaign.name} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-400">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{campaign.name}</p>
                    <p className="text-sm text-zinc-500">{campaign.sent} sent</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-400">{campaign.replyRate}%</p>
                    <p className="text-xs text-zinc-500">reply rate</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center flex-col">
              <BarChart3 className="h-12 w-12 text-zinc-600 mb-3" />
              <p className="text-zinc-500">No campaigns yet</p>
              <Button 
                size="sm" 
                variant="secondary" 
                className="mt-3"
                onClick={() => window.location.href = '/campaigns'}
              >
                Create Campaign
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
