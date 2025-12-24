'use client';

import { GenericToolForm } from './generic-tool-form';

export function ContentIdeasGenerator() {
  const fields = [
    {
      id: 'niche',
      label: 'Your Niche or Industry',
      placeholder: 'e.g., Fashion, Tech, Fitness, Beauty',
      required: true,
    },
    {
      id: 'content-type',
      label: 'Content Type',
      placeholder: 'e.g., Posts, Stories, Reels',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="content-ideas-generator"
      toolName="Instagram Content Ideas Generator"
      heroTitle="Instagram Content Ideas Generator"
      heroDescription="Get fresh content ideas for posts, stories, and Reels based on your niche. Never run out of content ideas again."
      heroGradient="from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20"
      heroBorder="border-blue-200 dark:border-blue-800"
      fields={fields}
      usageCount={2890}
      seoKeywords={[
        'instagram content ideas',
        'content ideas generator',
        'instagram post ideas',
        'social media content ideas',
        'instagram reels ideas',
        'content creator ideas',
        'instagram story ideas',
        'viral content ideas',
        'instagram content strategy',
        'content ideas for instagram'
      ]}
      seoTitle="Free Instagram Content Ideas Generator | Get Fresh Post & Reels Ideas"
      seoDescription="Generate unlimited Instagram content ideas for posts, stories, and Reels. AI-powered tool helps you create viral content based on your niche. Never run out of ideas."
    />
  );
}
