'use client';

import { GenericToolForm } from './generic-tool-form';

export function EMVCalculator() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter your Instagram handle',
      required: true,
    },
    {
      id: 'follower-count',
      label: 'Follower Count',
      placeholder: 'Enter your follower count',
      type: 'number' as const,
      required: true,
    },
    {
      id: 'engagement-rate',
      label: 'Engagement Rate (%)',
      placeholder: 'e.g., 3.5',
      type: 'number' as const,
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="emv-calculator"
      toolName="Instagram Earned Media Value (EMV) Calculator"
      heroTitle="Instagram Earned Media Value (EMV) Calculator"
      heroDescription="Estimate the earned media value for creators or campaigns. Understand your content's worth in monetary terms."
      heroGradient="from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20"
      heroBorder="border-green-200 dark:border-green-800"
      fields={fields}
      usageCount={1654}
      seoKeywords={[
        'earned media value calculator',
        'emv calculator',
        'instagram emv',
        'social media value calculator',
        'influencer worth calculator',
        'instagram roi calculator',
        'media value estimation',
        'instagram campaign value',
        'influencer marketing calculator',
        'content value calculator'
      ]}
      seoTitle="Free Instagram EMV Calculator | Calculate Earned Media Value"
      seoDescription="Calculate your Instagram Earned Media Value (EMV) instantly. Free tool to estimate content worth and ROI for influencer campaigns. Get accurate EMV metrics."
    />
  );
}
