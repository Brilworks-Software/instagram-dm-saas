// Create campaign modal component

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TimeRangePicker, getUserTimezone } from "@/components/campaigns/time-range-picker";
import { MessagesPerDaySlider } from "@/components/campaigns/messages-per-day-slider";
import { MessageSequenceBuilder, type MessageStep } from "@/components/campaigns/message-sequence-builder";
import { AccountSelector } from "@/components/campaigns/account-selector";
import { RepliesPreview } from "@/components/campaigns/replies-preview";
import type { InstagramAccount, Contact, Lead } from "./types";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: NewCampaignData) => Promise<void>;
  accounts: InstagramAccount[];
  contacts: Contact[];
  leads: Lead[];
}

export interface NewCampaignData {
  name: string;
  description: string;
  schedule_type: "IMMEDIATE" | "SPECIFIC_TIME";
  scheduled_at?: string; // ISO datetime string
  sendStartTime: string;
  sendEndTime: string;
  timezone: string;
  messagesPerDay: number;
  accountIds: string[];
  contactIds: string[];
  leadIds: string[];
  messageSteps: MessageStep[];
}

const INITIAL_CAMPAIGN: Omit<NewCampaignData, "timezone"> & { timezone: string } = {
  name: "",
  description: "",
  schedule_type: "IMMEDIATE",
  scheduled_at: undefined,
  sendStartTime: "08:00:00",
  sendEndTime: "22:00:00",
  timezone: "America/New_York",
  messagesPerDay: 10,
  accountIds: [],
  contactIds: [],
  leadIds: [],
  messageSteps: [],
};

