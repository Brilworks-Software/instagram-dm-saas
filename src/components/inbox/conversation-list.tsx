'use client';

import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (!conversations?.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-background-elevated flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-foreground-muted text-sm">No conversations yet</p>
          <p className="text-foreground-subtle text-xs mt-1">Messages will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation, index) => {
        const isSelected = selectedId === conversation.id;
        const hasUnread = conversation.unreadCount > 0;
        
        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={cn(
              'w-full p-4 flex items-start gap-3 text-left transition-all duration-200 border-b border-border/50',
              'hover:bg-background-elevated active:bg-background-elevated',
              isSelected && 'bg-background-elevated border-l-4 border-l-accent',
              index === 0 && 'animate-slide-in',
              'min-h-[72px]' // Ensure adequate touch target
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative">
              <Avatar
                src={conversation.contact.profilePictureUrl}
                name={conversation.contact.igUsername || conversation.contact.name}
                size="md"
              />
              {conversation.contact.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={cn(
                  'font-semibold text-sm md:text-base truncate',
                  hasUnread ? 'text-foreground' : 'text-foreground-muted'
                )}>
                  {conversation.contact.name || `@${conversation.contact.igUsername || 'Unknown'}`}
                </span>
                {conversation.lastMessageAt && (
                  <span className="text-xs text-foreground-subtle flex-shrink-0">
                    {formatRelativeTime(conversation.lastMessageAt)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  'text-sm truncate flex-1',
                  hasUnread ? 'text-foreground-muted font-medium' : 'text-foreground-subtle'
                )}>
                  {conversation.lastMessage
                    ? truncate(conversation.lastMessage.content, 50)
                    : 'No messages yet'}
                </p>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasUnread && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-accent text-white text-xs font-medium flex items-center justify-center">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {conversation.contact.tags?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
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
            </div>
          </button>
        );
      })}
    </div>
  );
}

