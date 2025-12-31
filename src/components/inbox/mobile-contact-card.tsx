'use client';

import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

interface Contact {
  id: string;
  igUserId: string;
  igUsername: string;
  name?: string;
  profilePictureUrl?: string;
  followerCount?: number;
  isVerified: boolean;
  tags: string[];
}

interface MobileContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (contact: Contact) => void;
  index: number;
}

export function MobileContactCard({ 
  contact, 
  isSelected, 
  onSelect,
  index 
}: MobileContactCardProps) {
  return (
    <button
      onClick={() => onSelect(contact)}
      className={cn(
        'w-full p-4 flex items-start gap-3 text-left transition-all duration-200 border-b border-border/50',
        'hover:bg-background-elevated active:bg-background-elevated',
        isSelected && 'bg-background-elevated border-l-4 border-l-accent',
        index === 0 && 'animate-slide-in'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative flex-shrink-0">
        {contact.profilePictureUrl ? (
          <Avatar
            src={contact.profilePictureUrl}
            name={contact.igUsername}
            size="md"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-lg">
            {(contact.name || contact.igUsername || '?')[0].toUpperCase()}
          </div>
        )}
        {contact.isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background">
            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-base text-foreground truncate">
            {contact.name || `@${contact.igUsername}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-foreground-muted truncate">
            @{contact.igUsername}
          </p>
          {contact.followerCount && (
            <span className="text-xs text-foreground-subtle flex-shrink-0">
              • {contact.followerCount.toLocaleString()} followers
            </span>
          )}
        </div>

        {contact.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {contact.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {contact.tags.length > 3 && (
              <span className="text-xs text-foreground-subtle">
                +{contact.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

