import type {
  InstagramAccount,
  Conversation,
  Message,
  Campaign,
} from '@/types';

// ============================================================================
// API Configuration
// ============================================================================

// Use empty string for relative URLs since backend and frontend are on the same domain
// All endpoints already include '/api/' prefix, so they work as relative paths

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private workspaceId: string | null = null;
  private userId: string | null = null;


  setAuth(workspaceId: string, userId: string) {
    this.workspaceId = workspaceId;
    this.userId = userId;
  }

  private async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    // Use endpoint directly as relative URL (backend and frontend are on same domain)
    let url = endpoint;
    
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
    return this.fetch<InstagramAccount[]>('/api/instagram/accounts');
  }

  async startInstagramOAuth(): Promise<{ authUrl: string }> {
    return this.fetch<{ authUrl: string }>('/api/instagram/oauth/start');
  }

  async disconnectInstagramAccount(accountId: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/api/instagram/accounts/${accountId}/disconnect`, {
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
    return this.fetch<Conversation[]>('/api/inbox/conversations', {
      params: options,
    });
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return this.fetch<Conversation>(`/api/inbox/conversations/${conversationId}`);
  }

  async updateConversationStatus(
    conversationId: string,
    status: string
  ): Promise<Conversation> {
    return this.fetch<Conversation>(`/api/inbox/conversations/${conversationId}/status`, {
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
    return this.fetch<Message[]>(`/api/inbox/conversations/${conversationId}/messages`, {
      params: options,
    });
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return this.fetch<Message>(`/api/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markAsRead(conversationId: string): Promise<void> {
    return this.fetch<void>(`/api/inbox/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  }

  // ==========================================================================
  // Campaigns
  // ==========================================================================

  async getCampaigns(): Promise<Campaign[]> {
    return this.fetch<Campaign[]>('/api/campaigns');
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    return this.fetch<Campaign>(`/api/campaigns/${campaignId}`);
  }

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    return this.fetch<Campaign>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(campaignId: string, data: Partial<Campaign>): Promise<Campaign> {
    return this.fetch<Campaign>(`/api/campaigns/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async startCampaign(campaignId: string): Promise<Campaign> {
    return this.fetch<Campaign>(`/api/campaigns/${campaignId}/start`, {
      method: 'POST',
    });
  }

  async pauseCampaign(campaignId: string): Promise<Campaign> {
    return this.fetch<Campaign>(`/api/campaigns/${campaignId}/pause`, {
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
    return this.fetch<{ template: string }>('/api/ai/generate-template', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getSuggestedReplies(conversationId: string): Promise<{ suggestions: string[] }> {
    return this.fetch<{ suggestions: string[] }>(
      `/api/ai/conversations/${conversationId}/suggestions`
    );
  }

  // ==========================================================================
  // Notifications
  // ==========================================================================

  async getNotifications(options?: {
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    return this.fetch<any[]>('/api/notifications', {
      params: options,
    });
  }

  async getUnreadNotifications(limit?: number): Promise<any[]> {
    return this.fetch<any[]>('/api/notifications/unread', {
      params: { limit },
    });
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.fetch<{ count: number }>('/api/notifications/unread/count');
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT',
    });
  }

  async getNotificationPreferences(): Promise<any[]> {
    return this.fetch<any[]>('/api/notifications/preferences');
  }

  async updateNotificationPreference(
    type: string,
    preferences: { email?: boolean; push?: boolean; inApp?: boolean }
  ): Promise<any> {
    return this.fetch<any>(`/api/notifications/preferences/${type}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

export const api = new ApiClient();