'use client';

import { GenericToolForm } from './generic-tool-form';

export function InfluencerPricingCalculator() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter Instagram handle',
      required: true,
    },
    {
      id: 'post-type',
      label: 'Post Type',
      placeholder: 'e.g., Feed Post, Story, Reel',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="influencer-pricing-calculator"
      toolName="Influencer Pricing Calculator"
      fields={fields}
      usageCount={1234}
      heroTitle="Influencer Pricing Calculator"
      heroDescription="Estimate pricing for sponsored posts based on account size and engagement."
      heroGradient="from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20"
      heroBorder="border-violet-200 dark:border-violet-800"
      seoKeywords={[
        'influencer pricing calculator',
        'instagram post pricing',
        'influencer rate calculator',
        'sponsored post pricing',
        'influencer pricing guide',
        'instagram sponsorship rates',
        'influencer cost calculator',
        'how much to charge instagram',
        'influencer marketing rates',
        'instagram collaboration pricing'
      ]}
      seoTitle="Free Influencer Pricing Calculator | Calculate Sponsorship Rates"
      seoDescription="Calculate Instagram influencer pricing for sponsored posts. Estimate fair rates based on followers, engagement, and content type. Free pricing calculator tool."
    />
  );
}
