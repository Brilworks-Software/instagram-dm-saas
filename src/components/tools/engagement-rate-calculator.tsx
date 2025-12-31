'use client';

import { GenericToolForm } from './generic-tool-form';

export function EngagementRateCalculator() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter your Instagram handle (e.g., @username)',
      required: true,
    },
    {
      id: 'content-type',
      label: 'Content Type',
      placeholder: 'Posts or Reels',
      type: 'text' as const,
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="engagement-rate-calculator"
      toolName="Instagram Engagement Rate Calculator (Posts/Reels)"
      heroTitle="Instagram Engagement Rate Calculator (Posts/Reels)"
      heroDescription="Check engagement rates and performance signals for posts and Reels. Optimize your content strategy with data. We'll analyze your last 5 posts or reels to calculate your real engagement rate."
      heroGradient="from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/20 dark:via-rose-950/20 dark:to-red-950/20"
      heroBorder="border-pink-200 dark:border-pink-800"
      fields={fields}
      usageCount={3567}
      seoKeywords={[
        'instagram engagement rate calculator',
        'engagement rate calculator',
        'instagram analytics',
        'instagram engagement',
        'instagram metrics',
        'social media engagement calculator',
        'instagram reels engagement',
        'calculate engagement rate',
        'instagram performance metrics',
        'engagement calculator free'
      ]}
      seoTitle="Free Instagram Engagement Rate Calculator | Calculate Posts & Reels Engagement"
      seoDescription="Calculate your Instagram engagement rate instantly. Free tool to measure likes, comments, and performance for posts and Reels. Optimize your content strategy with accurate analytics."
    />
  );
}
