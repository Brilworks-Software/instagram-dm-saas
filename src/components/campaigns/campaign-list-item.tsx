// Campaign list item component

import { Play, Pause, Trash2, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Campaign, CampaignStatus } from "@/types";
import {
  statusColors,
  calculateProgress,
  calculateReplyRate,
} from "@/lib/campaigns/utils";

interface CampaignListItemProps {
  campaign: Campaign & { instagramUsername?: string | null };
  onStatusUpdate: (campaignId: string, newStatus: CampaignStatus) => void;
  onDelete: (campaignId: string) => void;
  index: number;
}

export function CampaignListItem({
  campaign,
  onStatusUpdate,
  onDelete,
  index,
}: CampaignListItemProps) {
  const progress = calculateProgress(campaign);
  const replyRate = calculateReplyRate(campaign);
  const statusInfo = statusColors[campaign.status];

  return (
    <div
      className={cn(
        "bg-background-secondary rounded-xl border border-border p-6 transition-all hover:border-border-hover",
        "animate-slide-up"
      )}
      style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {campaign.name}
            </h3>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {campaign.instagramUsername && (
              <span className="text-sm text-foreground-muted">
                @{campaign.instagramUsername}
              </span>
            )}
          </div>

          {campaign.description && (
            <p className="text-sm text-foreground-muted mb-4">
              {campaign.description}
            </p>
          )}

          {/* Progress Bar */}
          {campaign.status !== "DRAFT" && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
                <span>Progress</span>
                <span>
                  {campaign.sentCount} / {campaign.totalRecipients} sent
                </span>
              </div>
              <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-foreground-subtle" />
              <span className="text-foreground-muted">
                {campaign.totalRecipients} recipients
              </span>
            </div>
            {campaign.status !== "DRAFT" && (
              <>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-foreground-subtle" />
                  <span className="text-foreground-muted">
                    {campaign.replyCount} replies ({replyRate.toFixed(1)}%)
                  </span>
                </div>
                {campaign.failedCount > 0 && (
                  <div className="flex items-center gap-2 text-error">
                    <span>{campaign.failedCount} failed</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {campaign.status === "DRAFT" && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(campaign.id, "RUNNING")}>
              <Play className="h-4 w-4" />
              Start
            </Button>
          )}
          {campaign.status === "RUNNING" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusUpdate(campaign.id, "PAUSED")}>
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          {campaign.status === "PAUSED" && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(campaign.id, "RUNNING")}>
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(campaign.id)}
            className="text-error hover:text-error">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

