import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app'),
  title: {
    default: 'Blog - Instagram DM Automation & Cold DM Strategies | SocialOra',
    template: '%s | SocialOra Blog',
  },
  description: 'Learn about Instagram DM automation, cold DM strategies, Instagram automation tools, and how to scale your outreach. Expert guides on Instagram marketing automation.',
  keywords: [
    'Instagram DM automation',
    'cold DM automation',
    'Instagram automation',
    'DM automation tools',
    'Instagram marketing automation',
    'automated Instagram messages',
    'Instagram outreach automation',
    'Instagram automation blog',
    'Instagram marketing tips',
    'social media automation',
  ],
  authors: [{ name: 'SocialOra Team' }],
  creator: 'SocialOra',
  publisher: 'SocialOra',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/blog',
    siteName: 'SocialOra Blog',
    title: 'Blog - Instagram DM Automation & Cold DM Strategies | SocialOra',
    description: 'Expert guides on Instagram DM automation, cold DM strategies, and Instagram marketing automation.',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'SocialOra Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Instagram DM Automation & Cold DM Strategies | SocialOra',
    description: 'Expert guides on Instagram DM automation, cold DM strategies, and Instagram marketing automation.',
    images: ['/images/logo.png'],
    creator: '@SocialOra',
  },
  alternates: {
    canonical: '/blog',
    types: {
      'application/rss+xml': '/blog/rss.xml',
    },
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
};

// Blog-specific structured data
function BlogStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'SocialOra Blog',
    description: 'Expert guides on Instagram DM automation, cold DM strategies, and Instagram marketing automation.',
    url: `${cleanBaseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'SocialOra',
      url: cleanBaseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${cleanBaseUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${cleanBaseUrl}/blog`,
    },
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
    ],
  };

  return (
    <>
      <Script
        id="structured-data-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BlogStructuredData />
      {children}
    </>
  );
}

