'use client';

import { HomepageStructuredData } from '@/components/seo/structured-data';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { WaitingListForm } from '@/components/waiting-list-form';
import { CountUpNumber } from '@/components/count-up-number';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Heart,
  Instagram,
  Lightbulb,
  Menu,
  MessageSquare,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { InteractiveSimulation } from '@/components/landing/interactive-simulation';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQSection } from '@/components/landing/faq-section';
import { LogoCloud } from '@/components/landing/logo-cloud';
import { ResultsSection } from '@/components/landing/results-section';
import { FloatingBackground } from '@/components/landing/floating-background';
import { TimelineSteps } from '@/components/landing/timeline-steps';
import { FeaturesBento } from '@/components/landing/features-bento';
import { HeroVideo } from '@/components/landing/hero-video';
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from 'react';

// Data arrays - defined outside component to avoid initialization issues

const steps = [
  {
    number: "01",
    title: "Connect Your Account",
    description:
      "Securely link your Instagram account in seconds with our direct login.",
    icon: Instagram,
  },
  {
    number: "02",
    title: "Set Up AI Assistant",
    description: "Configure your AI preferences and response templates.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Start Engaging",
    description: "Let AI handle responses or manage conversations manually.",
    icon: Rocket,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-commerce Founder",
    image: "👩‍💼",
    content:
      "SocialOra transformed how I manage customer inquiries. Response time dropped by 80% and customer satisfaction skyrocketed!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Content Creator",
    image: "👨‍🎨",
    content:
      "The AI assistant is incredibly smart. It understands context and maintains my brand voice perfectly.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    image: "👩‍💻",
    content:
      "Managing multiple Instagram accounts was a nightmare. SocialOra made it effortless with its unified inbox.",
    rating: 5,
  },
];

