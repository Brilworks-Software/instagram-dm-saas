import { Button } from '@/components/ui/button';
import { ArticleStructuredData } from '@/components/blog/article-structured-data';
import { FAQSection } from '@/components/blog/faq-section';
import { CitationsSection } from '@/components/blog/citations-section';
import { ArrowLeft, Calendar, Clock, Facebook, Linkedin, Twitter, User } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import { useMDXComponents } from '@/components/blog/mdx-components';

// Import blog posts data
import { getAllBlogSlugs, getBlogPost, getRelatedPosts } from '@/lib/blog-loader';
import { DEFAULT_AUTHOR, DEFAULT_AUTHOR_ROLE } from '@/lib/blog-posts';

// Force static generation for all blog posts
export const dynamicParams = false;
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const postUrl = `${cleanBaseUrl}/blog/${post?.slug || ''}`;
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | SocialOra',
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.description;
  const publishedTime = new Date(post.date).toISOString();

  return {
    title,
    description,
    keywords: post.keywords,
    authors: [{ name: post.author || DEFAULT_AUTHOR }],
    creator: post.author || DEFAULT_AUTHOR,
    publisher: 'SocialOra',
    openGraph: {
      title,
      description,
      type: 'article',
      url: postUrl,
      publishedTime,
      modifiedTime: publishedTime,
      authors: [post.author || DEFAULT_AUTHOR],
      section: post.category,
      tags: post.keywords,
      siteName: 'SocialOra Blog',
      images: [
        {
          url: `${cleanBaseUrl}/images/logo.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${cleanBaseUrl}/images/logo.png`],
      creator: '@SocialOra',
    },
    alternates: {
      canonical: postUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:published_time': publishedTime,
      'article:modified_time': publishedTime,
      'article:author': post.author || DEFAULT_AUTHOR,
      'article:section': post.category,
      'article:tag': post.keywords.join(', '),
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const components = useMDXComponents({});
  const relatedPosts = getRelatedPosts(post.slug, 3);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const shareUrl = `${baseUrl}/blog/${post.slug}`;
  
  // MDX options for RSC
  const mdxOptions: any = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        rehypeHighlight,
      ] as any,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData post={post} />
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
        <header className="mb-8" itemScope itemType="https://schema.org/BlogPosting">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium" itemProp="articleSection">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight" itemProp="headline">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-foreground-muted mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={new Date(post.date).toISOString()} itemProp="datePublished">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} read</span>
            </div>
            <div className="flex items-center gap-2" itemProp="author" itemScope itemType="https://schema.org/Person">
              <User className="h-4 w-4" />
              <span itemProp="name">{post.author || DEFAULT_AUTHOR}</span>
              {post.authorRole && (
                <span className="text-xs text-foreground-muted">({post.authorRole})</span>
              )}
            </div>
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

        {/* Breadcrumbs for SEO */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-foreground-muted">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
            <li>/</li>
            <li className="text-foreground">{post.title}</li>
          </ol>
        </nav>

        {/* Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none blog-content"
          itemProp="articleBody"
        >
          <MDXRemote 
            source={post.content} 
            options={mdxOptions}
            components={components} 
          />
        </div>

        {/* FAQs */}
        {post.faqs && post.faqs.length > 0 && (
          <FAQSection faqs={post.faqs} />
        )}

        {/* Citations */}
        {post.citations && post.citations.length > 0 && (
          <CitationsSection citations={post.citations} />
        )}

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

        {/* Related Posts for Internal Linking */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group bg-background-elevated rounded-xl p-6 border border-border hover:border-accent/50 transition-all"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-pink-400 transition-colors duration-200">
                    {related.title}
                  </h3>
                  <p className="text-sm text-foreground-muted line-clamp-2">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
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

