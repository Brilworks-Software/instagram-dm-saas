import Script from 'next/script';

interface StructuredDataProps {
  type?: 'Organization' | 'SoftwareApplication' | 'WebSite' | 'Product';
  data?: Record<string, any>;
}

export function StructuredData({ type = 'WebSite', data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  const defaultData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  const structuredData = {
    ...defaultData,
    ...data,
  };

  // Organization schema for homepage
  if (type === 'Organization') {
    structuredData.name = 'Socialora';
    structuredData.url = cleanBaseUrl;
    structuredData.logo = `${cleanBaseUrl}/logo.png`;
    structuredData.description = 'AI-powered Instagram DM automation platform for businesses, creators, and agencies';
    structuredData.sameAs = [
      'https://twitter.com/socialora',
      'https://linkedin.com/company/socialora',
    ];
  }

  // SoftwareApplication schema
  if (type === 'SoftwareApplication') {
    structuredData.name = 'Socialora';
    structuredData.applicationCategory = 'BusinessApplication';
    structuredData.operatingSystem = 'Web';
    structuredData.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    };
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
    };
    structuredData.description = 'Automate Instagram DMs with AI-powered cold DM automation. Scale outreach, manage conversations, and convert leads.';
  }

  // WebSite schema
  if (type === 'WebSite') {
    structuredData.name = 'Socialora';
    structuredData.url = cleanBaseUrl;
    structuredData.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${cleanBaseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Homepage-specific structured data
export function HomepageStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Socialora',
    url: cleanBaseUrl,
    logo: `${cleanBaseUrl}/logo.png`,
    description: 'AI-powered Instagram DM automation platform for businesses, creators, and agencies',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/socialora',
      'https://linkedin.com/company/socialora',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@socialora.app',
    },
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Socialora',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Automate Instagram DMs with AI-powered cold DM automation. Scale outreach, manage conversations, and convert leads.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'AI-Powered DM Automation',
      'Cold DM Campaigns',
      'Unified Inbox Management',
      'Lead Generation',
      'Analytics & Reporting',
      'Multi-Account Support',
    ],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Socialora',
    url: cleanBaseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${cleanBaseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Instagram DM automation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Instagram DM automation is the process of automatically sending, managing, and responding to Instagram direct messages using software tools. Socialora helps you automate cold DMs, manage conversations, and scale your outreach efforts.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Instagram DM automation work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora connects to your Instagram account securely and allows you to create automated campaigns, set up AI-powered responses, and manage all your DMs from a unified inbox. You can send personalized messages at scale while respecting Instagram\'s rate limits.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Instagram DM automation safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, when used responsibly. Socialora respects Instagram\'s rate limits and terms of service. We use secure authentication methods and provide rate limiting features to protect your account from being flagged or banned.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I automate cold DMs on Instagram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Socialora specializes in cold DM automation. You can create campaigns targeting specific users based on hashtags, locations, or competitor followers, and send personalized cold DMs at scale.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best Instagram DM automation tool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora is considered one of the best Instagram DM automation tools, offering AI-powered features, secure account management, comprehensive analytics, and excellent customer support. Start with a free 14-day trial to see for yourself.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="structured-data-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <Script
        id="structured-data-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <Script
        id="structured-data-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