const stats = [
  { value: "10K+", label: "Active Users", icon: Users },
  { value: "2M+", label: "Messages Sent", icon: Send },
  { value: "95%", label: "Satisfaction Rate", icon: Heart },
  { value: "24/7", label: "AI Support", icon: Bot },
];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isWaitingListOpen, setIsWaitingListOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [counters, setCounters] = useState({ users: 0, messages: 0, satisfaction: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Check for OAuth code parameter and redirect to callback
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      // Redirect to auth callback with the code parameter
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("code", code);
      // Preserve any other query parameters (like 'type' for password reset)
      searchParams.forEach((value, key) => {
        if (key !== "code") {
          callbackUrl.searchParams.set(key, value);
        }
      });
      router.replace(callbackUrl.pathname + callbackUrl.search);
      return;
    }
  }, [searchParams, router]);

  // Define animateCounters with useCallback to memoize it
  const animateCounters = useCallback(() => {
    const duration = 2500; // Slightly longer duration for better visibility
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Ease out expo for smooth "landing" effect
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCounters({
        users: Math.floor(10000 * easeProgress),
        messages: Math.floor(2000000 * easeProgress),
        satisfaction: Math.floor(98 * easeProgress), // Increased to 98% for better appeal
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters({ users: 10000, messages: 2000000, satisfaction: 98 });
      }
    }, interval);
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuth();

    // Smooth scroll effect
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Feature auto-rotation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (!statsRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, [hasAnimated, animateCounters]);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        router.push("/inbox");
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
      title: "Smart Inbox",
      description:
        "Manage all your Instagram DMs in one unified inbox with AI-powered organization.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bot,
      title: "AI-Powered Replies",
      description:
        "Automatically respond to messages with intelligent, context-aware AI assistance.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Send,
      title: "Bulk Messaging",
      description:
        "Send personalized messages to multiple followers at once with campaign management.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track engagement, response times, and campaign performance with detailed insights.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      title: "Lead Generation",
      description:
        "Identify and nurture high-quality leads from your Instagram interactions.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Enterprise-grade security to keep your data and conversations safe.",
      color: "from-teal-500 to-cyan-500",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Your Account",
      description:
        "Securely link your Instagram account in seconds with our direct login.",
      icon: Instagram,
    },
    {
      number: "02",
      title: "Set Up AI Assistant",
      description: "Configure your AI preferences and response templates.",
      icon: Sparkles,
    },
    {
      number: "03",
      title: "Start Engaging",
      description: "Let AI handle responses or manage conversations manually.",
      icon: Rocket,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "E-commerce Founder",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces",
      content:
        "SocialOra transformed how I manage customer inquiries. Response time dropped by 80% and customer satisfaction skyrocketed!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Content Creator",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces",
      content:
        "The AI assistant is incredibly smart. It understands context and maintains my brand voice perfectly.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces",
      content:
        "Managing multiple Instagram accounts was a nightmare. SocialOra made it effortless with its unified inbox.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "2M+", label: "Messages Sent", icon: Send },
    { value: "95%", label: "Satisfaction Rate", icon: Heart },
    { value: "24/7", label: "AI Support", icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <FloatingBackground />
      <HomepageStructuredData />
      {/* Enhanced Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg' 
          : 'bg-background/80 backdrop-blur-lg border-b border-border/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="h-12 w-12 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/images/logo.png"
                  alt="SocialOra"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-2xl ml-2">
                Social<span className="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">Ora</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/tools">
                <Button variant="ghost" size="sm" className="text-base hover:text-accent transition-colors">
                  Tools
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm" className="text-base hover:text-accent transition-colors">
                  Blog
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm" className="text-base hover:text-accent transition-colors">
                  Docs
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost" size="sm" className="text-base hover:text-accent transition-colors">
                  Support
                </Button>
              </Link>
              
              {/* Theme Toggle */}
              <div className="ml-2">
                <ThemeToggle />
              </div>
              
              {/* CTA Button */}
              <Button 
                size="sm" 
                className="ml-4 bg-gradient-to-r from-accent to-pink-600 hover:from-accent/90 hover:to-pink-500 text-white font-semibold shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all duration-300 hover:scale-105"
                onClick={() => setIsWaitingListOpen(true)}>
                Join Waiting List
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 transition-transform duration-300 rotate-90" />
                ) : (
                  <Menu className="h-6 w-6 transition-transform duration-300" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl animate-slide-in">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link href="/tools" className="block">
                <Button variant="ghost" className="w-full justify-start text-base hover:bg-accent/10 hover:text-accent transition-all">
                  Tools
                </Button>
              </Link>
              <Link href="/blog" className="block">
                <Button variant="ghost" className="w-full justify-start text-base hover:bg-accent/10 hover:text-accent transition-all">
                  Blog
                </Button>
              </Link>
              <Link href="/docs" className="block">
                <Button variant="ghost" className="w-full justify-start text-base hover:bg-accent/10 hover:text-accent transition-all">
                  Docs
                </Button>
              </Link>
              <Link href="/support" className="block">
                <Button variant="ghost" className="w-full justify-start text-base hover:bg-accent/10 hover:text-accent transition-all">
                  Support
                </Button>
              </Link>
              
              {/* Theme Toggle for Mobile */}
              <div className="pt-4 pb-2 flex items-center justify-between">
                <span className="text-sm text-foreground-muted font-medium">Theme</span>
                <ThemeToggle />
              </div>
              
              <div className="pt-2">
                <Button
                  className="w-full bg-gradient-to-r from-accent to-pink-600 hover:from-accent/90 hover:to-pink-500 text-white font-semibold shadow-lg shadow-accent/30"
                  onClick={() => {
                    setIsWaitingListOpen(true);
                    setIsMobileMenuOpen(false);
                  }}>
                  Join Waiting List
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 via-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.2}px)`, animationDelay: '1s' }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-accent/20 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.4}px)`, animationDelay: '2s' }}
          ></div>
          
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-accent/40 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-500/40 rounded-full animate-float-delay-1"></div>
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-purple-500/40 rounded-full animate-float-delay-2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center">
            {/* Enhanced Badge with animation */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-background-elevated via-background-elevated to-background-elevated border border-accent/30 mb-8 animate-fade-in backdrop-blur-sm shadow-lg shadow-accent/10 hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                <div className="absolute inset-0 h-4 w-4 text-accent animate-ping opacity-20"></div>
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground-muted bg-clip-text">
                AI-Powered Instagram DM Management
              </span>
              <Zap className="h-3 w-3 text-yellow-400" />
            </div>

            {/* Enhanced Main Heading with better gradient */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 animate-slide-up leading-tight">
              <span className="inline-block bg-gradient-to-r from-accent via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                Transform Instagram
              </span>
              <br />
              <span className="inline-block text-foreground mt-2">
                Into Your{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">
                    Revenue Engine
                  </span>
                  <svg className="absolute -bottom-2 left-0 right-0 h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 8 Q 50 0, 100 8" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent" />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-foreground-muted max-w-3xl mx-auto mb-10 animate-slide-up delay-200 leading-relaxed">
              Automate conversations, nurture leads, and close deals—all while you sleep. 
              <span className="text-foreground font-semibold"> Convert 3x more leads</span> with intelligent automation.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-accent to-pink-600 hover:from-accent/90 hover:to-pink-500 text-white font-semibold px-8 py-6 text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-300"
                onClick={() => setIsWaitingListOpen(true)}>
                <span className="relative z-10 flex items-center">
                  Join Waiting List
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="group border-2 border-border hover:border-accent/50 bg-background-elevated/50 backdrop-blur-sm px-8 py-6 text-lg font-semibold hover:bg-background-elevated transition-all duration-300"
                onClick={() => {
                  document.getElementById('demo-video-section')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                <span className="flex items-center">
                  Watch Demo
                  <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </span>
              </Button>
            </div>

            {/* Enhanced Stats with animation */}
            <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto animate-fade-in delay-500">
              {[
                { value: '10K+', label: 'Active Users', icon: Users },
                { value: '2M+', label: 'Messages Sent', icon: Send },
                { value: '98%', label: 'Satisfaction Rate', icon: Heart },
                { value: '24/7', label: 'AI Support', icon: Bot },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-background-elevated rounded-xl p-6 border border-border hover:border-accent/50 transition-all hover:scale-105">
                  <stat.icon className="h-6 w-6 text-accent mb-2 mx-auto" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    <CountUpNumber 
                      value={stat.value} 
                      duration={2500}
                      delay={index * 100}
                    />
                  </div>
                  <div className="text-sm text-foreground-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-foreground-muted animate-fade-in delay-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
            <HeroVideo />
            <LogoCloud />
          </div>
        </div>
      </section>

      {/* Interactive Simulation Section */}
      <InteractiveSimulation />

      {/* Results Section */}
      <ResultsSection />

      {/* Features Bento Section */}
      <FeaturesBento />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Enhanced How It Works */}
      <TimelineSteps onCtaClick={() => setIsWaitingListOpen(true)} />


      {/* Enhanced Testimonials with social proof */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background-secondary via-background to-background-secondary"></div>
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-elevated border border-border mb-6">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-foreground-muted">Testimonials</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              Loved by{" "}
              <span className="bg-gradient-to-r from-accent via-pink-500 to-purple-500 bg-clip-text text-transparent">
                10,000+ Users
              </span>
            </h2>
            <p className="text-xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
              Join thousands of creators and businesses crushing their Instagram game with SocialOra.
            </p>
          </div>

          {/* Live activity feed */}
          <div className="mb-16 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-background-elevated via-background-elevated/50 to-background-elevated rounded-2xl p-6 border border-accent/30 shadow-xl shadow-accent/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Users className="h-5 w-5 text-accent" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm font-semibold text-foreground">Live Activity</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Alex M.', action: 'just converted a lead', time: '2 min ago', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=faces' },
                  { name: 'Jessica R.', action: 'sent 50 automated messages', time: '5 min ago', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces' },
                  { name: 'Michael T.', action: 'joined SocialOra', time: '8 min ago', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent/30 flex-shrink-0">
                      <Image
                        src={activity.image}
                        alt={activity.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-foreground font-medium">{activity.name}</span>
                      <span className="text-foreground-muted"> {activity.action}</span>
                    </div>
                    <span className="text-xs text-foreground-subtle">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-background-elevated to-background-elevated/50 rounded-3xl p-8 border border-border hover:border-accent/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/10">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-pink-500/0 group-hover:from-accent/5 group-hover:to-pink-500/5 rounded-3xl transition-all duration-500"></div>
                
                {/* Quote icon */}
                <div className="absolute top-8 right-8 text-6xl text-accent/10 group-hover:text-accent/20 transition-colors duration-300">"</div>
                
                <div className="relative">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300"
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-foreground-muted mb-8 leading-relaxed text-lg group-hover:text-foreground transition-colors duration-300">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all duration-300 group-hover:scale-110">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background-elevated"></div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-foreground-muted">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces',
                ].map((img, i) => (
                  <div key={i} className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-background">
                    <Image
                      src={img}
                      alt={`User ${i + 1}`}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm">Join 10,000+ happy users</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">4.9/5 average rating</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Trusted by top brands</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onJoinWaitlist={() => setIsWaitingListOpen(true)} />

      {/* Enhanced CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="relative bg-gradient-to-br from-background-elevated via-background-elevated to-background-elevated/50 rounded-[3rem] p-12 sm:p-16 border border-accent/30 shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background border border-accent/30 mb-8">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Limited Time Offer</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Heading */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Ready to{" "}
                <span className="bg-gradient-to-r from-accent via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  10x Your Instagram
                </span>
                <br />
                Outreach?
              </h2>
              
              <p className="text-xl sm:text-2xl text-foreground-muted mb-10 max-w-3xl mx-auto leading-relaxed">
                Join <span className="text-foreground font-bold">10,000+ creators</span> and businesses using SocialOra to automate conversations and close more deals.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-accent via-pink-600 to-purple-600 hover:from-accent/90 hover:via-pink-500 hover:to-purple-500 text-white font-bold px-10 py-7 text-lg shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all duration-300 hover:scale-105"
                  onClick={() => setIsWaitingListOpen(true)}>
                  <span className="relative z-10 flex items-center">
                    Start Free Trial
                    <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-2 border-accent/30 hover:border-accent/50 bg-background/50 backdrop-blur-sm px-10 py-7 text-lg font-semibold hover:bg-background transition-all duration-300"
                  onClick={() => {
                    document
                      .getElementById("demo-video")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}>
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-foreground-muted mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="h-4 w-px bg-border"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="h-4 w-px bg-border"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-3 pt-8 border-t border-border/50">
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces',
                  ].map((img, i) => (
                    <div key={i} className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-background-elevated shadow-lg">
                      <Image
                        src={img}
                        alt={`User ${i + 1}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground-muted">
                    <span className="font-semibold text-foreground">
                      <CountUpNumber value="1247" duration={2000} delay={500} />
                    </span> people joined this week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Enhanced Footer */}
      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-gradient-to-b from-background-secondary to-background overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main footer content */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center group mb-4">
                <div className="h-12 w-12 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/images/logo.png"
                    alt="SocialOra"
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-bold text-2xl ml-2">
                  Social<span className="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">Ora</span>
                </span>
              </Link>
              <p className="text-foreground-muted mb-6 max-w-md leading-relaxed">
                The ultimate Instagram DM automation platform. Transform conversations into conversions with AI-powered outreach.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-accent to-pink-600 hover:from-accent/90 hover:to-pink-500 text-white font-semibold shadow-lg shadow-accent/20"
                  onClick={() => setIsWaitingListOpen(true)}>
                  Get Started Free
                </Button>
              </div>
            </div>

            {/* Links columns */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/tools" className="text-foreground-muted hover:text-accent transition-colors flex items-center group">
                    <span>Tools</span>
                    <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-foreground-muted hover:text-accent transition-colors flex items-center group">
                    <span>Documentation</span>
                    <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-foreground-muted hover:text-accent transition-colors flex items-center group">
                    <span>Blog</span>
                    <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-foreground-muted hover:text-accent transition-colors flex items-center group">
                    <span>Privacy Policy</span>
                    <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-foreground-muted hover:text-accent transition-colors flex items-center group">
                    <span>Terms of Service</span>
                    <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-foreground-muted hover:text-accent transition-colors flex items-center group">
                    <span>Support</span>
                    <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground-muted">
              © 2025 SocialOra. All rights reserved. Made with <Heart className="inline h-3 w-3 text-accent fill-accent" /> for creators.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-foreground-muted">All systems operational</span>
              </div>
            </div>
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
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delay-1 {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-delay-2 {
          animation: float 3s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
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

        .delay-700 {
          animation-delay: 0.7s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Custom gradient animations */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Improved hover transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
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
