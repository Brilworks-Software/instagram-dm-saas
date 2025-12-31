'use client';

import { CheckCircle2, Eye, Instagram, Hash, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  igUserId: string;
  igUsername: string;
  fullName?: string;
  bio?: string;
  profilePicUrl?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isVerified: boolean;
  isPrivate: boolean;
  isBusiness: boolean;
  status: 'new' | 'contacted' | 'replied' | 'converted' | 'unsubscribed';
  tags: string[];
  matchedKeywords: string[];
  source: string;
  sourceQuery?: string;
  createdAt: string;
  leadScore?: number;
  engagementRate?: number;
}

interface MobileLeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (leadId: string) => void;
  onViewProfile: (lead: Lead) => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  contacted: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  replied: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  converted: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  unsubscribed: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
};

export function MobileLeadCard({ lead, isSelected, onSelect, onViewProfile }: MobileLeadCardProps) {
  return (
    <div
      className={cn(
        'border border-border rounded-lg bg-background-secondary p-4 space-y-3',
        isSelected && 'ring-2 ring-accent border-accent'
      )}
    >
      {/* Header with checkbox and avatar */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(lead.id)}
          className="mt-1 rounded border-border"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Avatar src={lead.profilePicUrl} name={lead.igUsername} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-foreground truncate">
                  @{lead.igUsername}
                </p>
                {lead.isVerified && <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />}
              </div>
              {lead.fullName && (
                <p className="text-sm text-foreground-muted truncate">{lead.fullName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-sm">
        {lead.followerCount !== undefined && (
          <div>
            <span className="text-foreground-muted">Followers: </span>
            <span className="font-medium text-foreground">{lead.followerCount.toLocaleString()}</span>
          </div>
        )}
        {lead.leadScore !== undefined && lead.leadScore !== null && (
          <div>
            <span className="text-foreground-muted">Score: </span>
            <span className={cn(
              'font-medium',
              lead.leadScore >= 70 ? 'text-emerald-400' :
              lead.leadScore >= 50 ? 'text-amber-400' : 'text-foreground-muted'
            )}>
              {lead.leadScore}
            </span>
          </div>
        )}
        {lead.engagementRate !== undefined && lead.engagementRate !== null && (
          <div>
            <span className="text-foreground-muted">Engagement: </span>
            <span className="font-medium text-foreground">{lead.engagementRate.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Bio Preview */}
      {lead.bio && (
        <p className="text-sm text-foreground-muted line-clamp-2">{lead.bio}</p>
      )}

      {/* Matched Keywords */}
      {lead.matchedKeywords?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {lead.matchedKeywords.slice(0, 3).map((kw, i) => (
            <Badge key={i} variant="accent" className="text-xs">{kw}</Badge>
          ))}
          {lead.matchedKeywords.length > 3 && (
            <span className="text-xs text-foreground-subtle">+{lead.matchedKeywords.length - 3}</span>
          )}
        </div>
      )}

      {/* Status and Source */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            statusColors[lead.status]?.bg,
            statusColors[lead.status]?.text
          )}>
            {lead.status}
          </span>
          <span className="text-xs text-foreground-subtle flex items-center gap-1">
            {lead.source === 'hashtag' && <Hash className="h-3 w-3" />}
            {lead.source === 'followers' && <Users className="h-3 w-3" />}
            {lead.sourceQuery || lead.source}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onViewProfile(lead)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://instagram.com/${lead.igUsername}`, '_blank')}
          >
            <Instagram className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

