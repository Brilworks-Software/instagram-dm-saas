'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Instagram, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { usePostHog } from '@/hooks/use-posthog';

export default function LoginPage() {
  const { capture, identify } = usePostHog();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();

    try {
      if (loginMethod === 'password') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          capture('login_failed', {
            method: 'password',
            error: error.message,
          });
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
          setIsLoading(false);
          return;
        }

        // Track successful login
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          identify(user.id, {
            email: user.email,
          });
          capture('user_logged_in', {
            method: 'password',
            user_id: user.id,
          });
        }

        router.push('/inbox');
        router.refresh();
      } else {
        // Magic link
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }

        setMagicLinkSent(true);
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleGitHubLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-foreground-muted mb-6">
            We sent a magic link to <span className="text-foreground font-medium">{email}</span>
          </p>
          <p className="text-sm text-foreground-muted mb-8">
            Click the link in the email to sign in to your account.
          </p>
          <Button variant="secondary" onClick={() => setMagicLinkSent(false)}>
            Back to login
          </Button>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
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
              Automate your Instagram DMs with 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-500"> AI-powered </span>
              conversations
            </h1>
            <p className="text-lg text-foreground-muted mb-8">
              Scale your outreach, manage conversations effortlessly, and convert more leads with intelligent automation.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              {[
                'Smart inbox that prioritizes high-value conversations',
                'AI-generated replies tailored to your brand voice',
                'Automated campaigns with rate-limit protection',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground-muted">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="bg-background-elevated/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
            <p className="text-foreground mb-4 italic">
              &ldquo;BulkDM helped us 10x our influencer outreach. We went from 50 to 500+ conversations per week without hiring anyone.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-pink-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Sarah Chen</p>
                <p className="text-xs text-foreground-muted">Head of Growth, StyleCo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-foreground-muted">Sign in to your account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          
          {/* Login Method Toggle */}
          <div className="flex bg-background-secondary rounded-xl p-1 mb-6">
            <button
              onClick={() => setLoginMethod('password')}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                loginMethod === 'password'
                  ? 'bg-background-elevated text-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              Password
            </button>
            <button
              onClick={() => setLoginMethod('magic')}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                loginMethod === 'magic'
                  ? 'bg-background-elevated text-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              Magic Link
            </button>
          </div>
          
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
            
            {loginMethod === 'password' && (
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />
            )}
            
            {loginMethod === 'password' && (
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  Forgot password?
                </Link>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              isLoading={isLoading}
            >
              {loginMethod === 'password' ? 'Sign in' : 'Send magic link'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-foreground-muted">or continue with</span>
            </div>
          </div>
          
          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="w-full" onClick={handleGoogleLogin}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleGitHubLogin}>
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>
          
          <p className="mt-8 text-center text-sm text-foreground-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent hover:text-accent-hover font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
