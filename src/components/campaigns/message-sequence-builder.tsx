'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  MessageCircle,
  Clock,
  Copy,
  Shuffle,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MessageVariant {
  id: string;
  template: string;
}

export interface MessageStep {
  id: string;
  stepOrder: number;
  messageTemplate: string; // Keep for backward compatibility, but variants take precedence
  variants?: MessageVariant[]; // Array of message variants (for UI compatibility)
  delayHours?: number; // Delay in hours (new)
  delayDays?: number; // Keep for backward compatibility
  condition?: "on_reply" | "time_based"; // Optional condition
}

interface MessageSequenceBuilderProps {
  steps: MessageStep[];
  onChange: (steps: MessageStep[]) => void;
  className?: string;
}

export function MessageSequenceBuilder({
  steps,
  onChange,
  className,
}: MessageSequenceBuilderProps) {
  const addStep = () => {
    const newStep: MessageStep = {
      id: `step-${Date.now()}`,
      stepOrder: steps.length + 1,
      messageTemplate: "",
      variants: [{ id: `variant-${Date.now()}`, template: "" }],
      delayDays: steps.length === 0 ? 0 : 1, // First step has no delay, subsequent steps default to 1 day
    };
    onChange([...steps, newStep]);
  };

  const addVariant = (stepId: string) => {
    onChange(
      steps.map((step) => {
        if (step.id === stepId) {
          const variants = step.variants || [
            {
              id: `variant-${Date.now()}`,
              template: step.messageTemplate || "",
            },
          ];
          return {
            ...step,
            variants: [
              ...variants,
              { id: `variant-${Date.now()}`, template: "" },
            ],
          };
        }
        return step;
      })
    );
  };

  const updateVariant = (
    stepId: string,
    variantId: string,
    template: string
  ) => {
    onChange(
      steps.map((step) => {
        if (step.id === stepId && step.variants) {
          return {
            ...step,
            variants: step.variants.map((v) =>
              v.id === variantId ? { ...v, template } : v
            ),
            messageTemplate:
              step.variants.length === 1 ? template : step.messageTemplate, // Update main template if only one variant
          };
        }
        return step;
      })
    );
  };

  const deleteVariant = (stepId: string, variantId: string) => {
    onChange(
      steps.map((step) => {
        if (step.id === stepId && step.variants) {
          const newVariants = step.variants.filter((v) => v.id !== variantId);
          // If no variants left, create one empty variant
          if (newVariants.length === 0) {
            return {
              ...step,
              variants: [{ id: `variant-${Date.now()}`, template: "" }],
              messageTemplate: "",
            };
          }
          return {
            ...step,
            variants: newVariants,
            messageTemplate:
              newVariants.length === 1
                ? newVariants[0].template
                : step.messageTemplate,
          };
        }
        return step;
      })
    );
  };

  const duplicateVariant = (stepId: string, variantId: string) => {
    onChange(
      steps.map((step) => {
        if (step.id === stepId && step.variants) {
          const variantToDuplicate = step.variants.find(
            (v) => v.id === variantId
          );
          if (variantToDuplicate) {
            return {
              ...step,
              variants: [
                ...step.variants,
                {
                  id: `variant-${Date.now()}`,
                  template: variantToDuplicate.template,
                },
              ],
            };
          }
        }
        return step;
      })
    );
  };

  const updateStep = (id: string, updates: Partial<MessageStep>) => {
    onChange(
      steps.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
  };

  const deleteStep = (id: string) => {
    const newSteps = steps.filter((step) => step.id !== id);
    // Reorder steps
    onChange(
      newSteps.map((step, index) => ({
        ...step,
        stepOrder: index + 1,
      }))
    );
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];

    // Reorder stepOrder
    onChange(
      newSteps.map((step, i) => ({
        ...step,
        stepOrder: i + 1,
      }))
    );
  };

  return (
    <div className={cn("space-y-6 max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-accent" />
            <h3 className="text-base font-semibold text-foreground">
              Message Sequence
            </h3>
          </div>
          <p className="text-sm text-foreground-subtle">
            Create your message sequence with multiple variants for A/B testing
          </p>
        </div>
        <Button onClick={addStep} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Message Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 bg-background-elevated rounded-xl border border-border border-dashed">
          <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-accent" />
          </div>
          <h4 className="text-base font-medium text-foreground mb-2">
            No messages yet
          </h4>
          <p className="text-sm text-foreground-muted mb-4 max-w-sm mx-auto">
            Create your first message to start building your campaign sequence
          </p>
          <Button onClick={addStep} variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Create First Message
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => {
            const variants =
              step.variants && step.variants.length > 0
                ? step.variants
                : [{ id: "default", template: step.messageTemplate || "" }];

            return (
              <div
                key={step.id}
                className="bg-background-elevated rounded-xl border border-border p-6 space-y-5">
                {/* Step Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent font-bold text-base">
                        {step.stepOrder}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        {step.stepOrder === 1
                          ? "Initial Message"
                          : `Follow-up Message ${step.stepOrder - 1}`}
                      </h4>
                      {step.stepOrder === 1 && (
                        <p className="text-xs text-foreground-subtle mt-0.5">
                          Sends immediately at a random time within your
                          selected range
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(index, "up")}
                        className="h-9 w-9 p-0 hover:bg-accent/10"
                        title="Move up">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    )}
                    {index < steps.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(index, "down")}
                        className="h-9 w-9 p-0 hover:bg-accent/10"
                        title="Move down">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStep(step.id)}
                      className="h-9 w-9 p-0 text-error hover:text-error hover:bg-error/10"
                      title="Delete step">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Message Variants Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Message Content
                    </label>
                    {variants.length > 1 && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        <Shuffle className="h-3 w-3" />
                        {variants.length} variants (randomly selected)
                      </span>
                    )}
                  </div>

                  {/* Variants List - Horizontally Scrollable */}
                  <div className="overflow-x-auto pb-2 -mx-2 px-2">
                    <div className="flex gap-4 min-w-max">
                      {variants.map((variant, variantIndex) => (
                        <div
                          key={variant.id}
                          className="relative w-80 flex-shrink-0 p-4 rounded-lg border border-border bg-background space-y-3 flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground-muted px-2.5 py-1 rounded-md bg-background-elevated border border-border">
                                Variant {variantIndex + 1}
                              </span>
                              {variants.length > 1 && (
                                <span className="text-xs text-foreground-subtle whitespace-nowrap">
                                  Random
                                </span>
                              )}
                            </div>
                            {variants.length > 1 && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    duplicateVariant(step.id, variant.id)
                                  }
                                  className="h-9 w-9 p-0 hover:bg-accent/10"
                                  title="Duplicate variant">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteVariant(step.id, variant.id)
                                  }
                                  className="h-9 w-9 p-0 text-error hover:text-error hover:bg-error/10"
                                  title="Delete variant"
                                  disabled={variants.length === 1}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <textarea
                            value={variant.template}
                            onChange={(e) => {
                              if (step.variants && step.variants.length > 0) {
                                updateVariant(
                                  step.id,
                                  variant.id,
                                  e.target.value
                                );
                              } else {
                                updateStep(step.id, {
                                  messageTemplate: e.target.value,
                                });
                              }
                            }}
                            placeholder="Hi {{name}}, I wanted to reach out about..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-background-elevated border border-border text-foreground placeholder-foreground-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none text-sm transition-all flex-1"
                          />

                          <div className="flex items-center justify-between text-xs mt-auto">
                            <div className="flex items-center gap-1.5 text-foreground-subtle">
                              <Info className="h-3 w-3 flex-shrink-0" />
                              <span className="text-xs">
                                Use {`{{name}}`} and {`{{username}}`}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "font-medium whitespace-nowrap",
                                variant.template.length > 1000
                                  ? "text-error"
                                  : variant.template.length > 800
                                  ? "text-amber-400"
                                  : "text-foreground-subtle"
                              )}>
                              {variant.template.length} / 1000
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Add Variant Card */}
                      <div className="w-80 flex-shrink-0">
                        <button
                          onClick={() => addVariant(step.id)}
                          className="w-full h-full min-h-[200px] p-4 rounded-lg border-2 border-dashed border-border bg-background-elevated hover:border-accent hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-2 text-foreground-subtle hover:text-foreground group">
                          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Plus className="h-5 w-5 text-accent" />
                          </div>
                          <span className="text-sm font-medium">
                            Add Variant
                          </span>
                          <span className="text-xs text-center">
                            Create another message variant
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scroll Indicator */}
                  {variants.length > 1 && (
                    <p className="text-xs text-foreground-subtle text-center pt-1">
                      ← Scroll horizontally to view all variants →
                    </p>
                  )}
                </div>

                {/* Follow-up Options (only for step 2+) */}
                {step.stepOrder > 1 && (
                  <div className="pt-4 border-t border-border">
                    <h5 className="text-sm font-medium text-foreground mb-4">
                      Follow-up Settings
                    </h5>
                    <div className="space-y-4">
                      {/* Delay */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground-muted">
                          Delay (days)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={step.delayDays ?? (step.delayHours ? step.delayHours / 24 : 0)}
                          onChange={(e) =>
                            updateStep(step.id, {
                              delayDays: Math.max(
                                0,
                                parseInt(e.target.value) || 0
                              ),
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        />
                        <p className="text-xs text-foreground-subtle">
                          Days to wait after previous message. Follow-up will only send if recipient hasn't replied.
                        </p>
                      </div>
                    </div>

                    {/* Step Summary Badge */}
                    <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-background border border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-accent/20 text-accent border border-accent/30">
                          Auto Follow-up
                        </span>
                        <span className="text-xs text-foreground-muted">
                          Sends after {step.delayDays ?? (step.delayHours ? step.delayHours / 24 : 0)} day
                          {(step.delayDays ?? (step.delayHours ? step.delayHours / 24 : 0)) !== 1 ? "s" : ""} (if no reply)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      {steps.length > 0 && (
        <div className="p-4 rounded-lg bg-background-elevated border border-border">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-foreground">
                Tips for better results
              </p>
              <ul className="space-y-1 text-foreground-subtle list-disc list-inside">
                <li>
                  Create multiple variants to test different messaging
                  approaches
                </li>
                <li>
                  Use {`{{name}}`} and {`{{username}}`} to personalize messages
                </li>
                <li>
                  Keep messages concise and engaging (under 200 characters
                  recommended)
                </li>
                <li>
                  Follow-up messages only send if the previous step conditions
                  are met
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
