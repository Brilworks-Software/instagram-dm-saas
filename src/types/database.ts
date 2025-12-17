export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campaign_recipients: {
        Row: {
          campaign_id: string
          contact_id: string
          created_at: string
          current_step_order: number
          error_message: string | null
          id: string
          last_processed_at: string | null
          next_process_at: string | null
          status: Database["public"]["Enums"]["CampaignRecipientStatus"]
          updated_at: string
        }
        Insert: {
          campaign_id: string
          contact_id: string
          created_at?: string
          current_step_order?: number
          error_message?: string | null
          id?: string
          last_processed_at?: string | null
          next_process_at?: string | null
          status?: Database["public"]["Enums"]["CampaignRecipientStatus"]
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          created_at?: string
          current_step_order?: number
          error_message?: string | null
          id?: string
          last_processed_at?: string | null
          next_process_at?: string | null
          status?: Database["public"]["Enums"]["CampaignRecipientStatus"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_steps: {
        Row: {
          campaign_id: string
          condition: Json | null
          created_at: string
          delay_minutes: number
          id: string
          message_template: string
          name: string | null
          step_order: number
          updated_at: string
        }
        Insert: {
          campaign_id: string
          condition?: Json | null
          created_at?: string
          delay_minutes?: number
          id?: string
          message_template: string
          name?: string | null
          step_order: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          condition?: Json | null
          created_at?: string
          delay_minutes?: number
          id?: string
          message_template?: string
          name?: string | null
          step_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          failed_count: number
          id: string
          instagram_account_id: string
          name: string
          reply_count: number
          scheduled_at: string | null
          sent_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["CampaignStatus"]
          target_audience: Json | null
          total_recipients: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          failed_count?: number
          id?: string
          instagram_account_id: string
          name: string
          reply_count?: number
          scheduled_at?: string | null
          sent_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["CampaignStatus"]
          target_audience?: Json | null
          total_recipients?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          failed_count?: number
          id?: string
          instagram_account_id?: string
          name?: string
          reply_count?: number
          scheduled_at?: string | null
          sent_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["CampaignStatus"]
          target_audience?: Json | null
          total_recipients?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_instagram_account_id_fkey"
            columns: ["instagram_account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          follower_count: number | null
          id: string
          ig_user_id: string
          ig_username: string | null
          is_verified: boolean
          name: string | null
          notes: string | null
          profile_picture_url: string | null
          tags: string[] | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          follower_count?: number | null
          id?: string
          ig_user_id: string
          ig_username?: string | null
          is_verified?: boolean
          name?: string | null
          notes?: string | null
          profile_picture_url?: string | null
          tags?: string[] | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          follower_count?: number | null
          id?: string
          ig_user_id?: string
          ig_username?: string | null
          is_verified?: boolean
          name?: string | null
          notes?: string | null
          profile_picture_url?: string | null
          tags?: string[] | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          ig_thread_id: string | null
          instagram_account_id: string
          is_automation_paused: boolean
          last_message_at: string | null
          status: Database["public"]["Enums"]["ConversationStatus"]
          unread_count: number
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          ig_thread_id?: string | null
          instagram_account_id: string
          is_automation_paused?: boolean
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["ConversationStatus"]
          unread_count?: number
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          ig_thread_id?: string | null
          instagram_account_id?: string
          is_automation_paused?: boolean
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["ConversationStatus"]
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_instagram_account_id_fkey"
            columns: ["instagram_account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_accounts: {
        Row: {
          access_token: string
          access_token_expires_at: string | null
          cookies: Json | null
          created_at: string
          daily_dm_limit: number
          dm_limit_reset_at: string | null
          dms_sent_today: number
          fb_page_id: string
          id: string
          ig_user_id: string
          ig_username: string
          is_active: boolean
          permissions: string[] | null
          profile_picture_url: string | null
          updated_at: string
          webhook_subscribed: boolean
          workspace_id: string
        }
        Insert: {
          access_token: string
          access_token_expires_at?: string | null
          cookies?: Json | null
          created_at?: string
          daily_dm_limit?: number
          dm_limit_reset_at?: string | null
          dms_sent_today?: number
          fb_page_id: string
          id?: string
          ig_user_id: string
          ig_username: string
          is_active?: boolean
          permissions?: string[] | null
          profile_picture_url?: string | null
          updated_at?: string
          webhook_subscribed?: boolean
          workspace_id: string
        }
        Update: {
          access_token?: string
          access_token_expires_at?: string | null
          cookies?: Json | null
          created_at?: string
          daily_dm_limit?: number
          dm_limit_reset_at?: string | null
          dms_sent_today?: number
          fb_page_id?: string
          id?: string
          ig_user_id?: string
          ig_username?: string
          is_active?: boolean
          permissions?: string[] | null
          profile_picture_url?: string | null
          updated_at?: string
          webhook_subscribed?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ai_generated: boolean
          campaign_step_id: string | null
          content: string
          conversation_id: string
          created_at: string
          delivered_at: string | null
          direction: Database["public"]["Enums"]["MessageDirection"]
          error_message: string | null
          id: string
          ig_message_id: string | null
          message_type: Database["public"]["Enums"]["MessageType"]
          metadata: Json | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["MessageStatus"]
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          campaign_step_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          direction: Database["public"]["Enums"]["MessageDirection"]
          error_message?: string | null
          id?: string
          ig_message_id?: string | null
          message_type?: Database["public"]["Enums"]["MessageType"]
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["MessageStatus"]
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          campaign_step_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["MessageDirection"]
          error_message?: string | null
          id?: string
          ig_message_id?: string | null
          message_type?: Database["public"]["Enums"]["MessageType"]
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["MessageStatus"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_step_id_fkey"
            columns: ["campaign_step_id"]
            isOneToOne: false
            referencedRelation: "campaign_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          email_verified: string | null
          id: string
          magic_token: string | null
          magic_token_exp: string | null
          name: string | null
          password_hash: string | null
          role: Database["public"]["Enums"]["UserRole"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: string | null
          id?: string
          magic_token?: string | null
          magic_token_exp?: string | null
          name?: string | null
          password_hash?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: string | null
          id?: string
          magic_token?: string | null
          magic_token_exp?: string | null
          name?: string | null
          password_hash?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      CampaignRecipientStatus:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "REPLIED"
        | "FAILED"
        | "UNSUBSCRIBED"
      CampaignStatus:
        | "DRAFT"
        | "SCHEDULED"
        | "RUNNING"
        | "PAUSED"
        | "COMPLETED"
        | "CANCELLED"
      ConversationStatus: "OPEN" | "CLOSED" | "SNOOZED" | "ARCHIVED"
      MessageDirection: "INBOUND" | "OUTBOUND"
      MessageStatus:
        | "PENDING"
        | "QUEUED"
        | "SENT"
        | "DELIVERED"
        | "READ"
        | "FAILED"
      MessageType:
        | "TEXT"
        | "IMAGE"
        | "VIDEO"
        | "AUDIO"
        | "STORY_REPLY"
        | "STORY_MENTION"
        | "QUICK_REPLY"
      UserRole: "OWNER" | "ADMIN" | "MEMBER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

