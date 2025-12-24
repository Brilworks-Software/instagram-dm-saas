'use client';

import { GenericToolForm } from './generic-tool-form';

export function LikesFollowersRatio() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter Instagram handle',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="likes-followers-ratio"
      toolName="Likes-to-Followers Ratio Calculator"
      fields={fields}
      usageCount={1765}
      heroConfig={{
        title: 'Likes-to-Followers Ratio Calculator',
        description: 'Measure engagement quality relative to follower count.',
        gradient: 'from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/20 dark:via-pink-950/20 dark:to-fuchsia-950/20',
        borderColor: 'border-rose-200 dark:border-rose-800',
      }}
      seoKeywords={[
        'likes to followers ratio',
        'instagram ratio calculator',
        'engagement ratio calculator',
        'likes followers ratio calculator',
        'instagram engagement ratio',
        'calculate likes ratio',
        'instagram metrics ratio',
        'follower engagement quality',
        'instagram analytics ratio',
        'social media ratio calculator'
      ]}
      seoTitle="Free Likes-to-Followers Ratio Calculator | Measure Instagram Engagement"
      seoDescription="Calculate your Instagram likes-to-followers ratio. Measure engagement quality and compare with industry benchmarks. Free ratio calculator tool."
    />
  );
}
