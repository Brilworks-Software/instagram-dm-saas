'use client';

import { GenericToolForm } from './generic-tool-form';

export function TrendingHashtags() {
  const fields = [
    {
      id: 'country',
      label: 'Country/Location',
      placeholder: 'e.g., United States, India, UK',
      required: true,
    },
    {
      id: 'niche',
      label: 'Niche/Industry',
      placeholder: 'e.g., Fashion, Tech, Travel',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="trending-hashtags-country"
      toolName="Trending Instagram Hashtags by Country"
      fields={fields}
      usageCount={1543}
      heroConfig={{
        title: 'Trending Instagram Hashtags by Country',
        description: 'Find popular hashtags by location to improve discovery.',
        gradient: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
      }}
      seoKeywords={[
        'trending hashtags',
        'instagram trending hashtags',
        'popular hashtags by country',
        'trending hashtags by location',
        'instagram hashtags 2024',
        'viral hashtags instagram',
        'country specific hashtags',
        'popular instagram hashtags',
        'trending tags instagram',
        'location based hashtags'
      ]}
      seoTitle="Trending Instagram Hashtags by Country | Find Popular Hashtags"
      seoDescription="Discover trending Instagram hashtags by country and location. Find popular and viral hashtags to boost post reach and engagement. Updated daily."
    />
  );
}
