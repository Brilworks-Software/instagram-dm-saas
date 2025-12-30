// Campaign utility functions

import type { Campaign, CampaignStatus } from "@/types";

export const statusColors: Record<
  CampaignStatus,
  {
    variant: "default" | "success" | "warning" | "error" | "accent";
    label: string;
  }
> = {
  DRAFT: { variant: "default", label: "Draft" },
  SCHEDULED: { variant: "warning", label: "Scheduled" },
  RUNNING: { variant: "accent", label: "Running" },
  PAUSED: { variant: "warning", label: "Paused" },
  COMPLETED: { variant: "success", label: "Completed" },
  CANCELLED: { variant: "error", label: "Cancelled" },
};

/**
 * Calculate campaign progress percentage
 */
export function calculateProgress(campaign: Campaign): number {
  if (campaign.totalRecipients === 0) return 0;
  return (campaign.sentCount / campaign.totalRecipients) * 100;
}

/**
 * Calculate reply rate percentage
 */
export function calculateReplyRate(campaign: Campaign): number {
  if (campaign.sentCount === 0) return 0;
  return (campaign.replyCount / campaign.sentCount) * 100;
}

/**
 * Calculate aggregate reply rate across multiple campaigns
 */
export function calculateAggregateReplyRate(campaigns: Campaign[]): number {
  if (campaigns.length === 0) return 0;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  if (totalSent === 0) return 0;
  const totalReplies = campaigns.reduce((sum, c) => sum + c.replyCount, 0);
  return (totalReplies / totalSent) * 100;
}

/**
 * Calculate total recipients across campaigns
 */
export function calculateTotalRecipients(campaigns: Campaign[]): number {
  return campaigns.reduce((sum, c) => sum + c.totalRecipients, 0);
}

/**
 * Get active campaigns count
 */
export function getActiveCampaignsCount(campaigns: Campaign[]): number {
  return campaigns.filter((c) => c.status === "RUNNING").length;
}

