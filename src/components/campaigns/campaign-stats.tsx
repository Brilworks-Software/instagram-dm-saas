// Campaign statistics overview component

import { Send, Play, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types";
import {
  getActiveCampaignsCount,
  calculateTotalRecipients,
  calculateAggregateReplyRate,
} from "@/lib/campaigns/utils";

interface CampaignStatsProps {
  campaigns: Campaign[];
}

export function CampaignStats({ campaigns }: CampaignStatsProps) {
  const stats = [
    {
      label: "Total Campaigns",
      value: campaigns.length,
      icon: Send,
      color: "text-accent",
    },
    {
      label: "Active",
      value: getActiveCampaignsCount(campaigns),
      icon: Play,
      color: "text-success",
    },
    {
      label: "Total Recipients",
      value: calculateTotalRecipients(campaigns),
      icon: Users,
      color: "text-foreground",
    },
    {
      label: "Reply Rate",
      value: `${Math.round(calculateAggregateReplyRate(campaigns))}%`,
      icon: MessageCircle,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-background-secondary rounded-xl border border-border p-5 animate-slide-up"
          style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-foreground-muted text-sm">{stat.label}</span>
            <stat.icon className={cn("h-5 w-5", stat.color)} />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

