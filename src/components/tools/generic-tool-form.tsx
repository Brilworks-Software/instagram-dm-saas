'use client';

import { useState } from 'react';
import { Sparkles, Flame, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'number';
  required?: boolean;
}

interface GenericToolFormProps {
  toolSlug: string;
  toolName: string;
  heroTitle: string;
  heroDescription: string;
  heroGradient?: string;
  heroBorder?: string;
  fields: FormField[];
  usageCount?: number;
  seoKeywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export function GenericToolForm({ 
  toolSlug, 
  toolName, 
  heroTitle,
  heroDescription,
  heroGradient = 'from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20',
  heroBorder = 'border-purple-200 dark:border-purple-800',
  fields, 
  usageCount = 0,
  seoKeywords = [],
  seoTitle = '',
  seoDescription = ''
}: GenericToolFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);

    try {
      // Get client IP
      let clientIp: string | null = null;
      let ipInfo: { city?: string; region?: string; country_name?: string } | null = null;

      try {
        const ipResp = await fetch('https://api.ipify.org?format=json');
        if (ipResp.ok) {
          const ipData = await ipResp.json();
          clientIp = ipData.ip;
        }

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
        // Best-effort only
      }

      const response = await fetch('/api/tools/generic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug,
          formData,
          clientIp,
          ipInfo,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || 'Failed to submit');
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="space-y-6 mb-8">
      {/* SEO Hidden Content */}
      {(seoKeywords.length > 0 || seoTitle || seoDescription) && (
        <div className="sr-only" aria-hidden="true">
          {seoTitle && <h1>{seoTitle}</h1>}
          {seoDescription && <p>{seoDescription}</p>}
          {seoKeywords.length > 0 && (
            <meta name="keywords" content={seoKeywords.join(', ')} />
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className={`rounded-2xl bg-gradient-to-br ${heroGradient} p-8 border ${heroBorder}`}>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {heroTitle}
        </h2>
        <p className="text-foreground-muted leading-relaxed">
          {heroDescription}
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-6 space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-foreground mb-2">
                {index + 1}. {field.label}
              </label>
              <Input
                id={field.id}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full"
                required={field.required !== false}
              />
            </div>
          ))}
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
              Submit
            </>
          )}
        </Button>

        {usageCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>Used <strong className="text-orange-600 dark:text-orange-400">{usageCount}</strong> times today.</span>
          </div>
        )}
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
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Success!</h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your request has been submitted successfully. We're processing your information.
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
            <span className="text-accent font-semibold mt-0.5">1.</span>
            <span>Fill out the form above with your information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-semibold mt-0.5">2.</span>
            <span>Our AI analyzes your data and matches it with relevant opportunities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-semibold mt-0.5">3.</span>
            <span>Get personalized recommendations tailored to your profile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-semibold mt-0.5">4.</span>
            <span>100% free with no login required</span>
          </li>
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/signup"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-accent bg-accent hover:bg-accent/90 text-white px-6 py-4 font-semibold transition-all"
        >
          <Sparkles className="h-5 w-5" />
          Get Started Free
          <ArrowRight className="h-5 w-5" />
        </a>
        <a
          href="/docs"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-border hover:border-accent bg-background hover:bg-background-secondary text-foreground px-6 py-4 font-semibold transition-all"
        >
          <FileText className="h-5 w-5" />
          Read Documentation
        </a>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        
        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">What is {toolName}?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            {toolName} is an advanced AI-powered tool designed to help you optimize your Instagram presence. It analyzes your profile data and provides personalized recommendations to help you grow your audience and engagement.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How do I use this tool?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Simply fill out the form above with your information and click Submit. Our AI will analyze your data and provide you with personalized insights and recommendations. No login or registration required!
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">Is this tool free to use?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Yes! This tool is completely free to use with no hidden fees. You don't even need to create an account or log in to access it.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How accurate are the results?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Our AI uses advanced algorithms and real-time data to provide accurate and up-to-date insights. While results may vary based on your specific situation, our tool is designed to give you the most reliable information possible.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">Do I need an Instagram account to use this?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            While having an Instagram account helps you get the most personalized results, you can still use this tool to explore opportunities and understand the platform better even without an account.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How often should I use this tool?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            We recommend using this tool regularly to track your growth and discover new opportunities. Monthly checks can help you stay on top of trends and adjust your strategy accordingly.
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
          {/* Tool Card 1 - Fake Follower Checker */}
          <a href="/tools/fake-follower-checker" className="group rounded-xl border border-border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Analytics</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Fake Follower Checker</h3>
            <p className="text-sm text-foreground-muted mb-4">Estimate follower quality and spot potential bots or suspicious patterns.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">Free</span>
            </div>
          </a>

          {/* Tool Card 2 - Caption Generator */}
          <a href="/tools/caption-generator" className="group rounded-xl border border-border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Content</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Caption Generator</h3>
            <p className="text-sm text-foreground-muted mb-4">Generate captions optimized for engagement and your brand voice.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded">AI</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">Free</span>
            </div>
          </a>

          {/* Tool Card 3 - Content Ideas Generator */}
          <a href="/tools/content-ideas-generator" className="group rounded-xl border border-border bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded">Content</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Content Ideas Generator</h3>
            <p className="text-sm text-foreground-muted mb-4">Get fresh content ideas for posts, stories, and Reels based on your niche.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-1 rounded">AI</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">Free</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
