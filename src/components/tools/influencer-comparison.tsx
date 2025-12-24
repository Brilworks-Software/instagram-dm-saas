'use client';

import { GenericToolForm } from './generic-tool-form';

export function InfluencerComparison() {
  const fields = [
    {
      id: 'influencer-1',
      label: 'First Influencer Handle',
      placeholder: 'Enter first Instagram handle',
      required: true,
    },
    {
      id: 'influencer-2',
      label: 'Second Influencer Handle',
      placeholder: 'Enter second Instagram handle',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="influencer-comparison"
      toolName="Influencer Comparison Tool"
      fields={fields}
      usageCount={876}
      heroTitle="Influencer Comparison Tool"
      heroDescription="Compare influencers side-by-side using key performance signals."
      heroGradient="from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20"
      heroBorder="border-orange-200 dark:border-orange-800"
      seoKeywords={[
        'influencer comparison tool',
        'compare influencers',
        'instagram influencer comparison',
        'influencer analytics comparison',
        'compare instagram accounts',
        'influencer metrics comparison',
        'instagram account comparison',
        'influencer vs influencer',
        'social media comparison tool',
        'influencer performance comparison'
      ]}
      seoTitle="Free Influencer Comparison Tool | Compare Instagram Influencers"
      seoDescription="Compare Instagram influencers side-by-side. Analyze performance metrics, engagement rates, and audience demographics. Make data-driven partnership decisions."
    />
  );
}
