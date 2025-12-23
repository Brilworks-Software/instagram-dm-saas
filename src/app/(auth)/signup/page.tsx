'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePostHog } from '@/hooks/use-posthog';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const { capture, identify } = usePostHog();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        capture('signup_failed', {
          error: signUpError.message,
        });
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        capture('signup_failed', {
          error: 'Email already registered',
        });
        setError('This email is already registered. Please sign in instead.');
        setIsLoading(false);
        return;
      }

      // Track successful signup
      if (data?.user) {
        identify(data.user.id, {
          email: data.user.email,
          name: name,
        });
        capture('user_signed_up', {
          user_id: data.user.id,
          has_name: !!name,
        });
      }

      setSuccess(true);
      setIsLoading(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleGitHubSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-foreground-muted mb-6">
            We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>
          </p>
          <p className="text-sm text-foreground-muted mb-8">
            Click the link in the email to activate your account and start using Socialora.
          </p>
          <Link href="/login">
            <Button variant="secondary">Back to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background-secondary via-background to-background-tertiary relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center">
            <div className="h-20 w-20 flex items-center justify-center overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="Socialora" 
                width={80} 
                height={80} 
                className="h-full w-full object-contain" 
              />
            </div>
            <span className="font-bold text-2xl tracking-tight">
              Social<span className="text-accent">ora</span>
            </span>
          </div>
          
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
              Start automating your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-500"> Instagram DMs </span>
              today
            </h1>
            <p className="text-lg text-foreground-muted mb-8">
              Join thousands of creators and businesses who scale their Instagram outreach with Socialora.
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '5M+', label: 'DMs Sent' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-accent">{stat.value}</p>
                  <p className="text-sm text-foreground-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-foreground-muted">
            <span>✓ Free 14-day trial</span>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center mb-8 justify-center">
            <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="Socialora" 
                width={56} 
                height={56} 
                className="h-full w-full object-contain" 
              />
            </div>
            <span className="font-bold text-xl">DM<span className="text-accent">flow</span></span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create your account</h2>
            <p className="text-foreground-muted">Start your free trial - no credit card required</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="secondary" className="w-full" onClick={handleGoogleSignup}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleGitHubSignup}>
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-foreground-muted">or sign up with email</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              required
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-foreground-subtle hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              required
            />
            
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          
          <p className="mt-6 text-center text-xs text-foreground-muted">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
          </p>
          
          <p className="mt-6 text-center text-sm text-foreground-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