export function CreateCampaignModal({
  isOpen,
  onClose,
  onCreate,
  accounts,
  contacts,
  leads,
}: CreateCampaignModalProps) {
  const [step, setStep] = useState(0); // Start at step 0 (scheduling)
  const [isCreating, setIsCreating] = useState(false);
  const [campaign, setCampaign] = useState<NewCampaignData>(INITIAL_CAMPAIGN);
  const [leadLists, setLeadLists] = useState<any[]>([]);
  const [selectedLeadListIds, setSelectedLeadListIds] = useState<string[]>([]);

  // Set user's timezone on mount
  useEffect(() => {
    if (isOpen) {
      const userTimezone = getUserTimezone();
      setCampaign((prev) => ({ ...prev, timezone: userTimezone }));
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setCampaign(INITIAL_CAMPAIGN);
    }
  }, [isOpen]);

  // Fetch lead lists on open
  useEffect(() => {
    if (isOpen) {
      fetch("/api/leads/lists")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setLeadLists(data.lists || []);
        });
    }
  }, [isOpen]);

  // When selectedLeadListIds changes, update campaign.leadIds to include all leads from selected lists (union)
  useEffect(() => {
    if (!selectedLeadListIds.length) return;
    const leadsFromLists = leadLists
      .filter((list) => selectedLeadListIds.includes(list.id))
      .flatMap((list) => list.members.map((m: any) => m.lead.id));
    setCampaign((prev) => ({
      ...prev,
      leadIds: Array.from(new Set([...prev.leadIds, ...leadsFromLists])),
    }));
    // eslint-disable-next-line
  }, [selectedLeadListIds]);

  // Remove leads from deselected lists
  useEffect(() => {
    if (!leadLists.length) return;
    const allSelectedLeads = leadLists
      .filter((list) => selectedLeadListIds.includes(list.id))
      .flatMap((list) => list.members.map((m: any) => m.lead.id));
    setCampaign((prev) => ({
      ...prev,
      leadIds: prev.leadIds.filter(
        (id) =>
          allSelectedLeads.includes(id) ||
          // keep if user manually selected (not from a list)
          !leadLists.some((list) =>
            list.members.some((m: any) => m.lead.id === id)
          )
      ),
    }));
    // eslint-disable-next-line
  }, [selectedLeadListIds, leadLists]);

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 0:
        // Scheduling step: if SPECIFIC_TIME, scheduled_at must be set
        return campaign.schedule_type === "IMMEDIATE" || 
               (campaign.schedule_type === "SPECIFIC_TIME" && !!campaign.scheduled_at);
      case 1:
        return !!campaign.name?.trim();
      case 2:
        return campaign.contactIds.length > 0 || campaign.leadIds.length > 0;
      case 3:
        return campaign.accountIds.length > 0;
      case 4:
        return (
          campaign.messageSteps.length > 0 &&
          campaign.messageSteps.every((s) => {
            if (s.variants && s.variants.length > 0) {
              return s.variants.some((v) => v.template.trim().length > 0);
            }
            return s.messageTemplate.trim().length > 0;
          })
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleCreate = async () => {
    if (!validateStep(5)) return;

    setIsCreating(true);
    try {
      // Calculate cumulative delay_days for each step based on stepOrder
      // Sort steps by order to calculate cumulative delays
      const sortedSteps = [...campaign.messageSteps].sort(
        (a, b) => a.stepOrder - b.stepOrder
      );
      
      // Calculate cumulative delays
      let cumulativeDelay = 0;
      const delayMap = new Map<number, number>();
      sortedSteps.forEach((step) => {
        cumulativeDelay += step.delayDays || 0;
        delayMap.set(step.stepOrder, cumulativeDelay);
      });

      // Update steps with cumulative delays while preserving original array order
      const stepsWithCumulativeDelay = campaign.messageSteps.map((step) => ({
        ...step,
        delayDays: delayMap.get(step.stepOrder) ?? step.delayDays ?? 0,
      }));

      const campaignWithCumulativeDelays = {
        ...campaign,
        messageSteps: stepsWithCumulativeDelay,
      };

      await onCreate(campaignWithCumulativeDelays);
      onClose();
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      const messages: Record<number, string> = {
        0: "Please select a schedule time",
        1: "Please enter a campaign name",
        2: "Please select at least one recipient",
        3: "Please select at least one Instagram account",
        4: "Please add at least one message",
      };
      alert(messages[step] || "Please complete this step");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary rounded-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Create Campaign
            </h2>
            <p className="text-sm text-foreground-muted mt-1">
              Step {step + 1} of 6
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Schedule Campaign */}
          {step === 0 && (
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-accent font-semibold text-sm">1</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Schedule Campaign
                  </h3>
                </div>

                <div className="bg-background-elevated rounded-xl border border-border p-5 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">
                      When should this campaign start?
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-background cursor-pointer">
                        <input
                          type="radio"
                          name="schedule_type"
                          value="IMMEDIATE"
                          checked={campaign.schedule_type === "IMMEDIATE"}
                          onChange={(e) =>
                            setCampaign((prev) => ({
                              ...prev,
                              schedule_type: e.target.value as "IMMEDIATE" | "SPECIFIC_TIME",
                              scheduled_at: undefined,
                            }))
                          }
                          className="text-accent"
                        />
                        <div>
                          <div className="font-medium text-foreground">Start Immediately</div>
                          <div className="text-sm text-foreground-muted">
                            Campaign will begin as soon as it's created
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-background cursor-pointer">
                        <input
                          type="radio"
                          name="schedule_type"
                          value="SPECIFIC_TIME"
                          checked={campaign.schedule_type === "SPECIFIC_TIME"}
                          onChange={(e) =>
                            setCampaign((prev) => ({
                              ...prev,
                              schedule_type: e.target.value as "IMMEDIATE" | "SPECIFIC_TIME",
                            }))
                          }
                          className="text-accent"
                        />
                        <div>
                          <div className="font-medium text-foreground">Schedule for Later</div>
                          <div className="text-sm text-foreground-muted">
                            Choose a specific date and time to start
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {campaign.schedule_type === "SPECIFIC_TIME" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Scheduled Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          campaign.scheduled_at
                            ? (() => {
                                // Convert UTC ISO string to local datetime-local format
                                // datetime-local expects YYYY-MM-DDTHH:mm in local timezone
                                const utcDate = new Date(campaign.scheduled_at);
                                const year = utcDate.getFullYear();
                                const month = String(utcDate.getMonth() + 1).padStart(2, '0');
                                const day = String(utcDate.getDate()).padStart(2, '0');
                                const hours = String(utcDate.getHours()).padStart(2, '0');
                                const minutes = String(utcDate.getMinutes()).padStart(2, '0');
                                return `${year}-${month}-${day}T${hours}:${minutes}`;
                              })()
                            : ""
                        }
                        onChange={(e) => {
                          const dateTime = e.target.value;
                          if (dateTime) {
                            // Convert local datetime-local format to UTC ISO string
                            // new Date(dateTime) interprets the value as local time
                            const localDate = new Date(dateTime);
                            const isoString = localDate.toISOString();
                            setCampaign((prev) => ({
                              ...prev,
                              scheduled_at: isoString,
                            }));
                          } else {
                            setCampaign((prev) => ({
                              ...prev,
                              scheduled_at: undefined,
                            }));
                          }
                        }}
                        min={(() => {
                          // Get current local time in datetime-local format
                          const now = new Date();
                          const year = now.getFullYear();
                          const month = String(now.getMonth() + 1).padStart(2, '0');
                          const day = String(now.getDate()).padStart(2, '0');
                          const hours = String(now.getHours()).padStart(2, '0');
                          const minutes = String(now.getMinutes()).padStart(2, '0');
                          return `${year}-${month}-${day}T${hours}:${minutes}`;
                        })()}
                        className="w-full px-4 py-3 rounded-lg bg-background !border-none text-foreground placeholder:text-foreground-subtle !outline-none transition-all [color-scheme:dark]"
                        style={{
                          colorScheme: 'dark',
                        }}
                      />
                      <p className="text-xs text-foreground-subtle mt-1.5">
                        Select when you want the campaign to start
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Campaign Details & Scheduling */}
          {step === 1 && (
            <div className="space-y-8 max-w-3xl mx-auto">
              {/* Campaign Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-accent font-semibold text-sm">1</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Campaign Details
                  </h3>
                </div>

                <div className="bg-background-elevated rounded-xl border border-border p-5 space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      Campaign Name
                      <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      value={campaign.name}
                      onChange={(e) =>
                        setCampaign((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., Holiday Promotion 2025"
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-foreground-subtle focus:border-accent  !outline-none !ring-0 transition-all"
                    />
                    <p className="text-xs text-foreground-subtle mt-1.5">
                      Give your campaign a memorable name
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={campaign.description}
                      onChange={(e) =>
                        setCampaign((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="What is this campaign about? (Optional)"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-foreground-subtle focus:border-accent  !outline-none !ring-0 resize-none transition-all"
                    />
                    <p className="text-xs text-foreground-subtle mt-1.5">
                      Add context about your campaign goals
                    </p>
                  </div>
                </div>
              </div>

              {/* Scheduling Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-accent font-semibold text-sm">2</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Scheduling & Rate Limits
                  </h3>
                </div>

                <div className="bg-background-elevated rounded-xl border border-border p-5 space-y-6">
                  <TimeRangePicker
                    startTime={campaign.sendStartTime}
                    endTime={campaign.sendEndTime}
                    timezone={campaign.timezone}
                    onStartTimeChange={(time) =>
                      setCampaign((prev) => ({ ...prev, sendStartTime: time }))
                    }
                    onEndTimeChange={(time) =>
                      setCampaign((prev) => ({ ...prev, sendEndTime: time }))
                    }
                    onTimezoneChange={(tz) =>
                      setCampaign((prev) => ({ ...prev, timezone: tz }))
                    }
                  />

                  <div className="pt-4 border-t border-border">
                    <MessagesPerDaySlider
                      value={campaign.messagesPerDay}
                      onChange={(value) =>
                        setCampaign((prev) => ({ ...prev, messagesPerDay: value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Recipients */}
          {step === 2 && (
              <RecipientsStep
                contacts={contacts}
                leads={leads}
                selectedContactIds={campaign.contactIds}
                selectedLeadIds={campaign.leadIds}
                onContactToggle={(id) => {
                  setCampaign((prev) => ({
                    ...prev,
                    contactIds: prev.contactIds.includes(id)
                      ? prev.contactIds.filter((cid) => cid !== id)
                      : [...prev.contactIds, id],
                  }));
                }}
                onLeadToggle={(id) => {
                  setCampaign((prev) => ({
                    ...prev,
                    leadIds: prev.leadIds.includes(id)
                      ? prev.leadIds.filter((lid) => lid !== id)
                      : [...prev.leadIds, id],
                  }));
                }}
                leadLists={leadLists.map((l) => ({ id: l.id, name: l.name }))}
                selectedLeadListIds={selectedLeadListIds}
                onLeadListChange={setSelectedLeadListIds}
              />
          )}

          {/* Step 3: Select Instagram Account(s) */}
          {step === 3 && (
              <AccountSelector
                accounts={accounts}
                selectedAccountIds={campaign.accountIds}
                onSelectionChange={(ids) =>
                  setCampaign((prev) => ({ ...prev, accountIds: ids }))
                }
                onReconnect={(accountId) => {
                console.log("Reconnect account:", accountId);
                  window.location.href = "/settings/instagram";
                }}
              />
          )}

          {/* Step 4: Message Sequence Builder */}
          {step === 4 && (
            <div className="max-w-4xl mx-auto">
              <MessageSequenceBuilder
                steps={
                  campaign.messageSteps.length === 0
                    ? [
                        {
                          id: "initial",
                          stepOrder: 1,
                          messageTemplate: "",
                          variants: [
                            { id: `variant-${Date.now()}`, template: "" },
                          ],
                          delayDays: 0,
                          condition: "time_based",
                        },
                      ]
                    : campaign.messageSteps.map((step) => ({
                        ...step,
                        variants: step.variants || [
                          {
                            id: `variant-${Date.now()}`,
                            template: step.messageTemplate || "",
                          },
                        ],
                      }))
                }
                onChange={(steps) =>
                  setCampaign((prev) => ({ ...prev, messageSteps: steps }))
                }
              />
            </div>
          )}

          {/* Step 5: Replies Preview & Review */}
          {step === 5 && (
            <PreviewStep
              campaign={campaign}
              contacts={contacts}
              leads={leads}
              accounts={accounts}
            />
          )}
        </div>

          {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          {step > 0 && (
            <Button variant="secondary" className="flex-1" onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button
              className="flex-1"
              onClick={handleNext}
              disabled={!validateStep(step)}>
              Next
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={isCreating || !validateStep(5)}>
                {isCreating ? "Creating..." : "Create Campaign"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Recipients Step Component
function RecipientsStep({
  contacts,
  leads,
  selectedContactIds,
  selectedLeadIds,
  onContactToggle,
  onLeadToggle,
  leadLists = [],
  selectedLeadListIds = [],
  onLeadListChange,
}: {
  contacts: Contact[];
  leads: Lead[];
  selectedContactIds: string[];
  selectedLeadIds: string[];
  onContactToggle: (id: string) => void;
  onLeadToggle: (id: string) => void;
  leadLists?: { id: string; name: string }[];
  selectedLeadListIds?: string[];
  onLeadListChange?: (ids: string[]) => void;
}) {
  const [listSearch, setListSearch] = useState("");
  const filteredLists = leadLists.filter((list) =>
    list.name.toLowerCase().includes(listSearch.toLowerCase())
  );
  const toggleLeadList = (listId: string) => {
    if (!onLeadListChange) return;
    if (selectedLeadListIds.includes(listId)) {
      onLeadListChange(selectedLeadListIds.filter((id) => id !== listId));
    } else {
      onLeadListChange([...selectedLeadListIds, listId]);
    }
  };
  return (
    <div className="space-y-4">
      {/* Lead List Multi-Select UI */}
      <div className="mb-4">
        {leadLists.length > 0 ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-sm text-foreground">Select Lead List(s)</span>
              {selectedLeadListIds.length > 0 && (
                <span className="text-xs text-accent font-semibold bg-accent/10 rounded px-2 py-0.5 ml-2">
                  {selectedLeadListIds.length} selected
                </span>
              )}
            </div>
            {/* Selected chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedLeadListIds.map((id) => {
                const list = leadLists.find((l) => l.id === id);
                if (!list) return null;
                return (
                  <span
                    key={id}
                    className="bg-accent text-white rounded-full px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleLeadList(id)}
                  >
                    {list.name}
                    <span className="ml-1 text-white/80">&times;</span>
                  </span>
                );
              })}
            </div>
            {/* Search input */}
            <input
              type="text"
              placeholder="Search lists..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 rounded border border-border bg-background text-foreground text-sm"
            />
            {/* List options */}
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {filteredLists.map((list) => (
                <label
                  key={list.id}
                  className={
                    "flex items-center gap-2 px-3 py-2 rounded cursor-pointer border " +
                    (selectedLeadListIds.includes(list.id)
                      ? "bg-accent/10 border-accent"
                      : "bg-background border-border hover:border-border-hover")
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedLeadListIds.includes(list.id)}
                    onChange={() => toggleLeadList(list.id)}
                    className="accent-accent h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">
                    {list.name}
                  </span>
                </label>
              ))}
              {filteredLists.length === 0 && (
                <span className="col-span-2 text-xs text-foreground-muted text-center">No lists found</span>
              )}
            </div>
          </>
        ) : (
          <div className="text-xs text-foreground-muted text-center py-4 border border-dashed border-border rounded-lg">
            No lead lists available
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">
          Select Leads
        </h3>
        <div className="max-h-64 overflow-y-auto border border-border rounded-lg p-2 space-y-2">
          {leads.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-4">
              No leads available
            </p>
          ) : (
            leads.filter((lead: any) => lead.status !== "contacted").map((lead: Lead) => (
              <label
                key={lead.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-elevated cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedLeadIds.includes(lead.id)}
                  onChange={() => onLeadToggle(lead.id)}
                  className="rounded border-border"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Avatar
                    src={lead.profilePictureUrl}
                    alt={lead.igUsername}
                    name={lead.name || lead.igUsername}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {lead.name || lead.igUsername}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      @{lead.igUsername}
                    </p>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-foreground-subtle mt-2">
          Selected: {selectedContactIds.length + selectedLeadIds.length}{" "}
          recipients
        </p>
      </div>

      {/* ...existing code for contacts and leads... */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">
          Select Contacts
        </h3>
        <div className="max-h-64 overflow-y-auto border border-border rounded-lg p-2 space-y-2">
          {contacts.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-4">
              No contacts available
            </p>
          ) : (
            contacts.map((contact) => (
              <label
                key={contact.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-elevated cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedContactIds.includes(contact.id)}
                  onChange={() => onContactToggle(contact.id)}
                  className="rounded border-border"
                />
                <div className="flex items-center gap-2 flex-1">
                  {contact.profilePictureUrl && (
                    <img
                      src={contact.profilePictureUrl}
                      alt={contact.igUsername}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {contact.name || contact.igUsername}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      @{contact.igUsername}
                    </p>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Preview Step Component
function PreviewStep({
  campaign,
  contacts,
  leads,
  accounts,
}: {
  campaign: NewCampaignData;
  contacts: Contact[];
  leads: Lead[];
  accounts: InstagramAccount[];
}) {
  const recipients = [
    ...campaign.contactIds
      .map((id) => {
        const contact = contacts.find((c) => c.id === id);
        if (!contact) return null;
        const accountIndex =
          campaign.contactIds.indexOf(id) % campaign.accountIds.length;
        const accountId = campaign.accountIds[accountIndex];
        const account = accounts.find((a) => a.id === accountId);
        return {
          id: contact.id,
          contactId: contact.id,
          name: contact.name,
          igUsername: contact.igUsername,
          profilePictureUrl: contact.profilePictureUrl,
          assignedAccountId: accountId,
          assignedAccountUsername: account?.igUsername,
        };
      })
      .filter(Boolean),
    ...campaign.leadIds
      .map((id) => {
        const lead = leads.find((l) => l.id === id);
        if (!lead) return null;
        const accountIndex =
          (campaign.contactIds.length + campaign.leadIds.indexOf(id)) %
          campaign.accountIds.length;
        const accountId = campaign.accountIds[accountIndex];
        const account = accounts.find((a) => a.id === accountId);
        return {
          id: lead.id,
          contactId: lead.igUserId,
          name: lead.name,
          igUsername: lead.igUsername,
          profilePictureUrl: lead.profilePictureUrl,
          assignedAccountId: accountId,
          assignedAccountUsername: account?.igUsername,
        };
      })
      .filter(Boolean),
  ] as any[];

  return (
    <div className="space-y-6">
      <RepliesPreview recipients={recipients} campaign={campaign}/>

  </div>
  );
}


