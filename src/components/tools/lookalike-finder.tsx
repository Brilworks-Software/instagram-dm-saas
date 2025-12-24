'use client';

import { GenericToolForm } from './generic-tool-form';

export function LookalikeFinder() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Top Performer Instagram Handle',
      placeholder: 'Enter Instagram handle of top performer',
      required: true,
    },
    {
      id: 'niche',
      label: 'Niche/Industry',
      placeholder: 'e.g., Fashion, Tech, Food',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="lookalike-finder"
      toolName="Instagram Lookalike Finder"
      fields={fields}
      usageCount={945}
      heroTitle="Instagram Lookalike Finder"
      heroDescription="Find creators similar to your top performers for scaling partnerships."
      heroGradient="from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-cyan-950/20"
      heroBorder="border-indigo-200 dark:border-indigo-800"
      seoKeywords={[
        'instagram lookalike finder',
        'find similar influencers',
        'lookalike influencers',
        'similar account finder',
        'instagram account similar',
        'find similar creators',
        'lookalike audience tool',
        'influencer lookalike',
        'similar instagram profiles',
        'clone influencer finder'
      ]}
      seoTitle="Instagram Lookalike Finder | Find Similar Influencers & Creators"
      seoDescription="Find Instagram influencers similar to your top performers. Discover lookalike creators to scale partnerships and expand reach. Free lookalike finder tool."
    />
  );
}
