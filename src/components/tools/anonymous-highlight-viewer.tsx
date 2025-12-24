'use client';

import { GenericToolForm } from './generic-tool-form';

export function AnonymousHighlightViewer() {
  const fields = [
    {
      id: 'instagram-username',
      label: 'Instagram Username',
      placeholder: 'Enter Instagram username',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="anonymous-highlight-viewer"
      toolName="Anonymous Instagram Highlight Viewer"
      fields={fields}
      usageCount={3421}
      heroConfig={{
        title: 'Anonymous Instagram Highlight Viewer',
        description: 'View public highlights anonymously (privacy-first viewing).',
        gradient: 'from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
      }}
      seoKeywords={[
        'anonymous instagram viewer',
        'instagram highlights viewer',
        'view instagram highlights',
        'instagram story viewer anonymous',
        'instagram highlights downloader',
        'view instagram anonymously',
        'instagram highlights free',
        'watch highlights anonymously',
        'instagram privacy viewer',
        'anonymous ig viewer'
      ]}
      seoTitle="Anonymous Instagram Highlight Viewer | View Highlights Privately"
      seoDescription="View Instagram highlights anonymously without being detected. Free privacy-first tool to watch public highlights without leaving a trace. No login required."
    />
  );
}
