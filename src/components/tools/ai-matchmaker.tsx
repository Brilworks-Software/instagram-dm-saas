'use client';

import { GenericToolForm } from './generic-tool-form';
import { Sparkles } from 'lucide-react';

export function AiMatchmaker() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter your Instagram handle',
      required: true,
    },
    {
      id: 'preferred-categories',
      label: 'Preferred Product Categories',
      placeholder: 'e.g., Beauty, Fashion, Tech, Fitness',
      required: true,
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      <GenericToolForm
        toolSlug="ai-matchmaker"
        toolName="AI Matchmaker for Free Products"
        heroTitle="AI Matchmaker for Free Products"
        heroDescription="Discover product gifting collaborations tailored to your niche and content style. Get matched with brands offering free products."
        heroGradient="from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20"
        heroBorder="border-pink-200 dark:border-pink-800"
        fields={fields}
        usageCount={1234}
        seoKeywords={[
          'free products for influencers',
          'brand collaboration',
          'influencer gifting',
          'free product partnerships',
          'brand deals instagram',
          'influencer matchmaker',
          'pr packages',
          'brand sponsorships',
          'instagram collaborations',
          'influencer marketing platform'
        ]}
        seoTitle="AI Matchmaker for Free Products | Find Brand Collaborations"
        seoDescription="Get matched with brands offering free products and gifting opportunities. AI-powered tool connects influencers with relevant brand partnerships. Start collaborating today."
      />

      {/* How It Works */}
    </div>
  );
}
