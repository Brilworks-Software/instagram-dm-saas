'use client';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    validateEmail,
    validateInstagramId,
} from "@/lib/waiting-list/validation";
import { AlertCircle, CheckCircle, Instagram, Mail,ArrowRight } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface WaitingListFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// Component
// ============================================================================

export function WaitingListForm({ open, onOpenChange }: WaitingListFormProps) {
  // State
  const [instagramId, setInstagramId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError(null);
    
    // Show additional fields if email is valid
    if (value.trim() && validateEmail(value.trim())) {
      setShowAdditionalFields(true);
    } else {
      setShowAdditionalFields(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email is required and valid
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate Instagram ID format if provided
    if (instagramId.trim() && !validateInstagramId(instagramId.trim())) {
      setError(
        "Please enter a valid Instagram ID (letters, numbers, dots, and underscores only)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Get client IP from ipify.org (client-side - gets real IP even when running locally)
      let clientIP: string | null = null;
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          clientIP = ipData.ip || null;
        }
      } catch (ipError) {
        console.error("Failed to get IP from ipify:", ipError);
      }

      // Get previous page from sessionStorage or document.referrer
      const previousPage =
        typeof window !== "undefined"
          ? sessionStorage.getItem("previousPage") || document.referrer || ""
          : "";

      // Store current page as previous page for next navigation
      if (typeof window !== "undefined") {
        sessionStorage.setItem("previousPage", window.location.href);
      }

      // Submit to API with client IP
      const response = await fetch("/api/waiting-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim() || null,
          instagram_id: instagramId.trim() || null,
          message: message.trim() || null,
          previous_page: previousPage || null,
          client_ip: clientIP, // Send client IP to avoid localhost issues
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waiting list");
      }

      // Success - reset form and show success message
      setSuccess(true);
      setInstagramId("");
      setEmail("");
      setMessage("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setInstagramId("");
      setEmail("");
      setMessage("");
      setError(null);
      setSuccess(false);
      setShowAdditionalFields(false);
      onOpenChange(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose} title="Get Free Access Forever">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success ? (
          // Success State
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-accent mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Successfully Joined!
            </h3>
            <p className="text-foreground-muted text-lg mb-2">
              Welcome to SocialOra
            </p>
            <p className="text-sm text-foreground-muted">
              You're all set! You'll get free access to <span className="font-semibold text-foreground">1 Instagram account + 40 DMs daily</span>, forever. We'll send you access details via email shortly.
            </p>
          </div>
        ) : (
          // Form State
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/15 via-pink-500/15 to-purple-500/15 border border-accent/30 mb-4">
                <span className="text-sm font-semibold text-accent">🎁 Free Forever Plan</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Get Free Access Forever
              </h3>
              <p className="text-sm sm:text-base text-foreground-muted mb-3 leading-relaxed">
                Join <span className="font-semibold text-accent">thousands of creators</span> who are already automating their Instagram DMs. Get <span className="font-semibold text-foreground">1 Instagram account + 40 DMs daily</span> - completely free, forever.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-foreground-muted">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Free forever - no hidden fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Access in minutes</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  leftIcon={<Mail className="h-4 w-4" />}
                  disabled={isSubmitting}
                />
              </div>

              {/* Additional Fields - Show only after valid email */}
              {showAdditionalFields && (
                <>
                  {/* Instagram ID Input */}
                  <div>
                    <Input
                      label="Instagram ID (Optional)"
                      type="text"
                      placeholder="your_instagram_handle"
                      value={instagramId}
                      onChange={(e) => setInstagramId(e.target.value)}
                      leftIcon={<Instagram className="h-4 w-4" />}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                      Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us why you're interested..."
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
                <AlertCircle className="h-4 w-4 text-error flex-shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                isLoading={isSubmitting}
                className="w-full py-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-accent via-pink-600 to-purple-600 hover:from-accent/90 hover:via-pink-500 hover:to-purple-500 text-white shadow-xl shadow-accent/40 hover:shadow-accent/60 hover:scale-[1.02] transition-all">
                Claim My Free Forever Plan
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-center text-xs text-foreground-muted/70 mt-3">
                Join 10,000+ creators already automating their DMs
              </p>
            </div>
          </>
        )}
      </form>
    </Dialog>
  );
}
