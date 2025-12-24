'use client';

import { GenericToolForm } from './generic-tool-form';

export function AiHashtagGenerator() {
  const fields = [
    {
      id: 'post-topic',
      label: 'Post Topic or Description',
      placeholder: 'e.g., Sunset photography, fitness workout, vegan recipe',
      required: true,
    },
    {
      id: 'category',
      label: 'Content Category',
      placeholder: 'e.g., Travel, Fitness, Food, Fashion',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="ai-hashtag-generator"
      toolName="AI Hashtag Generator"
      fields={fields}
      usageCount={2156}
      heroConfig={{
        title: 'AI Hashtag Generator',
        description: 'Generate relevant hashtags for posts and Reels based on topic and category.',
        gradient: 'from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-indigo-950/20',
        borderColor: 'border-cyan-200 dark:border-cyan-800',
      }}
      seoKeywords={[
        'instagram hashtag generator',
        'ai hashtag generator',
        'instagram hashtags',
        'trending hashtags',
        'best instagram hashtags',
        'hashtag generator free',
        'instagram reels hashtags',
        'hashtag finder',
        'instagram growth hashtags',
        'viral hashtags instagram'
      ]}
      seoTitle="Free AI Instagram Hashtag Generator | Find Best Hashtags for Posts & Reels"
      seoDescription="Generate viral Instagram hashtags instantly with our AI-powered hashtag generator. Find trending hashtags for posts, Reels, and stories to boost engagement and reach. 100% free tool."
    />
  );
}
