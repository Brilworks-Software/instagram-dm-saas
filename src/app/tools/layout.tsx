import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free Instagram Tools | 30+ AI-Powered Tools for Growth, Content & Analytics',
  description: 'Access 30+ free Instagram tools for growth, content creation, marketing, and analytics. AI-powered hashtag generator, engagement calculator, fake follower checker, influencer finder, and more. All tools are free and no login required.',
  keywords: [
    'free instagram tools',
    'instagram tools',
    'instagram analytics tools',
    'instagram growth tools',
    'instagram content tools',
    'instagram marketing tools',
    'instagram hashtag generator',
    'instagram engagement calculator',
    'instagram fake follower checker',
    'instagram influencer finder',
    'instagram caption generator',
    'instagram content ideas',
    'instagram analytics',
    'instagram metrics calculator',
    'instagram follower tracker',
    'instagram tools free',
    'instagram tools online',
    'best instagram tools',
    'instagram tools 2025',
    'instagram automation tools',
    'instagram engagement rate calculator',
    'instagram hashtag tools',
    'instagram content creator tools',
    'instagram business tools',
    'instagram influencer tools',
    'instagram analytics dashboard',
    'instagram growth calculator',
    'instagram roi calculator',
    'instagram emv calculator',
    'instagram tools for creators',
    'instagram tools for business',
    'instagram tools for influencers',
    'free instagram analytics',
    'instagram tools no login',
    'instagram tools free online'
  ],
  openGraph: {
    title: 'Free Instagram Tools | 30+ AI-Powered Tools for Growth, Content & Analytics',
    description: 'Access 30+ free Instagram tools for growth, content creation, marketing, and analytics. AI-powered hashtag generator, engagement calculator, fake follower checker, influencer finder, and more.',
    type: 'website',
    url: '/tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Instagram Tools | 30+ AI-Powered Tools',
    description: 'Access 30+ free Instagram tools for growth, content creation, marketing, and analytics.',
  },
  alternates: {
    canonical: '/tools',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  const toolsPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Instagram Tools',
    description: 'Collection of 30+ free Instagram tools for growth, content creation, marketing, and analytics',
    url: `${cleanBaseUrl}/tools`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 30,
      itemListElement: [
        {
          '@type': 'SoftwareApplication',
          name: 'Instagram Tools Collection',
          applicationCategory: 'WebApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      ],
    },
  };

  return (
    <>
      <Script
        id="tools-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsPageSchema) }}
      />
      {children}
    </>
  );
}

