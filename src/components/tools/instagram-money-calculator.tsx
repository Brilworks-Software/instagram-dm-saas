'use client';

import { GenericToolForm } from './generic-tool-form';
import { DollarSign } from 'lucide-react';

export function InstagramMoneyCalculator() {
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
      label: 'Average Engagement Rate (%)',
      placeholder: 'Enter your engagement rate',
      type: 'number' as const,
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="instagram-money-calculator"
      toolName="Instagram Money Calculator"
      fields={fields}
      usageCount={2156}
      heroTitle="Instagram Money Calculator"
      heroDescription="Estimate potential earnings from sponsored content based on your performance and audience size."
      heroGradient="from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20"
      heroBorder="border-green-200 dark:border-green-800"
      seoKeywords={[
        'instagram money calculator',
        'instagram earnings calculator',
        'how much money instagram',
        'instagram revenue calculator',
        'influencer income calculator',
        'instagram sponsorship calculator',
        'instagram profit calculator',
        'how much can i make on instagram',
        'instagram earning potential',
        'calculate instagram income'
      ]}
      seoTitle="Free Instagram Money Calculator | Calculate Potential Earnings"
      seoDescription="Calculate how much money you can make on Instagram. Estimate earnings from sponsored posts, affiliate marketing, and brand deals. Free income calculator."
    />
  );
}
