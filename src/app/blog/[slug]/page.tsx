import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Facebook, Linkedin, Twitter, User } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
  content: string;
  author?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// Import blog posts data
import { getAllBlogSlugs, getBlogPost } from '@/lib/blog-posts';

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | SocialOra',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  // Use client-side URL for sharing
  const shareUrl = `https://www.socialora.app/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
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
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/tools">
                <Button variant="ghost" size="sm">Tools</Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm">Blog</Button>
              </Link>
              <Link href="/">
                <Button size="sm">Join Waiting List</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-foreground-muted mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} read</span>
            </div>
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
            )}
          </div>
          
          {/* Share Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-border">
            <span className="text-sm text-foreground-muted">Share:</span>
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background-elevated border border-border hover:border-accent/50 transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background-elevated border border-border hover:border-accent/50 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background-elevated border border-border hover:border-accent/50 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-accent/10 via-pink-500/10 to-accent/10 rounded-2xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Start Automating Your Instagram DMs?
          </h2>
          <p className="text-foreground-muted mb-6">
            Join thousands of businesses using SocialOra to automate their Instagram outreach and grow their audience.
          </p>
          <Link href="/">
            <Button size="lg">
              Join Waiting List
            </Button>
          </Link>
        </div>

        {/* Related Posts */}
        <div className="mt-16 pt-16 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Related posts will be added here */}
            <Link href="/blog" className="text-accent hover:underline">
              View all blog posts →
            </Link>
          </div>
        </div>
      </article>

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

