'use client';

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Plus, Send, Instagram, AlertCircle } from "lucide-react";
import { Header } from '@/components/layout/header';
import { Button } from "@/components/ui/button";
import type { Campaign, CampaignStatus } from '@/types';
import { usePostHog } from '@/hooks/use-posthog';
import { useCampaignsData } from "@/hooks/use-campaigns-data";
import {
  CreateCampaignModal,
  type NewCampaignData,
} from "@/components/campaigns/create-campaign-modal";
import { CampaignStats } from "@/components/campaigns/campaign-stats";
import { CampaignListItem } from "@/components/campaigns/campaign-list-item";
import { getUserTimezone } from "@/lib/campaigns/timezones";

export default function CampaignsPage() {
  const { capture } = usePostHog();
  const { campaigns, accounts, contacts, leads, isLoading, refetch } =
    useCampaignsData();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCampaign = async (campaignData: NewCampaignData) => {
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: campaignData.name,
        description: campaignData.description,
        sendStartTime: campaignData.sendStartTime,
        sendEndTime: campaignData.sendEndTime,
        timezone: campaignData.timezone,
        messagesPerDay: campaignData.messagesPerDay,
        accountIds: campaignData.accountIds,
        contactIds: campaignData.contactIds,
        leadIds: campaignData.leadIds,
        steps: campaignData.messageSteps.map((step) => {
          const primaryTemplate =
            step.variants && step.variants.length > 0
              ? step.variants[0].template
              : step.messageTemplate || "";

          return {
            messageTemplate: primaryTemplate,
            variants: step.variants || undefined,
            delayDays: step.delayDays,
            condition:
              step.condition === "on_reply"
                ? { type: "on_reply", enabled: true }
                : { type: "time_based", enabled: false },
          };
        }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create campaign");
    }

    const totalRecipients =
      campaignData.contactIds.length + campaignData.leadIds.length;

    // Track campaign creation
    capture("campaign_created", {
      campaign_id: data.campaign.id,
      total_recipients: data.campaign.totalRecipients,
      accounts_count: campaignData.accountIds.length,
      contacts_count: campaignData.contactIds.length,
      leads_count: campaignData.leadIds.length,
      steps_count: campaignData.messageSteps.length,
      messages_per_day: campaignData.messagesPerDay,
    });

    refetch();
    alert(
      `Campaign "${campaignData.name}" created successfully with ${totalRecipients} recipients!`
    );
  };

  const handleUpdateStatus = async (
    campaignId: string,
    newStatus: CampaignStatus
  ) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const updates: Record<string, string> = { status: newStatus };

      if (newStatus === "RUNNING") {
        updates.started_at = new Date().toISOString();
      } else if (newStatus === "COMPLETED") {
        updates.completed_at = new Date().toISOString();
      }

      await supabase.from("campaigns").update(updates).eq("id", campaignId);

      // Track status update
      const campaign = campaigns.find((c) => c.id === campaignId);
      capture("campaign_status_updated", {
        campaign_id: campaignId,
        old_status: campaign?.status,
        new_status: newStatus,
        total_recipients: campaign?.totalRecipients || 0,
      });

      // If starting campaign, trigger processing
      if (newStatus === "RUNNING") {
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
          const workspaceId =
            typeof window !== "undefined"
              ? localStorage.getItem("workspaceId")
              : null;
          const userId =
            typeof window !== "undefined"
              ? localStorage.getItem("userId")
              : null;

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (workspaceId) headers["x-workspace-id"] = workspaceId;
          if (userId) headers["x-user-id"] = userId;

          const response = await fetch(
            `${apiUrl}/campaigns/${campaignId}/process`,
            {
              method: "POST",
              headers,
            }
          );

          if (!response.ok) {
            console.warn("Failed to start campaign processing");
          } else {
            setTimeout(() => refetch(), 2000);
          }
        } catch (processError) {
          console.error("Failed to start campaign processing:", processError);
        }
      }

      // Send notification about campaign completion
      if (newStatus === "COMPLETED") {
        const campaign = campaigns.find((c) => c.id === campaignId);
        if (campaign) {
          try {
            const apiUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const workspaceId =
              typeof window !== "undefined"
                ? localStorage.getItem("workspaceId")
                : null;
            const userId =
              typeof window !== "undefined"
                ? localStorage.getItem("userId")
                : null;

            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            };

            if (workspaceId) headers["x-workspace-id"] = workspaceId;
            if (userId) headers["x-user-id"] = userId;

            const response = await fetch(
              `${apiUrl}/notifications/campaign-complete`,
              {
                method: "POST",
                headers,
                body: JSON.stringify({
                  campaignId: campaignId,
                  campaignName: campaign.name,
                }),
              }
            );

            if (!response.ok) {
              console.warn("Failed to send campaign completion notification");
            }
          } catch (notifError) {
            console.error(
              "Failed to send campaign completion notification:",
              notifError
            );
          }
        }
      }

      refetch();
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("campaigns").delete().eq("id", campaignId);
      refetch();
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Campaigns"
        subtitle="Create and manage your DM outreach campaigns"
        action={{
          label: "New Campaign",
          onClick: () => setShowCreateModal(true),
        }}
      />

      <div className="p-4 md:p-6">
        {/* No Accounts Warning */}
        {!isLoading && accounts.length === 0 && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 font-medium">
                No Instagram accounts connected
              </p>
              <p className="text-amber-400/70 text-sm">
                Connect an Instagram account first to create campaigns
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = "/settings/instagram")}
              className="w-full sm:w-auto"
            >
              <Instagram className="h-4 w-4" />
              Connect Account
            </Button>
          </div>
        )}

        {/* Stats Overview */}
        <CampaignStats campaigns={campaigns} />

        {/* Campaign List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background-secondary rounded-xl border border-border p-6 animate-pulse">
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
            {campaigns.map((campaign, index) => (
              <CampaignListItem
                key={campaign.id}
                campaign={
                  campaign as Campaign & { instagramUsername?: string | null }
                }
                onStatusUpdate={handleUpdateStatus}
                onDelete={handleDeleteCampaign}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-background-elevated flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-foreground-subtle" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No campaigns yet
            </h3>
            <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
              Create your first DM campaign to start reaching out to potential
              collaborators
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCampaign}
        accounts={accounts}
        contacts={contacts}
        leads={leads}
      />
    </div>
  );
}
