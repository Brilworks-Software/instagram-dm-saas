'use client';

import { GenericToolForm } from './generic-tool-form';

export function EngagementCalculator() {
  const fields = [
    {
      id: 'likes',
      label: 'Total Likes',
      placeholder: 'Enter total likes',
      type: 'number' as const,
      required: true,
    },
    {
      id: 'comments',
      label: 'Total Comments',
      placeholder: 'Enter total comments',
      type: 'number' as const,
      required: true,
    },
    {
      id: 'followers',
      label: 'Total Followers',
      placeholder: 'Enter total followers',
      type: 'number' as const,
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="engagement-calculator"
      toolName="Instagram Engagement Calculator"
      heroTitle="Instagram Engagement Calculator"
      heroDescription="Calculate engagement rate using likes, comments, and followers. Get accurate metrics to track your performance."
      heroGradient="from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"
      heroBorder="border-indigo-200 dark:border-indigo-800"
      fields={fields}
      usageCount={4210}
      seoKeywords={[
        'engagement calculator',
        'instagram engagement calculator',
        'calculate engagement rate',
        'instagram metrics calculator',
        'social media engagement',
        'engagement rate formula',
        'instagram analytics calculator',
        'likes comments calculator',
        'instagram performance calculator',
        'engagement tracking tool'
      ]}
      seoTitle="Free Instagram Engagement Calculator | Calculate Engagement Rate"
      seoDescription="Calculate Instagram engagement rate with our free tool. Measure likes, comments, and follower interactions. Get accurate engagement metrics instantly."
    />
  );
}
