'use client';

import { GenericToolForm } from './generic-tool-form';

export function InfluencerSearch() {
  const fields = [
    {
      id: 'niche',
      label: 'Niche/Category',
      placeholder: 'e.g., Fitness, Beauty, Tech',
      required: true,
    },
    {
      id: 'audience-size',
      label: 'Target Audience Size',
      placeholder: 'e.g., 10k-50k, 50k-100k, 100k+',
      required: true,
    },
    {
      id: 'keywords',
      label: 'Keywords',
      placeholder: 'Enter relevant keywords',
      required: false,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="influencer-search"
      toolName="Influencer Search Tool"
      fields={fields}
      usageCount={2098}
      heroConfig={{
        title: 'Influencer Search Tool',
        description: 'Discover influencers by niche, audience size, and keywords.',
        gradient: 'from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-sky-950/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
      }}
      seoKeywords={[
        'influencer search tool',
        'find influencers',
        'instagram influencer finder',
        'discover influencers',
        'influencer database',
        'influencer discovery platform',
        'find instagram influencers',
        'influencer search engine',
        'micro influencer search',
        'niche influencer finder'
      ]}
      seoTitle="Free Influencer Search Tool | Find Instagram Influencers by Niche"
      seoDescription="Search and discover Instagram influencers by niche, audience size, and keywords. Free influencer finder tool to build partnerships and grow your brand."
    />
  );
}
