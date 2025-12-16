import type {
  InstagramAccount,
  Conversation,
  Message,
  Campaign,
} from '@/types';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private workspaceId: string | null = null;
  private userId: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuth(workspaceId: string, userId: string) {
    this.workspaceId = workspaceId;
    this.userId = userId;
  }

  private async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth headers (temporary - will be replaced with JWT)
    if (this.workspaceId) {
      headers['x-workspace-id'] = this.workspaceId;
    }
    if (this.userId) {
      headers['x-user-id'] = this.userId;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  // ==========================================================================
  // Instagram Accounts
  // ==========================================================================

  async getInstagramAccounts(): Promise<InstagramAccount[]> {
    return this.fetch<InstagramAccount[]>('/instagram/accounts');
  }

  async startInstagramOAuth(): Promise<{ authUrl: string }> {
    return this.fetch<{ authUrl: string }>('/instagram/oauth/start');
  }

  async disconnectInstagramAccount(accountId: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/instagram/accounts/${accountId}/disconnect`, {
      method: 'POST',
    });
  }

  // ==========================================================================
  // Conversations
  // ==========================================================================

  async getConversations(options?: {
    status?: string;
    accountId?: string;
    page?: number;
    limit?: number;
  }): Promise<Conversation[]> {
    return this.fetch<Conversation[]>('/inbox/conversations', {
      params: options,
    });
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return this.fetch<Conversation>(`/inbox/conversations/${conversationId}`);
  }

  async updateConversationStatus(
    conversationId: string,
    status: string
  ): Promise<Conversation> {
    return this.fetch<Conversation>(`/inbox/conversations/${conversationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ==========================================================================
  // Messages
  // ==========================================================================

  async getMessages(conversationId: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<Message[]> {
    return this.fetch<Message[]>(`/inbox/conversations/${conversationId}/messages`, {
      params: options,
    });
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return this.fetch<Message>(`/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markAsRead(conversationId: string): Promise<void> {
    return this.fetch<void>(`/inbox/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  }

  // ==========================================================================
  // Campaigns
  // ==========================================================================

  async getCampaigns(): Promise<Campaign[]> {
    return this.fetch<Campaign[]>('/campaigns');
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    return this.fetch<Campaign>(`/campaigns/${campaignId}`);
  }

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    return this.fetch<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(campaignId: string, data: Partial<Campaign>): Promise<Campaign> {
    return this.fetch<Campaign>(`/campaigns/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async startCampaign(campaignId: string): Promise<Campaign> {
    return this.fetch<Campaign>(`/campaigns/${campaignId}/start`, {
      method: 'POST',
    });
  }

  async pauseCampaign(campaignId: string): Promise<Campaign> {
    return this.fetch<Campaign>(`/campaigns/${campaignId}/pause`, {
      method: 'POST',
    });
  }

  // ==========================================================================
  // AI Features
  // ==========================================================================

  async generateDmTemplate(params: {
    offer: string;
    targetPersona: string;
    tone: string;
  }): Promise<{ template: string }> {
    return this.fetch<{ template: string }>('/ai/generate-template', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getSuggestedReplies(conversationId: string): Promise<{ suggestions: string[] }> {
    return this.fetch<{ suggestions: string[] }>(
      `/ai/conversations/${conversationId}/suggestions`
    );
  }

  // ==========================================================================
  // Notifications
  // ==========================================================================

  async getNotifications(options?: {
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    return this.fetch<any[]>('/notifications', {
      params: options,
    });
  }

  async getUnreadNotifications(limit?: number): Promise<any[]> {
    return this.fetch<any[]>('/notifications/unread', {
      params: { limit },
    });
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.fetch<{ count: number }>('/notifications/unread/count');
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async getNotificationPreferences(): Promise<any[]> {
    return this.fetch<any[]>('/notifications/preferences');
  }

  async updateNotificationPreference(
    type: string,
    preferences: { email?: boolean; push?: boolean; inApp?: boolean }
  ): Promise<any> {
    return this.fetch<any>(`/notifications/preferences/${type}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
