'use client';

import { GenericToolForm } from './generic-tool-form';

export function CaptionGenerator() {
  const fields = [
    {
      id: 'post-topic',
      label: 'Post Topic or Theme',
      placeholder: 'e.g., Summer vacation, Product launch, Fitness motivation',
      required: true,
    },
    {
      id: 'tone',
      label: 'Tone/Style',
      placeholder: 'e.g., Casual, Professional, Funny, Inspirational',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="caption-generator"
      toolName="Instagram Caption Generator"
      heroTitle="Instagram Caption Generator"
      heroDescription="Generate captions optimized for engagement and your brand voice. AI-powered captions that resonate with your audience."
      heroGradient="from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20"
      heroBorder="border-purple-200 dark:border-purple-800"
      fields={fields}
      usageCount={3421}
      seoKeywords={[
        'instagram caption generator',
        'ai caption generator',
        'instagram captions',
        'caption ideas',
        'instagram post captions',
        'caption generator free',
        'social media captions',
        'instagram bio generator',
        'catchy captions',
        'funny instagram captions'
      ]}
      seoTitle="Free AI Instagram Caption Generator | Create Engaging Captions"
      seoDescription="Generate engaging Instagram captions instantly with AI. Create perfect captions for posts, Reels, and stories that boost engagement. Free caption generator tool."
    />
  );
}
