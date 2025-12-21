'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Instagram, Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { usePostHog } from '@/hooks/use-posthog';

export default function ForgotPasswordPage() {
  const { capture } = usePostHog();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        capture('password_reset_request_failed', {
          error: resetError.message,
        });
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      capture('password_reset_requested', {
        email: email,
      });

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-foreground-muted mb-6">
            We sent a password reset link to <span className="text-foreground font-medium">{email}</span>
          </p>
          <p className="text-sm text-foreground-muted mb-8">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button variant="secondary" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full"
            >
              Send another email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background-secondary via-background to-background-tertiary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center shadow-xl shadow-accent/30">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight">
              Social<span className="text-accent">ora</span>
            </span>
          </div>
          
          {/* Hero Text */}
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
              Reset your password
            </h1>
            <p className="text-lg text-foreground-muted mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">
              Social<span className="text-accent">ora</span>
            </span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h2>
            <p className="text-foreground-muted">Enter your email to receive a reset link</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              isLoading={isLoading}
            >
              Send reset link
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

