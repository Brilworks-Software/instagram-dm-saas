// ============================================================================
// Core Types
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

// ============================================================================
// Instagram Types
// ============================================================================

export interface InstagramAccount {
  id: string;
  igUserId: string;
  igUsername: string;
  profilePictureUrl: string | null;
  isActive: boolean;
  dailyDmLimit: number;
  dmsSentToday: number;
  createdAt: string;
}

// ============================================================================
// Contact & Messaging Types
// ============================================================================

export interface Contact {
  id: string;
  igUserId: string;
  igUsername: string | null;
  name: string | null;
  profilePictureUrl: string | null;
  followerCount: number | null;
  isVerified: boolean;
  tags: string[];
  notes: string | null;
}

export type ConversationStatus = 'OPEN' | 'CLOSED' | 'SNOOZED' | 'ARCHIVED';

export interface Conversation {
  id: string;
  igThreadId?: string | null;
  status: ConversationStatus;
  lastMessageAt: string | null;
  unreadCount: number;
  isAutomationPaused: boolean;
  contact: Contact;
  instagramAccount: {
    id: string;
    igUsername: string;
  };
  lastMessage?: Message;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'STORY_REPLY' | 'STORY_MENTION' | 'QUICK_REPLY';
export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Message {
  id: string;
  igMessageId: string | null;
  content: string;
  messageType: MessageType;
  direction: MessageDirection;
  status: MessageStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  errorMessage: string | null;
  aiGenerated: boolean;
  createdAt: string;
  isFirstMessage?: boolean;
  isPendingApproval?: boolean;
  approvalStatus?: 'approved' | 'pending' | 'blocked' | 'unknown';
}

// ============================================================================
// Campaign Types
// ============================================================================

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  replyCount: number;
  createdAt: string;
}

export interface CampaignStep {
  id: string;
  stepOrder: number;
  name: string | null;
  messageTemplate: string | null;
  delayMinutes: number;
  delayHours: number;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  schedule_type: "IMMEDIATE" | "SPECIFIC_TIME";
  scheduled_at?: string; // ISO datetime string
  messages_per_day: number;
  timezone: string;
  time_frame: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  account_ids: string[];
  contact_ids: string[];
  steps: Array<{
    order: number;
    variants: string[]; // Array of message templates
    delay_days?: number; // Optional delay in days (follow-up only sends if no reply)
  }>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

