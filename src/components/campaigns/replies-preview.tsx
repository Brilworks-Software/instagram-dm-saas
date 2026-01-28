'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { NewCampaignData } from './create-campaign-modal';
import { formatTimeTo12Hour } from '@/lib/utils/helper';

interface Recipient {
  id: string;
  contactId: string;
  name?: string;
  igUsername: string;
  profilePictureUrl?: string;
  assignedAccountId?: string;
  assignedAccountUsername?: string;
}

interface ReplyData {
  contactId: string;
  lastReply?: string;
  replyDate?: string;
  accountUsername?: string;
  hasReplied: boolean;
}

interface RepliesPreviewProps {
  readonly recipients: Recipient[];
  readonly campaign: NewCampaignData;
  readonly className?: string;
}

export function RepliesPreview({ recipients, campaign, className }: RepliesPreviewProps ) {
  const [repliesData, setRepliesData] = useState<Record<string, ReplyData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      if (recipients.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        // Get actual contact IDs (for leads, we'll need to query by ig_user_id)
        const contactIds = recipients
          .map((r) => r.contactId)
          .filter((id): id is string => !!id && id.length > 10); // Filter out invalid IDs

        if (contactIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch last replies for each contact
        const { data: messages } = await supabase
          .from('messages')
          .select(`
            contact_id,
            content,
            sent_at,
            direction,
            conversations!inner(
              instagram_accounts(ig_username)
            )
          `)
          .in('contact_id', contactIds)
          .eq('direction', 'INBOUND')
          .order('sent_at', { ascending: false });

        // Process messages to get most recent reply per contact
        const repliesMap: Record<string, ReplyData> = {};

        recipients.forEach((recipient) => {
          repliesMap[recipient.contactId] = {
            contactId: recipient.contactId,
            hasReplied: false,
          };
        });

        if (messages) {
          messages.forEach((message: any) => {
            const contactId = message.contact_id;
            if (repliesMap[contactId] && !repliesMap[contactId].hasReplied) {
              repliesMap[contactId] = {
                contactId,
                lastReply: message.content,
                replyDate: message.sent_at,
                accountUsername: message.conversations?.instagram_accounts?.ig_username,
                hasReplied: true,
              };
            }
          });
        }

        setRepliesData(repliesMap);
      } catch (error) {
        console.error('Error fetching replies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
  }, [recipients]);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <MessageCircle className="h-4 w-4" />
          <span>Loading reply history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <MessageCircle className="h-4 w-4" />
        <span>Reply History & Preview</span>
      </div>

      {/* Summary Stats */}
      {recipients.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-background-elevated border border-border">
          <div>
            <p className="text-xs text-foreground-muted">Total Recipients</p>
            <p className="text-lg font-bold text-foreground">{recipients.length}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">Have Replied</p>
            <p className="text-lg font-bold text-success">
              {Object.values(repliesData).filter((r) => r.hasReplied).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted">No Previous Contact</p>
            <p className="text-lg font-bold text-foreground-muted">
              {Object.values(repliesData).filter((r) => !r.hasReplied).length}
            </p>
          </div>
        </div>
      )}

      {/* Campaign Summary */}
      <div className="p-4 rounded-lg bg-background-elevated border border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Campaign Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground-muted">Campaign Name</p>
            <p className="font-medium text-foreground truncate min-w">
              {campaign.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-foreground-muted">Total Recipients</p>
            <p className="font-medium text-foreground">
              {campaign.contactIds.length + campaign.leadIds.length}
            </p>
          </div>
          <div>
            <p className="text-foreground-muted">Selected Accounts</p>
            <p className="font-medium text-foreground">
              {campaign.accountIds.length} account
              {campaign.accountIds.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-foreground-muted">Messages Per Day</p>
            <p className="font-medium text-foreground">
              {campaign.messagesPerDay} per account
              {campaign.accountIds.length > 1 && (
                <span className="text-foreground-muted ml-1">
                  (Total: {campaign.messagesPerDay * campaign.accountIds.length}
                  /day)
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-foreground-muted">Time Range</p>
            <p className="font-medium text-foreground">
              {formatTimeTo12Hour(campaign.sendStartTime)} - {formatTimeTo12Hour(campaign.sendEndTime)} (
              {campaign.timezone})
            </p>
          </div>
          <div>
            <p className="text-foreground-muted">Message Sequence</p>
            <p className="font-medium text-foreground">
              {campaign.messageSteps.length} message
              {campaign.messageSteps.length !== 1 ? "s" : ""}
              {campaign.messageSteps.length > 1 && (
                <span className="text-foreground-muted ml-1">
                  ({campaign.messageSteps.length - 1} follow-up
                  {campaign.messageSteps.length - 1 !== 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>
          {campaign.schedule_type === "SPECIFIC_TIME" && campaign.scheduled_at && (
            <>
              <div>
                <p className="text-foreground-muted">Start Date</p>
                <p className="font-medium text-foreground">
                  {new Date(campaign.scheduled_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-foreground-muted">Start Time</p>
                <p className="font-medium text-foreground">
                  {new Date(campaign.scheduled_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })} ({campaign.timezone})
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">
                  Recipient
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">
                  Assigned Account
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">
                  Last Reply
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">
                  Reply Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recipients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-foreground-muted">
                    No recipients selected
                  </td>
                </tr>
              ) : (
                recipients.map((recipient) => {
                  const replyData = repliesData[recipient.contactId] || {
                    contactId: recipient.contactId,
                    hasReplied: false,
                  };

                  return (
                    <tr key={recipient.id} className="hover:bg-background-elevated">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={recipient.profilePictureUrl}
                            name={recipient.igUsername}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {recipient.name || recipient.igUsername}
                            </p>
                            <p className="text-xs text-foreground-muted">
                              @{recipient.igUsername}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground-muted">
                          {recipient.assignedAccountUsername
                            ? `@${recipient.assignedAccountUsername}`
                            : 'Not assigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {replyData.lastReply ? (
                          <p className="text-sm text-foreground max-w-xs truncate">
                            {replyData.lastReply}
                          </p>
                        ) : (
                          <span className="text-sm text-foreground-subtle">
                            No previous conversation
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {replyData.replyDate ? (
                          <span className="text-sm text-foreground-muted">
                            {new Date(replyData.replyDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-foreground-subtle">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {replyData.hasReplied ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Replied
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Clock className="h-3 w-3" />
                            No Reply
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

