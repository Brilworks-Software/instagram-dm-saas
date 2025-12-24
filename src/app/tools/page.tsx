'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Instagram, ArrowRight, Search, Sparkles, TrendingUp, Megaphone, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { instagramTools, type ToolCategoryTab, toolCategoryTabs } from './_data/tools';

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
          <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
            Explore growth, content, marketing, and analytics tools designed to help you plan, optimize, and scale your Instagram efforts.
          </p>
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


