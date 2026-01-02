'use client';

import { Info, MoreVertical } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/types';

interface MobileMessageThreadHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
  onInfo?: () => void;
  onMenu?: () => void;
}

export function MobileMessageThreadHeader({ 
  conversation, 
  onBack,
  onInfo,
  onMenu 
}: MobileMessageThreadHeaderProps) {
  return (
    <div className="h-14 lg:h-16 px-3 lg:px-6 flex items-center justify-between border-b border-border bg-background-secondary/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-background-elevated transition-colors lg:hidden flex-shrink-0"
            aria-label="Back to conversations"
          >
            <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <Avatar
          src={conversation.contact.profilePictureUrl}
          name={conversation.contact.igUsername}
          size="md"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-foreground text-sm lg:text-base truncate">
              {conversation.contact.name || `@${conversation.contact.igUsername}`}
            </h2>
            {conversation.contact.isVerified && (
              <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span className="truncate">@{conversation.contact.igUsername}</span>
            {conversation.contact.followerCount && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{conversation.contact.followerCount.toLocaleString()} followers</span>
              </>
            )}
            {conversation.status !== 'OPEN' && (
              <Badge 
                variant={conversation.status === 'CLOSED' ? 'default' : 'warning'} 
                size="sm"
                className="text-[10px]"
              >
                {conversation.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-0.5 lg:gap-1 flex-shrink-0">
        {onInfo && (
          <button 
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
            onClick={onInfo}
            aria-label="Contact info"
          >
            <Info className="h-5 w-5" />
          </button>
        )}
        {onMenu && (
          <button 
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
            onClick={onMenu}
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

