import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { BlogPost, FAQ, Citation } from './blog-posts';
import { DEFAULT_AUTHOR, DEFAULT_AUTHOR_ROLE, getAuthorWithRole } from './blog-posts';

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

// Re-export types
export type { BlogPost, FAQ, Citation };

// Cache for better performance
let postsCache: BlogPost[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(blogDirectory);
  return fileNames
    .filter((name) => {
      // Exclude README and example files
      if (name === 'README.md' || name === 'example-post.mdx') {
        return false;
      }
      return name.endsWith('.mdx') || name.endsWith('.md');
    })
    .map((name) => name.replace(/\.(mdx|md)$/, ''));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const extensions = ['.mdx', '.md'];
    let fileContents: string | null = null;

    for (const ext of extensions) {
      const testPath = path.join(blogDirectory, `${slug}${ext}`);
      if (fs.existsSync(testPath)) {
        fileContents = fs.readFileSync(testPath, 'utf8');
        break;
      }
    }

    if (!fileContents) {
      return null;
    }

    const { data, content } = matter(fileContents);

    // Parse frontmatter
    const faqs: FAQ[] = Array.isArray(data.faqs) ? data.faqs : [];
    const citations: Citation[] = Array.isArray(data.citations) ? data.citations : [];

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || new Date().toISOString().split('T')[0],
      readTime: data.readTime || '5 min',
      category: data.category || 'General',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      content: content, // Will be processed by MDX
      author: data.author || DEFAULT_AUTHOR,
      authorRole: data.authorRole || DEFAULT_AUTHOR_ROLE,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.description,
      featured: data.featured || false,
      pillar: data.pillar || false,
      clusterOf: data.clusterOf,
      funnelStage: data.funnelStage,
      faqs,
      citations,
      relatedPosts: Array.isArray(data.relatedPosts) ? data.relatedPosts : [],
    };
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error);
    return null;
  }
}

export function getAllBlogPosts(): BlogPost[] {
  // Use cache if available and fresh
  const now = Date.now();
  if (postsCache && (now - cacheTime) < CACHE_DURATION) {
    return postsCache;
  }

  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const slugs = getAllBlogSlugs();
  const posts: BlogPost[] = slugs
    .map((slug) => {
      try {
        const extensions = ['.mdx', '.md'];
        for (const ext of extensions) {
          const testPath = path.join(blogDirectory, `${slug}${ext}`);
          if (fs.existsSync(testPath)) {
            const fileContents = fs.readFileSync(testPath, 'utf8');
            const { data } = matter(fileContents);
            
            return {
              slug,
              title: data.title || '',
              description: data.description || '',
              date: data.date || new Date().toISOString().split('T')[0],
              readTime: data.readTime || '5 min',
              category: data.category || 'General',
              keywords: Array.isArray(data.keywords) ? data.keywords : [],
              content: '', // Not needed for listings
              author: data.author || DEFAULT_AUTHOR,
              authorRole: data.authorRole || DEFAULT_AUTHOR_ROLE,
              metaTitle: data.metaTitle || data.title,
              metaDescription: data.metaDescription || data.description,
              featured: data.featured || false,
              pillar: data.pillar || false,
              clusterOf: data.clusterOf,
              funnelStage: data.funnelStage,
              faqs: Array.isArray(data.faqs) ? data.faqs : [],
              citations: Array.isArray(data.citations) ? data.citations : [],
              relatedPosts: Array.isArray(data.relatedPosts) ? data.relatedPosts : [],
            } as BlogPost;
          }
        }
        return null;
      } catch (error) {
        console.error(`Error loading blog post ${slug}:`, error);
        return null;
      }
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Update cache
  postsCache = posts;
  cacheTime = now;

  return posts;
}

export function getFeaturedPosts(): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.featured);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.category === category);
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getAllBlogPosts().find(p => p.slug === currentSlug);
  if (!currentPost) return [];

  return getAllBlogPosts()
    .filter(p => 
      p.slug !== currentSlug &&
      (p.category === currentPost.category || 
       p.clusterOf === currentPost.slug ||
       currentPost.relatedPosts?.includes(p.slug))
    )
    .slice(0, limit);
}

