import { MetadataRoute } from 'next';
import { instagramTools } from '@/app/tools/_data/tools';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  
  // Remove trailing slash and ensure proper URL format
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Static pages with their priorities and change frequencies
  // Optimized for SEO with proper priorities based on importance
  const staticPages = [
    {
      url: cleanBaseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0, // Highest priority - homepage
    },
    {
      url: `${cleanBaseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9, // High priority - content marketing
    },
    {
      url: `${cleanBaseUrl}/blog/rss.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7, // Medium priority - RSS feed
    },
    {
      url: `${cleanBaseUrl}/ebook/increase-instagram-followers-reach-engagement`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85, // High priority - lead magnet
    },
    {
      url: `${cleanBaseUrl}/blog/free-ebook-increase-instagram-followers-reach-engagement`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8, // High priority - SEO content
    },
    {
      url: `${cleanBaseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85, // High priority - product discovery
    },
    {
      url: `${cleanBaseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9, // High priority - conversion page
    },
    {
      url: `${cleanBaseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8, // Important - documentation
    },
    {
      url: `${cleanBaseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7, // Medium priority - support
    },
    {
      url: `${cleanBaseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5, // Lower priority - legal
    },
    {
      url: `${cleanBaseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5, // Lower priority - legal
    },
  ];

  // Dynamic blog post pages with smart prioritization
  const { getAllBlogPosts } = await import('@/lib/blog-loader');
  const blogPosts = getAllBlogPosts();
  const blogPages = blogPosts.map((post) => {
    // Higher priority for pillar and featured posts
    let priority = 0.8;
    if (post.pillar) priority = 0.95;
    else if (post.featured) priority = 0.90;
    
    // Boost priority for new 2025 and 2026 content
    const is2025Content = post.slug?.includes('2025');
    const is2026Content = post.slug?.includes('2026');
    if (is2026Content) priority = Math.min(0.98, priority + 0.08);
    else if (is2025Content) priority = Math.min(0.95, priority + 0.05);

    // Determine change frequency based on recency
    const daysSincePublished = Math.floor(
      (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly';
    if (daysSincePublished < 3) changeFrequency = 'hourly'; // Very recent content
    else if (daysSincePublished < 7) changeFrequency = 'daily';
    else if (daysSincePublished < 30) changeFrequency = 'weekly';

    return {
      url: `${cleanBaseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency,
      priority,
    };
  });

  const toolPages = instagramTools.map((tool) => ({
    url: `${cleanBaseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...toolPages];
}

