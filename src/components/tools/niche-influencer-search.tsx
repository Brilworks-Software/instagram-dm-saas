'use client';

import { GenericToolForm } from './generic-tool-form';
import { Target } from 'lucide-react';

export function NicheInfluencerSearch() {
  const fields = [
    {
      id: 'niche-keywords',
      label: 'Niche Keywords',
      placeholder: 'e.g., vegan recipes, sustainable fashion',
      required: true,
    },
    {
      id: 'follower-range',
      label: 'Follower Range',
      placeholder: 'e.g., 10K-100K',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="niche-influencer-search"
      toolName="Niche Influencer Search"
      fields={fields}
      usageCount={1245}
      heroGradient="from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"
      heroBorder="border-indigo-200 dark:border-indigo-800"
      heroIcon={<Target className="h-8 w-8 text-indigo-500" />}
      heroDescription="Find influencers by niche keywords in bio or content for targeted partnerships."
      seoKeywords={[
        'niche influencer search',
        'find niche influencers',
        'micro influencer finder',
        'niche content creators',
        'targeted influencer search',
        'specialty influencer finder',
        'niche instagram influencers',
        'category specific influencers',
        'find micro influencers by niche',
        'niche marketing influencers'
      ]}
      seoTitle="Niche Influencer Search | Find Micro & Niche Instagram Influencers"
      seoDescription="Search for niche Instagram influencers by keywords and categories. Find targeted micro-influencers perfect for your brand partnerships. Free search tool."
    />
  );
}
