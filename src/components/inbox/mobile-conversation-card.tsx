'use client';

import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/types';

interface MobileConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  index: number;
}

export function MobileConversationCard({ 
  conversation, 
  isSelected, 
  onSelect,
  index 
}: MobileConversationCardProps) {
  const hasUnread = conversation.unreadCount > 0;
  
  return (
    <button
      onClick={() => onSelect(conversation)}
      className={cn(
        'w-full p-4 flex items-start gap-3 text-left transition-all duration-200 border-b border-border/50',
        'hover:bg-background-elevated active:bg-background-elevated',
        isSelected && 'bg-background-elevated border-l-4 border-l-accent',
        index === 0 && 'animate-slide-in'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={conversation.contact.profilePictureUrl}
          name={conversation.contact.igUsername || conversation.contact.name}
          size="md"
        />
        {conversation.contact.isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background">
            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent border-2 border-background flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={cn(
            'font-semibold text-base truncate',
            hasUnread ? 'text-foreground' : 'text-foreground-muted'
          )}>
            {conversation.contact.name || `@${conversation.contact.igUsername}`}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-xs text-foreground-subtle flex-shrink-0">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <p className={cn(
            'text-sm truncate flex-1',
            hasUnread ? 'text-foreground-muted font-medium' : 'text-foreground-subtle'
          )}>
            {conversation.lastMessage
              ? truncate(conversation.lastMessage.content, 50)
              : 'No messages yet'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {conversation.contact.tags?.length > 0 && (
            <div className="flex items-center gap-1.5">
              {conversation.contact.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="default" size="sm" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {conversation.contact.tags.length > 2 && (
                <span className="text-xs text-foreground-subtle">
                  +{conversation.contact.tags.length - 2}
                </span>
              )}
            </div>
          )}
          {conversation.status !== 'OPEN' && (
            <Badge 
              variant={conversation.status === 'CLOSED' ? 'default' : 'warning'} 
              size="sm"
              className="text-xs"
            >
              {conversation.status}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

