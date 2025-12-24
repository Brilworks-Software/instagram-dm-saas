'use client';

import { GenericToolForm } from './generic-tool-form';
import { Video } from 'lucide-react';

export function InstagramReelsDownloader() {
  const fields = [
    {
      id: 'reel-url',
      label: 'Instagram Reel URL',
      placeholder: 'https://www.instagram.com/reel/...',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="instagram-reels-downloader"
      toolName="Instagram Reels Downloader"
      fields={fields}
      usageCount={2987}
      heroGradient="from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/20 dark:via-pink-950/20 dark:to-fuchsia-950/20"
      heroBorder="border-rose-200 dark:border-rose-800"
      heroIcon={<Video className="h-8 w-8 text-rose-500" />}
      heroDescription="Download Reels from public profiles (where permitted)."
      seoKeywords={[
        'instagram reels downloader',
        'download instagram reels',
        'reels downloader',
        'save instagram reels',
        'instagram video downloader',
        'download reels video',
        'instagram reels saver',
        'reels download free',
        'instagram reels to mp4',
        'free reels downloader'
      ]}
      seoTitle="Free Instagram Reels Downloader | Download Reels Videos"
      seoDescription="Download Instagram Reels videos from public profiles. Fast, free, and easy-to-use Reels downloader. Save Reels in high quality without watermark."
    />
  );
}
