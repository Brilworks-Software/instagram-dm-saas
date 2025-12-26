'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Mail, Instagram } from 'lucide-react';

interface LeadCaptureFormProps {
  onSuccess: (downloadUrl: string) => void;
}

export function LeadCaptureForm({ onSuccess }: LeadCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate that at least one field is filled
    if (!email && !instagramUsername) {
      setError('Please provide either your email or Instagram username');
      return;
    }

    // Basic email validation if email is provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic Instagram username validation (alphanumeric, dots, underscores, 1-30 chars)
    if (instagramUsername && !/^[a-zA-Z0-9._]{1,30}$/.test(instagramUsername.replace('@', ''))) {
      setError('Please enter a valid Instagram username (without @)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get client IP and location info
      let clientIp: string | null = null;
      let ipInfo: Record<string, unknown> | null = null;
      
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          clientIp = ipData.ip || null;
          
          // Get detailed IP info
          if (clientIp) {
            const ipInfoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
            if (ipInfoResponse.ok) {
              ipInfo = await ipInfoResponse.json();
            }
          }
        }
      } catch (ipError) {
        console.error('Failed to get IP info:', ipError);
      }

      const response = await fetch('/api/ebook/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || undefined,
          instagramUsername: instagramUsername ? instagramUsername.replace('@', '') : undefined,
          clientIp: clientIp,
          ipInfo: ipInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process download');
      }

      // Success - get download URL and trigger download
      onSuccess(data.downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-foreground sm:text-sm">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted sm:h-5 sm:w-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-border bg-background-elevated pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 sm:pl-10 sm:py-3"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-foreground-muted">or</span>
          </div>
        </div>

        <div>
          <label htmlFor="instagram" className="mb-1.5 block text-xs font-medium text-foreground sm:text-sm">
            Instagram Username (Optional)
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted sm:h-5 sm:w-5" />
            <input
              id="instagram"
              type="text"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value.replace('@', ''))}
              placeholder="yourusername"
              className="w-full rounded-lg border border-border bg-background-elevated pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 sm:pl-10 sm:py-3"
            />
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            Enter at least one to download (email or Instagram username)
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400 sm:p-3 sm:text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full bg-pink-500 text-white hover:bg-pink-600 text-sm sm:text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
            Processing...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Download Free eBook
          </>
        )}
      </Button>

      <p className="text-center text-xs text-foreground-muted">
        No spam. Unsubscribe anytime. We respect your privacy.
      </p>
    </form>
  );
}

