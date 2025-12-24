'use client';

import { GenericToolForm } from './generic-tool-form';
import { Sparkles } from 'lucide-react';

export function AdsSpyTool() {
  const fields = [
    {
      id: 'competitor-handle',
      label: 'Competitor Instagram Handle',
      placeholder: 'Enter competitor Instagram handle',
      required: true,
    },
    {
      id: 'industry',
      label: 'Industry/Niche',
      placeholder: 'e.g., Fashion, Beauty, Tech',
      required: true,
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      <GenericToolForm
        toolSlug="instagram-ads-spy"
        toolName="Instagram Ads Spy Tool"
        heroTitle="Instagram Ads Spy Tool"
        heroDescription="Analyze ads from competitors and brands to inspire creatives and strategy. Discover what's working in your industry."
        heroGradient="from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20"
        heroBorder="border-blue-200 dark:border-blue-800"
        fields={fields}
        usageCount={987}
        seoKeywords={[
          'instagram ads spy',
          'instagram ad library',
          'competitor ads analysis',
          'instagram advertising',
          'ad spy tool',
          'facebook ads spy',
          'instagram ad examples',
          'competitor ad research',
          'instagram marketing tool',
          'social media ads spy'
        ]}
        seoTitle="Free Instagram Ads Spy Tool | Analyze Competitor Ads & Strategy"
        seoDescription="Spy on competitor Instagram ads and campaigns. Discover successful ad creatives, copy, and strategies. Free tool to analyze Instagram advertising trends."
      />

      {/* How It Works */}
    </div>
  );
}
