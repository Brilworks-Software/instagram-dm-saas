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

  const structuredData: Record<string, any> = {
    ...defaultData,
    ...data,
  };

  // Organization schema for homepage
  if (type === 'Organization') {
    structuredData.name = 'SocialOra';
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
    structuredData.name = 'SocialOra';
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
    structuredData.name = 'SocialOra';
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
    name: 'SocialOra',
    alternateName: 'SocialOra Instagram DM Automation',
    url: cleanBaseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${cleanBaseUrl}/images/logo.png`,
      width: 512,
      height: 512,
    },
    description: 'AI-powered Instagram DM automation platform for businesses, creators, and agencies. Automate cold DMs, manage conversations, and scale outreach with the best Instagram automation tool.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/socialora',
      'https://linkedin.com/company/socialora',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'digital@socialora.com',
      availableLanguage: ['English'],
    },
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'Australia' },
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Country', name: 'Spain' },
      { '@type': 'Country', name: 'Brazil' },
      { '@type': 'Country', name: 'Mexico' },
      { '@type': 'Country', name: 'Global' },
    ],
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
          text: 'Instagram DM automation is the process of automatically sending, managing, and responding to Instagram direct messages using software tools. Socialora helps you automate cold DMs, manage conversations, and scale your outreach efforts. It allows businesses, creators, and agencies to send personalized messages at scale while maintaining authentic engagement.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Instagram DM automation work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora connects to your Instagram account securely using the official Meta Graph API and allows you to create automated campaigns, set up AI-powered responses, and manage all your DMs from a unified inbox. You can send personalized messages at scale while respecting Instagram\'s rate limits. The platform supports multi-account management, lead generation, and comprehensive analytics.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Instagram DM automation safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, when used responsibly. Socialora respects Instagram\'s rate limits and terms of service. We use secure authentication methods, the official Meta Graph API, and provide built-in rate limiting features to protect your account from being flagged or banned. Our platform is designed with safety and compliance as top priorities.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I automate cold DMs on Instagram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Socialora specializes in cold DM automation. You can create campaigns targeting specific users based on hashtags, locations, competitor followers, or bio keywords, and send personalized cold DMs at scale. Our AI-powered personalization ensures each message feels authentic and relevant to the recipient.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best Instagram DM automation tool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora is considered one of the best Instagram DM automation tools, offering AI-powered features, secure account management, comprehensive analytics, and excellent customer support. Unlike competitors like ColdDMs, Socialora is cloud-based, uses official APIs, and offers a free forever plan. Start with a free account - 1 Instagram account and 40 DMs daily, completely free forever.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Instagram DM automation free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Socialora offers a free forever plan that includes 1 Instagram account and 40 DMs daily bulk sending. No credit card required. For unlimited DMs and multiple accounts, contact our support team for custom pricing. This makes Socialora one of the most accessible Instagram automation tools available.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does Instagram DM automation cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora offers a free forever plan with 1 Instagram account and 40 DMs daily. For advanced features like unlimited DMs, multiple accounts, AI persona training, and lead scoring, pricing is custom and based on your needs. Contact our support team for personalized pricing. We offer better value than competitors like ColdDMs ($99/month) with our cloud-based platform and free tier.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use Instagram DM automation for multiple accounts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Socialora supports unlimited Instagram accounts. The free plan includes 1 account, and you can add more accounts with custom pricing. Our unified inbox allows you to manage all your Instagram accounts from one dashboard, making it perfect for agencies and businesses managing multiple brands.',
        },
      },
      {
        '@type': 'Question',
        name: 'How to automate Instagram DMs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'To automate Instagram DMs: 1) Sign up for Socialora free forever plan, 2) Connect your Instagram account securely, 3) Create campaigns with personalized messages, 4) Set up AI-powered auto-replies, 5) Launch and monitor results. No credit card required. Get started in minutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Best Instagram automation tool 2025?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora is the best Instagram automation tool in 2025. It offers AI-powered DM automation, free forever plan (1 account + 40 DMs daily), secure API integration, unified inbox, lead generation, and analytics. Better than ColdDMs with cloud-based platform and free tier.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Instagram DM automation legal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Instagram DM automation is legal when using official APIs and respecting Instagram\'s terms of service. Socialora uses the official Meta Graph API, respects rate limits, and follows all platform guidelines to keep your account safe and compliant.',
        },
      },
      {
        '@type': 'Question',
        name: 'Instagram DM automation for business?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora is perfect for businesses. Automate customer support, lead generation, and outreach campaigns. Features include AI-powered responses, unified inbox, analytics, multi-account management, and custom pricing for enterprise needs. Free forever plan available.',
        },
      },
      {
        '@type': 'Question',
        name: 'Instagram automation tool USA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Socialora is available in the USA and globally. We serve businesses, creators, and agencies across United States, UK, Canada, Australia, India, and worldwide. Free forever plan includes 1 account + 40 DMs daily. No geographic restrictions.',
        },
      },
    ],
  };

  // HowTo schema for AEO optimization
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Automate Instagram DMs with Socialora',
    description: 'Step-by-step guide to setting up Instagram DM automation using Socialora',
    image: `${cleanBaseUrl}/images/logo.png`,
    totalTime: 'PT10M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Instagram account',
      },
      {
        '@type': 'HowToSupply',
        name: 'Socialora account (free)',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Socialora platform',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Sign up for free',
        text: 'Create your free Socialora account. No credit card required. Get 1 Instagram account and 40 DMs daily, free forever.',
        image: `${cleanBaseUrl}/images/signup.png`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Connect Instagram account',
        text: 'Connect your Instagram account using our secure direct login method. No manual cookie management needed.',
        image: `${cleanBaseUrl}/images/connect.png`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Create your first campaign',
        text: 'Set up your first DM campaign. Choose your target audience, write personalized messages, and configure sending settings.',
        image: `${cleanBaseUrl}/images/campaign.png`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Launch and monitor',
        text: 'Launch your campaign and monitor results in real-time. Track opens, responses, and conversions from your dashboard.',
        image: `${cleanBaseUrl}/images/analytics.png`,
      },
    ],
  };

  // LocalBusiness schema for GEO optimization
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${cleanBaseUrl}#software`,
    name: 'SocialOra',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '999',
      offerCount: '3',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Forever Plan',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: '1 Instagram account, 40 DMs daily - free forever',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan',
          price: 'Custom',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Unlimited DMs, multiple accounts, advanced features',
        },
        {
          '@type': 'Offer',
          name: 'Enterprise Plan',
          price: 'Custom',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Custom solutions for large scale operations',
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Sarah Chen',
        },
        datePublished: '2024-12-01',
        reviewBody: 'SocialOra transformed how I manage customer inquiries. Response time dropped by 80% and customer satisfaction skyrocketed!',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Marcus Johnson',
        },
        datePublished: '2024-11-15',
        reviewBody: 'The AI assistant is incredibly smart. It understands context and maintains my brand voice perfectly.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
      },
    ],
  };

  // VideoObject schema for demo video (AEO optimization)
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'SocialOra Instagram DM Automation Demo',
    description: 'Watch how to automate Instagram DMs with Socialora. Free forever plan: 1 account + 40 DMs daily. AI-powered automation for businesses and creators.',
    thumbnailUrl: `${cleanBaseUrl}/og-image.jpg`,
    uploadDate: '2024-12-01',
    contentUrl: 'https://www.youtube.com/watch?v=qfZBnw7G2Tw',
    embedUrl: 'https://www.youtube.com/embed/qfZBnw7G2Tw',
    duration: 'PT3M',
    publisher: {
      '@type': 'Organization',
      name: 'SocialOra',
      logo: {
        '@type': 'ImageObject',
        url: `${cleanBaseUrl}/images/logo.png`,
      },
    },
  };

  // BreadcrumbList schema for navigation
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
    ],
  };

  // Service schema for GEO optimization
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Instagram DM Automation Service',
    description: 'AI-powered Instagram DM automation service. Free forever plan available. Serves businesses, creators, and agencies worldwide.',
    provider: {
      '@type': 'Organization',
      name: 'SocialOra',
      url: cleanBaseUrl,
    },
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'Australia' },
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'Global' },
    ],
    serviceType: 'Instagram Automation Software',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
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
      <Script
        id="structured-data-howto"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="structured-data-localbusiness"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Script
        id="structured-data-video"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="structured-data-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}

