'use client';

import { useState } from 'react';
import { Sparkles, Flame, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BrandInfluencerMatcher() {
  const [instagramHandle, setInstagramHandle] = useState('');
  const [contentNiche, setContentNiche] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);

    try {
      let clientIp: string | null = null;
let ipInfo: { city?: string; region?: string; country_name?: string } | null = null;

try {
  // 1️⃣ Get public IP
  const ipResp = await fetch('https://api.ipify.org?format=json');
  if (ipResp.ok) {
    const ipData = await ipResp.json();
    clientIp = ipData.ip;
  }

  // 2️⃣ Get location from ipapi
  if (clientIp) {
    const geoResp = await fetch(`https://ipapi.co/${clientIp}/json/`);
    if (geoResp.ok) {
      const geoData = await geoResp.json();

      ipInfo = {
        city: geoData.city,
        region: geoData.region,
        country_name: geoData.country_name,
      };
    }
  }
} catch {
  // best-effort only (never block form submit)
}

      const response = await fetch('/api/tools/brand-matcher', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    instagramHandle: instagramHandle.replace('@', '').trim(),
    contentNiche: contentNiche.trim(),
    clientIp,
    ipInfo, // ✅ NEW
  }),
});

      const data = await response.json();

      if (!data.success) {
        alert(data.error || 'Failed to submit');
        setIsLoading(false);
        return;
      }

      // Simulate some loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const usageCount = 1829;

  return (
    <div className="space-y-6 mb-8">
      {/* SEO Hidden Content */}
      <div className="sr-only" aria-hidden="true">
        <h1>Free AI Brand-Influencer Matcher for Instagram | Get Brand Partnerships</h1>
        <p>Find brand partnership opportunities with our AI-powered Instagram matcher. Connect with brands offering sponsored posts, product gifting, and collaboration deals. Free tool for influencers.</p>
        <meta name="keywords" content="brand influencer matcher, instagram brand deals, influencer partnerships, brand collaboration finder, instagram sponsorship, influencer brand matching, find brand deals, instagram collaboration opportunities, influencer marketing platform, brand partnership finder" />
      </div>

      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20 p-8 border border-purple-200 dark:border-purple-800">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              AI Brand-Influencer Instagram Matcher Tool
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              Receive premium products worth up to $500 in exchange for your posts. Apply now for the best product gifting opportunities.
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <div className="relative w-64 h-48 rounded-xl bg-gradient-to-br from-purple-400 via-purple-300 to-pink-400 p-6 flex items-center justify-center overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </div>
              <div className="text-7xl font-bold text-white/90 select-none">
                $
              </div>
              <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs font-semibold text-white">upgrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="instagram-handle" className="block text-sm font-medium text-foreground mb-2">
              1. Instagram Handle
            </label>
            <Input
              id="instagram-handle"
              type="text"
              placeholder="Enter your Instagram handle"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="content-niche" className="block text-sm font-medium text-foreground mb-2">
              2. Content Niche
            </label>
            <Input
              id="content-niche"
              type="text"
              placeholder="Enter your content niche"
              value={contentNiche}
              onChange={(e) => setContentNiche(e.target.value)}
              className="w-full"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Find Brands
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>Used <strong className="text-orange-600 dark:text-orange-400">{usageCount}</strong> times today.</span>
        </div>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Generating results...</h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                We're analyzing your profile <strong>@{instagramHandle}</strong> in the {contentNiche} niche to find the best brand matches.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl border border-border bg-background-secondary p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          How It Works
        </h3>
        <ul className="space-y-2 text-sm text-foreground-muted">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">1.</span>
            <span>Enter your Instagram handle and content niche</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">2.</span>
            <span>Our AI analyzes your profile, audience, and engagement metrics</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">3.</span>
            <span>Get matched with brands looking for creators in your niche</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">4.</span>
            <span>Receive collaboration offers and free products worth up to $500</span>
          </li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        
        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">What is the Free AI Instagram Money Calculator?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            The Free AI Instagram Money Calculator is an advanced tool that analyzes your Instagram profile to estimate your potential earnings from brand partnerships, sponsored posts, and product collaborations. It uses AI to assess your engagement rate, follower count, and content niche to provide accurate earning estimates.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How to use the Instagram Money Calculator tool?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Simply enter your Instagram username and content niche in the form above, then click "Find Brands". Our AI will analyze your profile and match you with brands looking for influencers in your niche. You'll receive personalized recommendations and estimated product values.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">The benefits of using an AI Instagram Money Calculator</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 text-foreground-muted space-y-2">
            <p>Using our AI-powered calculator provides several benefits:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Accurate earnings estimates based on real-time data</li>
              <li>Personalized brand matches in your niche</li>
              <li>Time-saving automation for finding partnership opportunities</li>
              <li>Free access with no login required</li>
              <li>Insights into your account's monetization potential</li>
            </ul>
          </div>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">Example of Instagram Money Calculator results</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Results include brand names, their follower counts, engagement rates, product values (ranging from $50 to $500), and match scores showing compatibility with your profile. You'll see the top 5 brand matches most relevant to your content niche.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How can the AI Instagram Money Calculator Tool help me?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            This tool helps you understand your earning potential, discover brands actively seeking influencers, save time searching for partnerships, negotiate better deals with data-backed insights, and grow your income through strategic collaborations.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">Does the Instagram Money Calculator provide estimates for different types of sponsored content?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Yes, the calculator analyzes various types of sponsored content including product reviews, unboxing videos, lifestyle posts, and promotional campaigns. Each brand match includes estimated product values and collaboration types suitable for your content style.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How often should I use the Instagram Money Calculator to assess my sponsored post rates?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            We recommend using the calculator monthly to track your growth and discover new brand opportunities. As your follower count and engagement rate change, so do your partnership opportunities and potential earnings.
          </p>
        </details>
      </div>

      {/* Related Instagram Tools */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Related Instagram Tools</h2>
          <a href="/tools" className="text-sm text-accent hover:underline flex items-center gap-1">
            See all Instagram tools
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool Card 1 */}
          <a href="/tools/username-checker" className="group rounded-xl border border-border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Free Instagram Username Checker (No Login Required)</h3>
            <p className="text-sm text-foreground-muted mb-4">Instantly check Instagram username availability with our free, no-login required tool. Find the perfect handle for your account.</p>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                </svg>
              </div>
            </div>
          </a>

          {/* Tool Card 2 */}
          <a href="/tools/post-optimizer" className="group rounded-xl border border-border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Free AI-Powered Instagram Post Optimizer Tool</h3>
            <p className="text-sm text-foreground-muted mb-4">Optimize your Instagram posts for maximum engagement and follower growth using AI.</p>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                </svg>
              </div>
            </div>
          </a>

          {/* Tool Card 3 */}
          <a href="/tools/trending-hashtags" className="group rounded-xl border border-border bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Trending Instagram Hashtags by Country Tool</h3>
            <p className="text-sm text-foreground-muted mb-4">Discover which popular hashtags to include in your Instagram posts with our easy-to-use free tool</p>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
