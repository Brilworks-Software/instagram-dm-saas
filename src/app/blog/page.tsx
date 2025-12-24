import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, Instagram } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BlogHeader } from './blog-header';

export const metadata: Metadata = {
  title: 'Blog - Instagram DM Automation & Cold DM Strategies | SocialOra',
  description: 'Learn about Instagram DM automation, cold DM strategies, Instagram automation tools, and how to scale your outreach. Expert guides on Instagram marketing automation.',
  keywords: ['Instagram DM automation', 'cold DM automation', 'Instagram automation', 'DM automation tools', 'Instagram marketing automation', 'automated Instagram messages', 'Instagram outreach automation'],
  openGraph: {
    title: 'Blog - Instagram DM Automation & Cold DM Strategies | SocialOra',
    description: 'Expert guides on Instagram DM automation, cold DM strategies, and Instagram marketing automation.',
    type: 'website',
  },
};

// Import blog posts from lib
import { blogPosts } from '@/lib/blog-posts';

// Use the blog posts from the centralized data source
const allBlogPosts = blogPosts.map(post => ({
  slug: post.slug,
  title: post.title,
  description: post.description,
  date: post.date,
  readTime: post.readTime,
  category: post.category,
  keywords: post.keywords,
  featured: post.featured || false,
}));

export default function BlogPage() {
  const featuredPosts = allBlogPosts.filter(post => post.featured);
  const regularPosts = allBlogPosts.filter(post => !post.featured);

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
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Instagram DM Automation Blog
          </h1>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Expert guides on Instagram automation, cold DM strategies, and how to scale your outreach with AI-powered tools
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-background-elevated rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-sm text-foreground-muted">Featured</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-foreground-muted mb-6 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-foreground-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} read</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-accent group-hover:gap-2 transition-all">
                    <span className="font-medium">Read more</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">All Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-background-elevated rounded-xl p-6 border border-border hover:border-accent/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-full bg-background-secondary text-foreground-muted text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-foreground-muted mb-4 text-sm leading-relaxed line-clamp-3">
                  {post.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-foreground-muted mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <div className="flex items-center text-accent text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Read article</span>
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-accent/10 via-pink-500/10 to-accent/10 rounded-2xl p-12 border border-border text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Automate Your Instagram DMs?
          </h2>
          <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
            Start using SocialOra today and experience the power of AI-powered Instagram automation
          </p>
          <Link href="/">
            <Button size="lg" className="group">
              Join Waiting List
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
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
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2025 SocialOra. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

