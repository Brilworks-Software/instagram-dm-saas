'use client';

import { GenericToolForm } from './generic-tool-form';
import { Download } from 'lucide-react';

export function InstagramPhotoDownloader() {
  const fields = [
    {
      id: 'post-url',
      label: 'Instagram Post URL',
      placeholder: 'https://www.instagram.com/p/...',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="instagram-photo-downloader"
      toolName="Instagram Photo Downloader"
      fields={fields}
      usageCount={3421}
      heroTitle="Instagram Photo Downloader"
      heroDescription="Save photos from public posts and carousels (where permitted)."
      heroGradient="from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/20 dark:via-sky-950/20 dark:to-blue-950/20"
      heroBorder="border-cyan-200 dark:border-cyan-800"
      seoKeywords={[
        'instagram photo downloader',
        'download instagram photos',
        'instagram image downloader',
        'save instagram photos',
        'instagram downloader',
        'download instagram pictures',
        'instagram photo saver',
        'instagram carousel downloader',
        'instagram image saver',
        'free instagram downloader'
      ]}
      seoTitle="Free Instagram Photo Downloader | Download Instagram Images & Photos"
      seoDescription="Download Instagram photos and images from public posts and carousels. Fast, free, and easy-to-use Instagram photo downloader tool. No login required."
    />
  );
}
