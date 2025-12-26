'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, CheckCircle2, TrendingUp, Users, MessageSquare, DollarSign, BarChart3, Clock, Sparkles, BookOpen, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/ebook/lead-capture-form';

export default function EBookPage() {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDownloadSuccess = (url: string) => {
    setDownloadUrl(url);
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'increase-instagram-followers-reach-engagement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="SocialOra"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">
                Social<span className="text-accent">Ora</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/tools">
                <Button variant="ghost" size="sm">Tools</Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm">Blog</Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm">Docs</Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost" size="sm">Support</Button>
              </Link>
              <Link href="/">
                <Button size="sm">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
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
              <Link href="/tools" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Tools
                </Button>
              </Link>
              <Link href="/blog" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Blog
                </Button>
              </Link>
              <Link href="/docs" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Docs
                </Button>
              </Link>
              <Link href="/support" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Support
                </Button>
              </Link>
              <div className="pt-2">
                <Link href="/">
                  <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section - Added top padding for fixed nav */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ paddingTop: '5rem' }}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-elevated border border-border mb-8 animate-fade-in">
              <Download className="h-4 w-4 text-accent" />
              <span className="text-sm text-foreground-muted">Free eBook Download</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-foreground via-accent to-pink-500 bg-clip-text text-transparent">
                Increase Instagram Followers
              </span>
              <br />
              <span className="text-foreground">Reach & Engagement</span>
            </h1>

            <p className="text-xl text-foreground-muted max-w-2xl mx-auto mb-10 animate-slide-up delay-200">
              Learn proven strategies that have helped thousands of creators and businesses grow their Instagram presence and land paid collaborations.
            </p>

            {/* Lead Capture Form */}
            <div className="mx-auto max-w-md mb-16 animate-slide-up delay-300">
              {!downloadUrl ? (
                <div className="rounded-2xl border border-border bg-background-elevated p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-accent/10 transition-all">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mb-3 text-center text-2xl font-bold text-foreground">
                    Get Your Free eBook
                  </h2>
                  <p className="mb-6 text-center text-sm text-foreground-muted">
                    Enter your email or Instagram username to download instantly
                  </p>
                  <LeadCaptureForm onSuccess={handleDownloadSuccess} />
                </div>
              ) : (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-400" />
                  <h3 className="mb-2 text-2xl font-bold text-foreground">Download Started!</h3>
                  <p className="mb-6 text-sm text-foreground-muted">
                    Your eBook should start downloading automatically. If it doesn't,{' '}
                    <a
                      href={downloadUrl}
                      download
                      className="text-accent hover:text-pink-500 underline transition-colors"
                    >
                      click here to download
                    </a>
                    .
                  </p>
                  <Link href="#whats-inside">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="group"
                    >
                      Learn More About the eBook
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <p className="text-sm text-foreground-muted animate-fade-in delay-500">
              No credit card required • 50+ pages • Instant download • PDF format
            </p>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section id="whats-inside" className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What's Inside This <span className="text-accent">Free eBook</span>?
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              50+ pages of actionable strategies to grow your Instagram presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
              {/* Part 1 */}
              <div className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Part 1: Growing Your Instagram Followers
                </h3>
                <ul className="space-y-3 text-foreground-muted leading-relaxed">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-400" />
                    <span>Organic growth strategies that actually work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-400" />
                    <span>Hashtag research and optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-400" />
                    <span>Content strategies that attract followers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-400" />
                    <span>Collaboration tactics to reach new audiences</span>
                  </li>
                </ul>
              </div>

              {/* Part 2 */}
              <div className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Part 2: Increasing Instagram Reach
                </h3>
                <ul className="space-y-3 text-foreground-muted leading-relaxed">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <span>Understanding the Instagram algorithm</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <span>Reels strategies for maximum reach</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <span>Optimal posting times and frequency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <span>Hashtag strategies for discovery</span>
                  </li>
                </ul>
              </div>

              {/* Part 3 */}
              <div className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Part 3: Boosting Engagement
                </h3>
                <ul className="space-y-3 text-foreground-muted leading-relaxed">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <span>Content formats that drive engagement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <span>Engagement tactics that work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <span>Community building strategies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <span>Creating content that sparks conversations</span>
                  </li>
                </ul>
              </div>

              {/* Part 4 */}
              <div className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Part 4: Attracting Paid Collaborations
                </h3>
                <ul className="space-y-3 text-foreground-muted leading-relaxed">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Building a brand that brands want to work with</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Pitching strategies that get responses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Rate card templates and pricing guides</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Negotiation tactics for better deals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Download This <span className="text-accent">Free eBook</span>?
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Everything you need to succeed on Instagram
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group bg-background-elevated rounded-2xl p-8 border border-border text-center hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Proven Strategies</h3>
              <p className="text-foreground-muted leading-relaxed">
                All strategies are based on real results from creators and businesses that have successfully grown their Instagram presence.
              </p>
            </div>

            <div className="group bg-background-elevated rounded-2xl p-8 border border-border text-center hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Actionable Tactics</h3>
              <p className="text-foreground-muted leading-relaxed">
                Every chapter includes step-by-step tactics you can implement immediately. No fluff—just actionable strategies.
              </p>
            </div>

            <div className="group bg-background-elevated rounded-2xl p-8 border border-border text-center hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Complete Guide</h3>
              <p className="text-foreground-muted leading-relaxed">
                From zero followers to paid collaborations, this eBook covers the entire journey with valuable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-pink-500/10 to-accent/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-background-elevated rounded-3xl p-12 border border-border shadow-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Ready to Grow Your Instagram Presence?
            </h2>
            <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
              Download your free eBook now and start implementing proven strategies to increase followers, reach, engagement, and attract paid collaborations.
            </p>
            {!downloadUrl ? (
              <div className="mx-auto max-w-md">
                <div className="rounded-2xl border border-border bg-background p-6 shadow-lg">
                  <LeadCaptureForm onSuccess={handleDownloadSuccess} />
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-md">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-400" />
                  <h3 className="mb-2 text-2xl font-bold text-foreground">Download Started!</h3>
                  <p className="mb-6 text-sm text-foreground-muted">
                    Your eBook should start downloading automatically. If it doesn't,{' '}
                    <a
                      href={downloadUrl}
                      download
                      className="text-accent hover:text-pink-500 underline transition-colors"
                    >
                      click here to download
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}
            <p className="text-sm text-foreground-muted mt-6">
              No credit card required • 50+ pages • Instant download • PDF format
            </p>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Related <span className="text-accent">Resources</span>
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Explore our blog for more Instagram growth strategies
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/blog/how-to-do-instagram-outreach-that-actually-gets-replies"
              className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                Instagram Outreach Guide
              </h3>
              <p className="text-foreground-muted leading-relaxed">
                Learn how to do Instagram outreach that gets replies
              </p>
            </Link>
            <Link
              href="/blog/instagram-outreach-strategies-dont-feel-spammy"
              className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                Authentic Outreach Strategies
              </h3>
              <p className="text-foreground-muted leading-relaxed">
                Build genuine connections without feeling spammy
              </p>
            </Link>
            <Link
              href="/blog/how-to-use-instagram-lead-generation-without-ads"
              className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                Lead Generation Without Ads
              </h3>
              <p className="text-foreground-muted leading-relaxed">
                Organic strategies for generating leads
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="SocialOra"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">
                Social<span className="text-accent">Ora</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/tools" className="hover:text-foreground transition-colors">
                Tools
              </Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Docs
              </Link>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2025 SocialOra. All rights reserved.
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
    </div>
  );
}

