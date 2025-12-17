'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Instagram, Lock, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { usePostHog } from '@/hooks/use-posthog';

export default function ResetPasswordPage() {
  const { capture } = usePostHog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session
    // The auth callback should have already exchanged the code for a session
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidToken(true);
      } else {
        // If no session, check if we have a code in the URL (fallback for direct access)
        const code = searchParams.get('code');
        if (code) {
          // Try to exchange the code for a session (fallback)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && data.session) {
            setIsValidToken(true);
          } else {
            setIsValidToken(false);
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        } else {
          setIsValidToken(false);
          setError('No reset token found. Please request a new password reset.');
        }
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        capture('password_reset_failed', {
          error: updateError.message,
        });
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      capture('password_reset_success');

      setSuccess(true);
      setIsLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?password_reset=success');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <p className="text-foreground-muted">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-error/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
          <p className="text-foreground-muted mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full">
              Request new reset link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Password reset successful!</h2>
          <p className="text-foreground-muted mb-6">
            Your password has been updated. Redirecting to login...
          </p>
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Go to login
            </Button>
          </Link>
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
              Bulk<span className="text-accent">DM</span>
            </span>
          </div>
          
          {/* Hero Text */}
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
              Create a new password
            </h1>
            <p className="text-lg text-foreground-muted mb-8">
              Choose a strong password to secure your account.
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
              Bulk<span className="text-accent">DM</span>
            </span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Reset password</h2>
            <p className="text-foreground-muted">Enter your new password below</p>
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
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
            />
            
            <p className="text-xs text-foreground-muted">
              Password must be at least 8 characters long
            </p>
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              isLoading={isLoading}
            >
              Reset password
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

