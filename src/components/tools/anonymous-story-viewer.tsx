'use client';

import { GenericToolForm } from './generic-tool-form';
import { Eye } from 'lucide-react';

export function AnonymousStoryViewer() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter Instagram handle to view stories',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="anonymous-story-viewer"
      toolName="Anonymous Instagram Story Viewer"
      fields={fields}
      usageCount={1876}
      heroGradient="from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20"
      heroBorder="border-violet-200 dark:border-violet-800"
      heroIcon={<Eye className="h-8 w-8 text-violet-500" />}
      heroDescription="View public stories anonymously (privacy-first viewing)."
      seoKeywords={[
        'anonymous story viewer',
        'instagram story viewer',
        'view instagram stories anonymously',
        'ig story viewer',
        'instagram stories without login',
        'watch stories anonymously',
        'instagram anonymous viewer',
        'story viewer app',
        'instagram stalker',
        'view stories without account'
      ]}
      seoTitle="Anonymous Instagram Story Viewer | Watch Stories Privately"
      seoDescription="View Instagram stories anonymously without being seen. Free tool to watch public stories privately without leaving a trace. No login or account required."
    />
  );
}
