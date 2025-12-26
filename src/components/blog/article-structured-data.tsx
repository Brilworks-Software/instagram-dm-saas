import Script from 'next/script';

interface ArticleStructuredDataProps {
  post: {
    slug: string;
    title: string;
    description: string;
    date: string;
    author?: string;
    category: string;
    keywords: string[];
  };
}

export function ArticleStructuredData({ post }: ArticleStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const postUrl = `${cleanBaseUrl}/blog/${post.slug}`;
  const publishedDate = new Date(post.date).toISOString();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${cleanBaseUrl}/images/logo.png`,
    datePublished: publishedDate,
    dateModified: publishedDate,
    author: {
      '@type': 'Person',
      name: post.author || 'Dhaval Trivedi',
      jobTitle: 'COO',
      worksFor: {
        '@type': 'Organization',
        name: 'SocialOra',
      },
      url: cleanBaseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SocialOra',
      url: cleanBaseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${cleanBaseUrl}/images/logo.png`,
        width: 1200,
        height: 630,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    url: postUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: cleanBaseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${cleanBaseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id={`structured-data-article-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id={`structured-data-breadcrumb-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

