'use client';

import { GenericToolForm } from './generic-tool-form';
import { MapPin } from 'lucide-react';

export function LocalInfluencerSearch() {
  const fields = [
    {
      id: 'location',
      label: 'Location',
      placeholder: 'Enter city or country',
      required: true,
    },
    {
      id: 'niche',
      label: 'Niche/Industry',
      placeholder: 'e.g., Fashion, Food, Travel',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="local-influencer-search"
      toolName="Local Influencer Search"
      fields={fields}
      usageCount={892}
      heroTitle="Local Influencer Search"
      heroDescription="Find influencers by location for local campaigns and partnerships."
      heroGradient="from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20"
      heroBorder="border-emerald-200 dark:border-emerald-800"
      seoKeywords={[
        'local influencer search',
        'find local influencers',
        'instagram influencers near me',
        'local instagram influencers',
        'location based influencer search',
        'city influencer finder',
        'local brand ambassadors',
        'regional influencer search',
        'geo targeted influencers',
        'find influencers by location'
      ]}
      seoTitle="Local Influencer Search Tool | Find Instagram Influencers Near You"
      seoDescription="Find local Instagram influencers by city or region. Discover nearby creators for local campaigns and partnerships. Free location-based influencer search."
    />
  );
}
