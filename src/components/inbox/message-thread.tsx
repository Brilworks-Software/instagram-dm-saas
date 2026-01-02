'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, MoreVertical, Phone, Video, Info, Check, CheckCheck } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileMessageThreadHeader } from '@/components/inbox/mobile-message-thread-header';
import type { Conversation, Message } from '@/types';

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export function MessageThread({ conversation, messages, onSendMessage, isLoading, onBack }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch {
      // Handle error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'SENT':
        return <Check className="h-3 w-3 text-foreground-subtle" />;
      case 'DELIVERED':
        return <CheckCheck className="h-3 w-3 text-foreground-subtle" />;
      case 'READ':
        return <CheckCheck className="h-3 w-3 text-accent" />;
      case 'FAILED':
        return <span className="text-xs text-error">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden">
        <MobileMessageThreadHeader
          conversation={conversation}
          onBack={onBack}
          onInfo={() => {/* Handle info click */}}
          onMenu={() => {/* Handle menu click */}}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex h-16 px-6 items-center justify-between border-b border-border bg-background-secondary/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar
            src={conversation.contact.profilePictureUrl}
            name={conversation.contact.igUsername}
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">
                {conversation.contact.name || `@${conversation.contact.igUsername || 'Unknown'}`}
              </h2>
              {conversation.contact.isVerified && (
                <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              {conversation.contact.followerCount && (
                <span>{conversation.contact.followerCount.toLocaleString()} followers</span>
              )}
              {conversation.status !== 'OPEN' && (
                <Badge variant={conversation.status === 'CLOSED' ? 'default' : 'warning'} size="sm">
                  {conversation.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors">
            <Info className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse-subtle text-foreground-muted">Loading messages...</div>
          </div>
        ) : messages?.length ? (
          <>
            {messages.map((message, index) => {
              const isOutbound = message.direction === 'OUTBOUND';
              const showAvatar = !isOutbound && (index === 0 || messages[index - 1]?.direction === 'OUTBOUND');
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-end gap-2',
                    isOutbound ? 'justify-end' : 'justify-start',
                    'animate-slide-up'
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {!isOutbound && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <Avatar
                          src={conversation.contact.profilePictureUrl}
                          name={conversation.contact.igUsername}
                          size="sm"
                        />
                      )}
                    </div>
                  )}
                  
                  <div className={cn(
                    'max-w-[85%] md:max-w-[70%] group',
                    isOutbound ? 'items-end' : 'items-start'
                  )}>
                    <div
                      className={cn(
                        'px-3 md:px-4 py-2 md:py-2.5 rounded-2xl',
                        isOutbound
                          ? 'bg-accent text-white rounded-br-md'
                          : 'bg-background-elevated text-foreground rounded-bl-md'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    
                    <div className={cn(
                      'flex flex-col gap-0.5',
                      isOutbound ? 'items-end' : 'items-start'
                    )}>
                      <div className={cn(
                        'flex items-center gap-1.5 px-1',
                        isOutbound ? 'justify-end' : 'justify-start'
                      )}>
                        <span className="text-xs text-foreground-subtle">
                          {formatRelativeTime(message.createdAt)}
                        </span>
                        {isOutbound && getStatusIcon(message.status)}
                        {message.aiGenerated && (
                          <Sparkles className="h-3 w-3 text-accent" />
                        )}
                      </div>
                      {isOutbound && message.isFirstMessage && (
                        <span className="text-xs px-1 flex items-center gap-1" style={{
                          color: message.isPendingApproval 
                            ? '#f59e0b' // amber for pending
                            : message.approvalStatus === 'approved'
                            ? '#10b981' // green for approved
                            : message.approvalStatus === 'blocked'
                            ? '#ef4444' // red for blocked
                            : '#6b7280' // gray for unknown
                        }}>
                          {message.isPendingApproval ? (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              First message • Pending approval
                            </>
                          ) : message.approvalStatus === 'approved' ? (
                            <>
                              <CheckCheck className="h-3 w-3" />
                              First message • Accepted
                            </>
                          ) : (
                            'First message'
                          )}
                        </span>
                      )}
                      {isOutbound && message.approvalStatus === 'blocked' && !message.isFirstMessage && (
                        <span className="text-xs text-error px-1 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Blocked or not accepted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-foreground-muted">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 border-t border-border bg-background-secondary/50">
        <div className="flex items-end gap-2 md:gap-3">
          <button className="p-2 rounded-lg text-foreground-muted hover:text-accent hover:bg-accent/10 transition-colors hidden sm:block">
            <Sparkles className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className={cn(
                'w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-background-elevated border border-border',
                'text-foreground placeholder:text-foreground-subtle text-sm md:text-base',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
                'resize-none max-h-32 transition-colors'
              )}
              style={{ minHeight: '44px' }}
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            isLoading={isSending}
            className="h-11 md:h-12 w-11 md:w-12 p-0 flex-shrink-0"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

