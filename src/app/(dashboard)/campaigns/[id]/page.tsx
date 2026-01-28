'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Users, MessageCircle, AlertCircle, CheckCircle2, XCircle, Loader2, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusColors } from "@/lib/campaigns/utils";
import { toast } from "sonner";
import { campaignService } from "@/lib/server/campaigns/campaign-service";
import { formatTimeTo12Hour } from "@/lib/utils/helper";

interface CampaignDetails {
  id: string;
  name: string;
  description: string | null;
  status: string;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  sendStartTime: string | null;
  sendEndTime: string | null;
  timezone: string | null;
  messagesPerDay: number;
  steps: Array<{
    id: string;
    stepOrder: number;
    name: string | null;
    messageTemplate: string | null;
    delayDays: number;
    delayHours: number | null;
    delayMinutes: number;
    variants: Array<{
      id: string;
      messageTemplate: string;
    }>;
  }>;
  recipients: Array<{
    id: string;
    status: string;
    currentStepOrder: number;
    lastProcessedAt: Date | null;
    nextActionAt: Date | null;
    errorMessage: string | null;
    contact: {
      id: string;
      igUserId: string;
      igUsername: string | null;
      name: string | null;
      profilePictureUrl: string | null;
    };
    assignedAccount: {
      id: string;
      igUsername: string;
      profilePictureUrl: string | null;
    } | null;
  }>;
  campaignAccounts: Array<{
    instagramAccount: {
      id: string;
      igUsername: string;
      profilePictureUrl: string | null;
      isActive: boolean;
    };
  }>;
  instagramAccount: {
    id: string;
    igUsername: string;
    profilePictureUrl: string | null;
  } | null;
  jobStats: Record<string, number>;
  recipientStatusCounts: Record<string, number>;
  messages: Array<{
    id: string;
    content: string;
    direction: string;
    status: string;
    sentAt: Date | null;
    errorMessage: string | null;
    contact: {
      id: string;
      igUsername: string | null;
      name: string | null;
    };
  }>;
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch campaign");
        }

        setCampaign(data.campaign);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        toast.error(`Failed to load campaign: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/campaigns")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
          <p className="text-foreground-muted mb-4">{error || "The campaign you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/campaigns")}>
            Go Back to Campaigns
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = statusColors[campaign.status as keyof typeof statusColors] || statusColors.DRAFT;
  const progress = campaign.totalRecipients > 0
    ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
    : 0;
  const replyRate = campaign.sentCount > 0
    ? Math.round((campaign.replyCount / campaign.sentCount) * 100)
    : 0;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";
    // Handle both HH:mm and HH:mm:ss formats
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const recipientBadgeVariant = (status: string) => {
    if (status === "FAILED") return "destructive";
    if (status === "COMPLETED" || status === "REPLIED") return "default";
    return "secondary";
  };

  const messageStatusVariant = (status: string) => {
    if (status === "FAILED") return "destructive";
    if (status === "SENT") return "default";
    return "secondary";
  };

  const formatStepDelay = (step: CampaignDetails["steps"][number]) => {
    if (step.delayDays > 0) return `${step.delayDays} day(s)`;
    if (step.delayHours && step.delayHours > 0) return `${step.delayHours} hour(s)`;
    return `${step.delayMinutes} minute(s)`;
  };

  const renderStepTemplates = (step: CampaignDetails["steps"][number]) => {
    if (step.variants.length > 0) {
      return (
        <div className="space-y-2 mt-3">
          {step.variants.map((variant, vIndex) => (
            <div
              key={variant.id}
              className="p-4 bg-background-secondary rounded-lg border border-border hover:border-accent transition-colors"
            >
              <div className="text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
                Variant {vIndex + 1}
              </div>
              <div className="text-foreground text-sm leading-relaxed">
                {variant.messageTemplate}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (step.messageTemplate) {
      return (
        <div className="p-4 bg-background-secondary rounded-lg border border-border text-sm mt-3">
          <div className="text-foreground leading-relaxed">
            {step.messageTemplate}
          </div>
        </div>
      );
    }

    return (
      <div className="text-sm text-foreground-muted mt-2 italic">
        No message template
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Header with Back Button */}
      <div className="px-4 md:px-6 py-5 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/campaigns")}
            className="h-10 w-10 p-0 bg-background-elevated border border-border hover:bg-background-tertiary hover:border-border-hover rounded-xl flex-shrink-0 transition-all hover:-translate-x-0.5 !px-0"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1 truncate">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-sm text-foreground-muted truncate">{campaign.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge 
              variant={statusInfo.variant} 
              className="px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
            >
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              {statusInfo.label}
            </Badge>
            {campaign.instagramAccount && (
              <div className="bg-background-elevated border border-border text-foreground-muted px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Instagram className="h-3.5 w-3.5" />
                @{campaign.instagramAccount.igUsername}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 pb-6 space-y-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="relative bg-background-secondary rounded-2xl p-6 border border-border hover:border-border-hover transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-background-elevated flex items-center justify-center border border-border">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Recipients</span>
            </div>
            <div className="text-4xl font-bold text-foreground leading-none">{campaign.totalRecipients}</div>
          </div>
          <div className="relative bg-background-secondary rounded-2xl p-6 border border-border hover:border-border-hover transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-success" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-background-elevated flex items-center justify-center border border-border">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Sent</span>
            </div>
            <div className="text-4xl font-bold text-foreground leading-none">{campaign.sentCount}</div>
          </div>
          <div className="relative bg-background-secondary rounded-2xl p-6 border border-border hover:border-border-hover transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-background-elevated flex items-center justify-center border border-border">
                <MessageCircle className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Replies</span>
            </div>
            <div className="text-4xl font-bold text-foreground leading-none">{campaign.replyCount}</div>
            {replyRate > 0 && (
              <div className="text-xs text-success mt-2 font-medium">{replyRate}% reply rate</div>
            )}
          </div>
          <div className="relative bg-background-secondary rounded-2xl p-6 border border-border hover:border-border-hover transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-error" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-background-elevated flex items-center justify-center border border-border">
                <XCircle className="h-5 w-5 text-error" />
              </div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Failed</span>
            </div>
            <div className="text-4xl font-bold text-foreground leading-none">{campaign.failedCount}</div>
          </div>
        </div>

        {/* Progress Section */}
        {campaign.status !== "DRAFT" && (
          <Card className="p-6 bg-background-secondary border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground-muted">Progress</span>
              <span className="text-sm font-semibold text-foreground">{campaign.sentCount} / {campaign.totalRecipients} sent ({progress}%)</span>
            </div>
            <div className="h-2 bg-background-elevated rounded-full overflow-hidden relative border border-border">
              <div
                className="h-full bg-accent rounded-full transition-all relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </Card>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 bg-background-secondary border-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-background-elevated flex items-center justify-center flex-shrink-0 border border-border">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-1">Created</div>
              <div className="text-base font-semibold text-foreground">{formatDate(campaign.createdAt)}</div>
            </div>
          </Card>
          {campaign.completedAt && (
            <Card className="p-5 bg-background-secondary border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-background-elevated flex items-center justify-center flex-shrink-0 border border-border">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-1">Completed</div>
                <div className="text-base font-semibold text-foreground">{formatDate(campaign.completedAt)}</div>
              </div>
            </Card>
          )}
          {campaign.sendStartTime && campaign.sendEndTime && (
            <Card className="p-5 bg-background-secondary border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-background-elevated flex items-center justify-center flex-shrink-0 border border-border">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-1">Send Window</div>
                <div className="text-base font-semibold text-foreground">
                  {formatTimeTo12Hour(campaign.sendStartTime)} - {formatTimeTo12Hour(campaign.sendEndTime)}
                  {campaign.timezone && <span className="text-foreground-muted text-sm"> ({campaign.timezone})</span>}
                </div>
              </div>
            </Card>
          )}
          {campaign.messagesPerDay > 0 && (
            <Card className="p-5 bg-background-secondary border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-background-elevated flex items-center justify-center flex-shrink-0 border border-border">
                <MessageCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-1">Messages Per Day</div>
                <div className="text-base font-semibold text-foreground">{campaign.messagesPerDay}</div>
              </div>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recipients" className="w-full">
          {/* Page-level sizing overrides (do NOT change shared Tabs component) */}
          <TabsList className="flex w-full h-12 rounded-xl bg-background-secondary border border-border p-1 gap-1">
            <TabsTrigger value="recipients" className="flex-1 h-full px-4 py-0 text-sm rounded-lg">
              Recipients
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex-1 h-full px-4 py-0 text-sm rounded-lg">
              Message Steps
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 h-full px-4 py-0 text-sm rounded-lg">
              Recent Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipients" className="mt-6">
            <Card className="p-6 bg-background-secondary border-border">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Recipients ({campaign.recipients.length})</h3>
                {Object.keys(campaign.recipientStatusCounts).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(campaign.recipientStatusCounts).map(([status, count]) => (
                      <Badge key={status} variant="secondary">
                        {status}: {count}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {campaign.recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center justify-between p-5 bg-background-elevated rounded-xl border border-border hover:bg-background-tertiary hover:border-border-hover hover:translate-x-1 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Avatar
                          src={recipient.contact.profilePictureUrl}
                          alt={recipient.contact.igUsername || ""}
                          name={recipient.contact.name || recipient.contact.igUsername}
                          size="lg"
                          className="border-2 border-border"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-foreground">
                          {recipient.contact.name || recipient.contact.igUsername || "Unknown"}
                        </div>
                        <div className="text-sm text-foreground-muted truncate">
                          @{recipient.contact.igUsername || "unknown"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        variant={recipientBadgeVariant(recipient.status)}
                      >
                        {recipient.status}
                      </Badge>
                      {recipient.assignedAccount && (
                        <span className="text-xs text-foreground-muted">
                          @{recipient.assignedAccount.igUsername}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="mt-6">
            <Card className="p-6 bg-background-secondary border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Message Steps ({campaign.steps.length})</h3>
              <div className="space-y-4">
                {campaign.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="p-5 bg-background-elevated rounded-xl border border-border hover:bg-background-tertiary hover:border-border-hover transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Step {step.stepOrder}</Badge>
                        {step.name && <span className="font-medium">{step.name}</span>}
                      </div>
                      {(step.delayDays > 0 || step.delayHours || step.delayMinutes > 0) && (
                        <span className="text-sm text-foreground-muted">
                          Delay: {formatStepDelay(step)}
                        </span>
                      )}
                    </div>
                    {renderStepTemplates(step)}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card className="p-6 bg-background-secondary border-border">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Recent Messages</h3>
                <span className="text-sm text-foreground-muted">({campaign.messages.length})</span>
              </div>
              {campaign.messages.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {campaign.messages.map((message) => {
                    const initials = (message.contact.name || message.contact.igUsername || "U")
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    
                    return (
                      <div
                        key={message.id}
                        className="p-5 bg-background-elevated rounded-xl border border-border hover:bg-background-tertiary hover:border-border-hover transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground mb-0.5">
                                {message.contact.name || message.contact.igUsername || "Unknown"}
                              </div>
                              <div className="text-xs text-foreground-muted">
                                @{message.contact.igUsername || "unknown"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {message.direction}
                            </Badge>
                            <Badge
                              variant={messageStatusVariant(message.status)}
                              className="text-xs"
                            >
                              {message.status}
                            </Badge>
                            {message.sentAt && (
                              <span className="text-xs text-foreground-muted ml-2">
                                {formatDate(message.sentAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-foreground-muted leading-relaxed pl-[52px]">
                          {campaignService.personalizeMessage(message.content, {name: message.contact.name, username: message.contact.igUsername})}
                        </div>
                        {message.errorMessage && (
                          <div className="mt-3 ml-[52px] p-2 bg-background-elevated border border-error/30 rounded-lg text-xs text-error">
                            {message.errorMessage}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground-muted">
                  No messages sent yet
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
