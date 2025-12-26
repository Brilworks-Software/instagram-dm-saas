import { blogPosts } from './blog-posts';

export interface BlogRelationship {
  slug: string;
  title: string;
  type: 'pillar' | 'cluster' | 'subcluster' | 'related';
}

export interface BlogInterlinking {
  pillar?: string; // Slug of pillar post
  clusters?: string[]; // Slugs of cluster posts
  related?: string[]; // Slugs of related posts
}

/**
 * Get related blog posts for interlinking
 */
export function getRelatedBlogPosts(
  currentSlug: string,
  limit: number = 3
): BlogRelationship[] {
  const currentPost = blogPosts.find(p => p.slug === currentSlug);
  if (!currentPost) return [];

  // Get posts from same category first
  const sameCategory = blogPosts
    .filter(p => 
      p.slug !== currentSlug && 
      p.category === currentPost.category
    )
    .slice(0, limit);

  // If not enough, add from other categories
  if (sameCategory.length < limit) {
    const otherPosts = blogPosts
      .filter(p => 
        p.slug !== currentSlug && 
        !sameCategory.some(sp => sp.slug === p.slug)
      )
      .slice(0, limit - sameCategory.length);
    
    return [...sameCategory, ...otherPosts].map(p => ({
      slug: p.slug,
      title: p.title,
      type: 'related' as const,
    }));
  }

  return sameCategory.map(p => ({
    slug: p.slug,
    title: p.title,
    type: 'related' as const,
  }));
}

/**
 * Get cluster posts for a pillar post
 */
export function getClusterPosts(pillarSlug: string): BlogRelationship[] {
  const pillarPost = blogPosts.find(p => p.slug === pillarSlug);
  if (!pillarPost || !pillarPost.pillar) return [];

  return blogPosts
    .filter(p => p.clusterOf === pillarSlug)
    .map(p => ({
      slug: p.slug,
      title: p.title,
      type: 'cluster' as const,
    }));
}

/**
 * Get pillar post for a cluster post
 */
export function getPillarPost(clusterSlug: string): BlogRelationship | null {
  const clusterPost = blogPosts.find(p => p.slug === clusterSlug);
  if (!clusterPost || !clusterPost.clusterOf) return null;

  const pillarPost = blogPosts.find(p => p.slug === clusterPost.clusterOf);
  if (!pillarPost) return null;

  return {
    slug: pillarPost.slug,
    title: pillarPost.title,
    type: 'pillar' as const,
  };
}

/**
 * Generate interlinking HTML for blog posts
 */
export function generateInterlinkingHTML(
  currentSlug: string,
  type: 'pillar' | 'cluster' | 'related' = 'related'
): string {
  let posts: BlogRelationship[] = [];

  if (type === 'pillar') {
    const pillar = getPillarPost(currentSlug);
    if (pillar) posts = [pillar];
  } else if (type === 'cluster') {
    posts = getClusterPosts(currentSlug);
  } else {
    posts = getRelatedBlogPosts(currentSlug, 3);
  }

  if (posts.length === 0) return '';

  const title = type === 'pillar' 
    ? 'Main Guide' 
    : type === 'cluster' 
    ? 'Related Topics' 
    : 'Related Articles';

  const html = `
    <div class="blog-interlinking">
      <h3>${title}</h3>
      <ul>
        ${posts.map(post => `
          <li>
            <a href="/blog/${post.slug}">${post.title}</a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  return html;
}

