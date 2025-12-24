import { MetadataRoute } from 'next';
import { getAllBlogSlugs } from '@/lib/blog-posts';
import { instagramTools } from '@/app/tools/_data/tools';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Dynamic blog post pages
  const blogSlugs = getAllBlogSlugs();
  const blogPages = blogSlugs.map((slug) => ({
    url: `${cleanBaseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const toolPages = instagramTools.map((tool) => ({
    url: `${cleanBaseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...toolPages];
}

