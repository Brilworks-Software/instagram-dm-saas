'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Instagram, ArrowRight, Search, Sparkles, TrendingUp, Megaphone, BarChart3, CheckCircle2, Zap, Shield, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { instagramTools, type ToolCategoryTab, toolCategoryTabs } from './_data/tools';
import { FAQSection } from '@/components/blog/faq-section';

const categoryIcon = (category: string) => {
  switch (category) {
    case 'Growth':
      return TrendingUp;
    case 'Content':
      return Sparkles;
    case 'Marketing':
      return Megaphone;
    case 'Analytics':
      return BarChart3;
    default:
      return Sparkles;
  }
};

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolCategoryTab>('All');
  const [query, setQuery] = useState('');

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return instagramTools
      .filter((t) => (activeTab === 'All' ? true : t.category === activeTab))
      .filter((t) => {
        if (!q) return true;
        const haystack = `${t.title} ${t.description} ${t.category} ${(t.badges || []).join(' ')}`.toLowerCase();
        return haystack.includes(q);
      });
  }, [activeTab, query]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Social<span className="text-accent">ora</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/tools">
                <Button variant="ghost" size="sm" className="text-foreground">
                  Tools
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  Blog
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  Docs
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost" size="sm">
                  Support
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-elevated border border-border mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm text-foreground-muted">Free AI-powered Instagram toolkit</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Free Instagram Tools
          </h1>
          <p className="text-lg text-foreground-muted max-w-3xl mx-auto mb-6">
            Explore 30+ free Instagram tools for growth, content creation, marketing, and analytics. All tools are completely free, require no login, and are powered by AI to help you optimize and scale your Instagram presence.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No Login Required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {toolCategoryTabs.map((tab) => (
              <Button
                key={tab}
                variant={tab === activeTab ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="max-w-lg">
            <Input
              placeholder="Search tools (e.g., hashtags, engagement, influencer...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredTools.length === 0 ? (
          <div className="bg-background-elevated rounded-2xl p-10 border border-border text-center">
            <p className="text-foreground-muted">No tools match your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const Icon = categoryIcon(tool.category);
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group bg-background-elevated rounded-2xl p-7 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-pink-500/20 border border-border flex items-center justify-center">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <Badge variant="accent">{tool.category}</Badge>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-5">
                    {tool.description}
                  </p>

                  {tool.badges && tool.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {tool.badges.slice(0, 3).map((b) => (
                        <Badge key={b} variant="default">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-accent text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Open tool</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* SEO Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-background-elevated rounded-2xl border border-border p-8 md:p-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Complete Instagram Toolkit for Creators, Businesses & Marketers
          </h2>
          <div className="prose prose-lg max-w-none text-foreground-muted space-y-6">
            <p>
              Our comprehensive collection of <strong className="text-foreground">free Instagram tools</strong> helps you grow your account, create better content, analyze performance, and find the right partnerships. Whether you're a content creator, business owner, marketer, or influencer, these tools are designed to save you time and boost your Instagram success.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-pink-500/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Growth Tools</h3>
                </div>
                <p className="text-foreground-muted">
                  Track follower growth, analyze account health, find trending hashtags, and discover content ideas that drive engagement. Our growth tools help you understand what works and scale your Instagram presence effectively.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-pink-500/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Content Tools</h3>
                </div>
                <p className="text-foreground-muted">
                  Generate engaging captions, create content ideas, find the perfect hashtags, and style your bio with fancy fonts. Our AI-powered content tools help you create posts and Reels that stand out and drive results.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-pink-500/20 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Marketing Tools</h3>
                </div>
                <p className="text-foreground-muted">
                  Find influencers, calculate pricing, analyze competitor ads, and discover brand partnership opportunities. Our marketing tools help you build effective campaigns and connect with the right partners.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-pink-500/20 flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Analytics Tools</h3>
                </div>
                <p className="text-foreground-muted">
                  Calculate engagement rates, check for fake followers, measure earned media value, and analyze account performance. Our analytics tools provide insights to optimize your Instagram strategy.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-background-secondary rounded-xl border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">Why Use Our Instagram Tools?</h3>
              <ul className="space-y-3 text-foreground-muted">
                <li className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">AI-Powered:</strong> Our tools use advanced AI to provide accurate results and intelligent recommendations for your Instagram strategy.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">100% Free:</strong> All tools are completely free to use with no hidden costs, subscriptions, or premium tiers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">No Login Required:</strong> Start using any tool instantly without creating an account or providing personal information.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Comprehensive:</strong> From hashtag generation to influencer analysis, we cover every aspect of Instagram growth and optimization.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Popular Instagram Tools</h3>
              <p className="text-foreground-muted mb-4">
                Our most popular tools include the <strong className="text-foreground">AI Hashtag Generator</strong> for finding viral hashtags, the <strong className="text-foreground">Engagement Rate Calculator</strong> for analyzing post performance, the <strong className="text-foreground">Fake Follower Checker</strong> for detecting bots, and the <strong className="text-foreground">Influencer Search Tool</strong> for finding brand partnerships. Each tool is designed to solve specific Instagram challenges and help you achieve your goals faster.
              </p>
              <p className="text-foreground-muted">
                Whether you're looking to grow your follower count, improve engagement rates, create better content, or find influencer partnerships, our free Instagram tools provide everything you need to succeed on the platform. Start using any tool now - no signup required!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FAQSection
          faqs={[
            {
              question: 'Are these Instagram tools really free?',
              answer: 'Yes, all our Instagram tools are 100% free to use. There are no hidden costs, subscriptions, or premium tiers. You can use any tool as many times as you want without any limitations.',
            },
            {
              question: 'Do I need to create an account to use these tools?',
              answer: 'No, you don\'t need to create an account or log in to use any of our Instagram tools. Simply visit the tool page and start using it immediately. We respect your privacy and don\'t require any personal information.',
            },
            {
              question: 'What types of Instagram tools are available?',
              answer: 'We offer 30+ free Instagram tools across four main categories: Growth tools (follower tracking, hashtag finder), Content tools (caption generator, content ideas), Marketing tools (influencer finder, pricing calculator), and Analytics tools (engagement calculator, fake follower checker).',
            },
            {
              question: 'How accurate are the Instagram analytics tools?',
              answer: 'Our analytics tools use real Instagram data and industry-standard formulas to provide accurate calculations. Tools like the engagement rate calculator and fake follower checker analyze public data to give you reliable insights into account performance.',
            },
            {
              question: 'Can I use these tools for business accounts?',
              answer: 'Absolutely! Our Instagram tools work for personal accounts, business accounts, creator accounts, and brand accounts. Many tools are specifically designed for businesses and marketers looking to grow their Instagram presence.',
            },
            {
              question: 'Are the AI-powered tools safe to use?',
              answer: 'Yes, all our AI-powered tools are safe and secure. We use advanced AI technology to generate content, analyze data, and provide recommendations. All tools respect Instagram\'s terms of service and only access public data.',
            },
            {
              question: 'How often are the tools updated?',
              answer: 'We regularly update our Instagram tools to ensure they work with the latest Instagram features and provide the most accurate results. All tools are maintained and improved based on user feedback and platform changes.',
            },
            {
              question: 'Can I use these tools on mobile devices?',
              answer: 'Yes, all our Instagram tools are fully responsive and work on desktop, tablet, and mobile devices. You can access and use any tool from your smartphone or tablet browser.',
            },
            {
              question: 'Do these tools work with Instagram Reels?',
              answer: 'Yes, many of our tools support Instagram Reels. The engagement rate calculator, hashtag generator, and content ideas generator all work with Reels content. Some tools are specifically designed for Reels analysis and optimization.',
            },
            {
              question: 'How do I find the best tool for my needs?',
              answer: 'You can browse tools by category (Growth, Content, Marketing, Analytics) or use the search function to find tools by keyword. Each tool page includes a detailed description, features, and use cases to help you choose the right tool for your specific needs.',
            },
          ]}
          title="Frequently Asked Questions About Our Instagram Tools"
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            </div>
            <p className="text-sm text-foreground-muted">© 2025 Socialora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


