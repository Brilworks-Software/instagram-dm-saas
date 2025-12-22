'use client';

import { HomepageStructuredData } from '@/components/seo/structured-data';
import { Button } from '@/components/ui/button';
import { WaitingListForm } from '@/components/waiting-list-form';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Heart,
  Instagram,
  Menu,
  MessageSquare,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isWaitingListOpen, setIsWaitingListOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        router.push('/inbox');
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  if (!mounted || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Smart Inbox',
      description: 'Manage all your Instagram DMs in one unified inbox with AI-powered organization.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Bot,
      title: 'AI-Powered Replies',
      description: 'Automatically respond to messages with intelligent, context-aware AI assistance.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Send,
      title: 'Bulk Messaging',
      description: 'Send personalized messages to multiple followers at once with campaign management.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track engagement, response times, and campaign performance with detailed insights.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Target,
      title: 'Lead Generation',
      description: 'Identify and nurture high-quality leads from your Instagram interactions.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security to keep your data and conversations safe.',
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect Your Account',
      description: 'Securely link your Instagram account in seconds with our direct login.',
      icon: Instagram,
    },
    {
      number: '02',
      title: 'Set Up AI Assistant',
      description: 'Configure your AI preferences and response templates.',
      icon: Sparkles,
    },
    {
      number: '03',
      title: 'Start Engaging',
      description: 'Let AI handle responses or manage conversations manually.',
      icon: Rocket,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'E-commerce Founder',
      image: '👩‍💼',
      content: 'Socialora transformed how I manage customer inquiries. Response time dropped by 80% and customer satisfaction skyrocketed!',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Content Creator',
      image: '👨‍🎨',
      content: 'The AI assistant is incredibly smart. It understands context and maintains my brand voice perfectly.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      image: '👩‍💻',
      content: 'Managing multiple Instagram accounts was a nightmare. Socialora made it effortless with its unified inbox.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: Users },
    { value: '2M+', label: 'Messages Sent', icon: Send },
    { value: '95%', label: 'Satisfaction Rate', icon: Heart },
    { value: '24/7', label: 'AI Support', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <HomepageStructuredData />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                Social<span className="text-accent">ora</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/blog">
                <Button variant="ghost" size="sm">Blog</Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm">Docs</Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost" size="sm">Support</Button>
              </Link>
              <Button
                size="sm"
                onClick={() => setIsWaitingListOpen(true)}
              >
                Join Waiting List
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link href="/blog" className="block">
                <Button variant="ghost" className="w-full justify-start">Blog</Button>
              </Link>
              <Link href="/docs" className="block">
                <Button variant="ghost" className="w-full justify-start">Docs</Button>
              </Link>
              <Link href="/support" className="block">
                <Button variant="ghost" className="w-full justify-start">Support</Button>
              </Link>
              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsWaitingListOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Join Waiting List
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-elevated border border-border mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm text-foreground-muted">AI-Powered Instagram DM Management</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-foreground via-accent to-pink-500 bg-clip-text text-transparent">
                An Instagram Outreach Tool
              </span>
              <br />
              <span className="text-foreground">to Convert 3x More Leads</span>
            </h1>

            <p className="text-xl text-foreground-muted max-w-2xl mx-auto mb-10 animate-slide-up delay-200">
              Manage Instagram conversations, streamline outreach, and keep track of every lead from one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
              <Button
                size="lg"
                className="group"
                onClick={() => setIsWaitingListOpen(true)}
              >
                Join Waiting List
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in delay-500">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-background-elevated rounded-xl p-6 border border-border hover:border-accent/50 transition-all hover:scale-105"
                >
                  <stat.icon className="h-6 w-6 text-accent mb-2 mx-auto" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-foreground-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to <span className="text-accent">Succeed</span>
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Powerful features designed to help you manage, engage, and grow your Instagram presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-foreground-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Get Started in <span className="text-accent">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Setting up Socialora is quick and easy. Start managing your Instagram DMs like a pro in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-accent/50 via-pink-500/50 to-accent/50"></div>

            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-background-elevated rounded-2xl p-8 border border-border text-center hover:border-accent/50 transition-all hover:shadow-lg"
              >
                <div className="text-6xl font-bold text-accent/20 mb-4">{step.number}</div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-foreground-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Loved by <span className="text-accent">Thousands</span>
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              See what our users are saying about Socialora.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground-muted mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-foreground-muted">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-pink-500/10 to-accent/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-background-elevated rounded-3xl p-12 border border-border shadow-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Instagram DMs?
            </h2>
            <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
              Join thousands of creators and businesses using Socialora to automate and scale their Instagram engagement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="group"
                onClick={() => setIsWaitingListOpen(true)}
              >
                Join Waiting List
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="text-sm text-foreground-muted mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Social<span className="text-accent">ora</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2025 Socialora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>

      {/* Waiting List Dialog */}
      <WaitingListForm
        open={isWaitingListOpen}
        onOpenChange={setIsWaitingListOpen}
      />
    </div>
  );
}
