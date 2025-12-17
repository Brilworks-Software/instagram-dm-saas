export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      automations: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          instagram_account_id: string
          is_active: boolean | null
          messages_handled: number | null
          name: string
          response_template: string | null
          trigger_keywords: string[] | null
          trigger_type: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          instagram_account_id: string
          is_active?: boolean | null
          messages_handled?: number | null
          name: string
          response_template?: string | null
          trigger_keywords?: string[] | null
          trigger_type?: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          instagram_account_id?: string
          is_active?: boolean | null
          messages_handled?: number | null
          name?: string
          response_template?: string | null
          trigger_keywords?: string[] | null
          trigger_type?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_instagram_account_id_fkey"
            columns: ["instagram_account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
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
          first_message_sent_at: string | null
          id: string
          ig_thread_id: string | null
          instagram_account_id: string
          is_automation_paused: boolean
          is_request_pending: boolean | null
          last_message_at: string | null
          status: Database["public"]["Enums"]["ConversationStatus"]
          unread_count: number
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          first_message_sent_at?: string | null
          id?: string
          ig_thread_id?: string | null
          instagram_account_id: string
          is_automation_paused?: boolean
          is_request_pending?: boolean | null
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["ConversationStatus"]
          unread_count?: number
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          first_message_sent_at?: string | null
          id?: string
          ig_thread_id?: string | null
          instagram_account_id?: string
          is_automation_paused?: boolean
          is_request_pending?: boolean | null
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
          fb_page_id: string | null
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
          fb_page_id?: string | null
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
          fb_page_id?: string | null
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
      lead_list_members: {
        Row: {
          added_at: string | null
          id: string
          lead_id: string
          lead_list_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          lead_id: string
          lead_list_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          lead_id?: string
          lead_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_list_members_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_list_members_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_lists: {
        Row: {
          auto_add: boolean | null
          created_at: string | null
          description: string | null
          filter_keywords: string[] | null
          id: string
          name: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          auto_add?: boolean | null
          created_at?: string | null
          description?: string | null
          filter_keywords?: string[] | null
          id?: string
          name: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          auto_add?: boolean | null
          created_at?: string | null
          description?: string | null
          filter_keywords?: string[] | null
          id?: string
          name?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_lists_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          bio: string | null
          created_at: string | null
          dm_replied_at: string | null
          dm_sent_at: string | null
          external_url: string | null
          follower_count: number | null
          following_count: number | null
          full_name: string | null
          id: string
          ig_user_id: string
          ig_username: string
          instagram_account_id: string | null
          is_business: boolean | null
          is_private: boolean | null
          is_verified: boolean | null
          matched_keywords: string[] | null
          notes: string | null
          post_count: number | null
          profile_pic_url: string | null
          source: string | null
          source_query: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          dm_replied_at?: string | null
          dm_sent_at?: string | null
          external_url?: string | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          ig_user_id: string
          ig_username: string
          instagram_account_id?: string | null
          is_business?: boolean | null
          is_private?: boolean | null
          is_verified?: boolean | null
          matched_keywords?: string[] | null
          notes?: string | null
          post_count?: number | null
          profile_pic_url?: string | null
          source?: string | null
          source_query?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          dm_replied_at?: string | null
          dm_sent_at?: string | null
          external_url?: string | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          ig_user_id?: string
          ig_username?: string
          instagram_account_id?: string | null
          is_business?: boolean | null
          is_private?: boolean | null
          is_verified?: boolean | null
          matched_keywords?: string[] | null
          notes?: string | null
          post_count?: number | null
          profile_pic_url?: string | null
          source?: string | null
          source_query?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_instagram_account_id_fkey"
            columns: ["instagram_account_id"]
            isOneToOne: false
            referencedRelation: "instagram_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_workspace_id_fkey"
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
          approval_status: string | null
          campaign_step_id: string | null
          content: string
          conversation_id: string
          created_at: string
          delivered_at: string | null
          direction: Database["public"]["Enums"]["MessageDirection"]
          error_message: string | null
          id: string
          ig_message_id: string | null
          is_blocked: boolean | null
          is_first_message: boolean | null
          is_pending_approval: boolean | null
          message_type: Database["public"]["Enums"]["MessageType"]
          metadata: Json | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["MessageStatus"]
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          approval_status?: string | null
          campaign_step_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          direction: Database["public"]["Enums"]["MessageDirection"]
          error_message?: string | null
          id?: string
          ig_message_id?: string | null
          is_blocked?: boolean | null
          is_first_message?: boolean | null
          is_pending_approval?: boolean | null
          message_type?: Database["public"]["Enums"]["MessageType"]
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["MessageStatus"]
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          approval_status?: string | null
          campaign_step_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["MessageDirection"]
          error_message?: string | null
          id?: string
          ig_message_id?: string | null
          is_blocked?: boolean | null
          is_first_message?: boolean | null
          is_pending_approval?: boolean | null
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
          supabase_auth_id: string | null
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
          supabase_auth_id?: string | null
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
          supabase_auth_id?: string | null
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
      get_user_workspace_id: { Args: never; Returns: string }
      get_user_workspace_id_for_policy: { Args: never; Returns: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      CampaignRecipientStatus: [
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "REPLIED",
        "FAILED",
        "UNSUBSCRIBED",
      ],
      CampaignStatus: [
        "DRAFT",
        "SCHEDULED",
        "RUNNING",
        "PAUSED",
        "COMPLETED",
        "CANCELLED",
      ],
      ConversationStatus: ["OPEN", "CLOSED", "SNOOZED", "ARCHIVED"],
      MessageDirection: ["INBOUND", "OUTBOUND"],
      MessageStatus: [
        "PENDING",
        "QUEUED",
        "SENT",
        "DELIVERED",
        "READ",
        "FAILED",
      ],
      MessageType: [
        "TEXT",
        "IMAGE",
        "VIDEO",
        "AUDIO",
        "STORY_REPLY",
        "STORY_MENTION",
        "QUICK_REPLY",
      ],
      UserRole: ["OWNER", "ADMIN", "MEMBER"],
    },
  },
} as const
