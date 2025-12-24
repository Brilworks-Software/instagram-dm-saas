'use client';

import { GenericToolForm } from './generic-tool-form';

export function RatioCalculator() {
  const fields = [
    {
      id: 'followers',
      label: 'Follower Count',
      placeholder: 'Enter your follower count',
      type: 'number',
      required: true,
    },
    {
      id: 'following',
      label: 'Following Count',
      placeholder: 'Enter your following count',
      type: 'number',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="ratio-calculator"
      toolName="Follower-to-Following Ratio Calculator"
      heroTitle="Follower-to-Following Ratio Calculator"
      heroDescription="Understand account health with follower-to-following ratio analysis. Maintain a healthy Instagram account balance."
      heroGradient="from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20"
      heroBorder="border-violet-200 dark:border-violet-800"
      fields={fields}
      usageCount={2789}
      seoKeywords={[
        'follower to following ratio',
        'instagram ratio calculator',
        'follower following calculator',
        'instagram account health',
        'calculate follower ratio',
        'following ratio checker',
        'instagram ratio analysis',
        'follower following balance',
        'instagram account ratio',
        'optimal follower ratio'
      ]}
      seoTitle="Free Follower-to-Following Ratio Calculator | Check Instagram Health"
      seoDescription="Calculate your Instagram follower-to-following ratio. Check account health and maintain optimal balance. Free ratio calculator with insights."
    />
  );
}
