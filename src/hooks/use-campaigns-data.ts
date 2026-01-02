// Custom hook for managing campaigns data fetching and state

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/types";

interface InstagramAccount {
  id: string;
  igUsername: string;
  profilePictureUrl?: string;
  isActive: boolean;
}

interface Contact {
  id: string;
  igUserId: string;
  igUsername: string;
  name?: string;
  profilePictureUrl?: string;
}

interface Lead {
  id: string;
  igUserId: string;
  igUsername: string;
  name?: string;
  profilePictureUrl?: string;
}

interface UseCampaignsDataReturn {
  campaigns: Campaign[];
  accounts: InstagramAccount[];
  contacts: Contact[];
  leads: Lead[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCampaignsData(): UseCampaignsDataReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Fetch Instagram accounts
      const { data: accountsData } = await supabase
        .from("instagram_accounts")
        .select("id, ig_username, profile_picture_url, is_active")
        .order("is_active", { ascending: false });

      if (accountsData) {
        setAccounts(
          accountsData.map((acc) => ({
            id: acc.id,
            igUsername: acc.ig_username,
            profilePictureUrl: acc.profile_picture_url,
            isActive: acc.is_active,
          }))
        );
      }

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("id, ig_user_id, ig_username, name, profile_picture_url")
        .order("created_at", { ascending: false });

      if (contactsData) {
        setContacts(
          contactsData.map((c) => ({
            id: c.id,
            igUserId: c.ig_user_id,
            igUsername: c.ig_username || "",
            name: c.name,
            profilePictureUrl: c.profile_picture_url,
          }))
        );
      }

      // Fetch leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, ig_user_id, ig_username, full_name, profile_pic_url")
        .order("created_at", { ascending: false });

      if (leadsData) {
        setLeads(
          leadsData.map((l) => ({
            id: l.id,
            igUserId: l.ig_user_id,
            igUsername: l.ig_username || "",
            name: l.full_name,
            profilePictureUrl: l.profile_pic_url,
          }))
        );
      }

      // Fetch campaigns via API
      const response = await fetch("/api/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const result = await response.json();

      if (result.success && result.campaigns) {
        setCampaigns(result.campaigns);
      } else {
        // Fallback to Supabase if API fails
        const { data, error: supabaseError } = await supabase
          .from("campaigns")
          .select(
            `
            *,
            instagram_account:instagram_accounts(ig_username)
          `
          )
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;

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
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error fetching campaigns data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    campaigns,
    accounts,
    contacts,
    leads,
    isLoading,
    error,
    refetch: fetchData,
  };
}

