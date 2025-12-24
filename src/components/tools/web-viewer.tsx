'use client';

import { GenericToolForm } from './generic-tool-form';
import { Globe } from 'lucide-react';

export function WebViewer() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter Instagram handle to view',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="web-viewer"
      toolName="Web Viewer for Instagram"
      fields={fields}
      usageCount={1654}
      heroTitle="Web Viewer for Instagram"
      heroDescription="Browse public profiles and content on the web with a simple viewer."
      heroGradient="from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/20 dark:via-gray-950/20 dark:to-zinc-950/20"
      heroBorder="border-slate-200 dark:border-slate-800"
      seoKeywords={[
        'instagram web viewer',
        'view instagram on web',
        'instagram profile viewer',
        'instagram online viewer',
        'browse instagram without app',
        'instagram desktop viewer',
        'view instagram profiles',
        'instagram web browser',
        'instagram profile browser',
        'instagram viewer online'
      ]}
      seoTitle="Free Instagram Web Viewer | Browse Profiles & Content Online"
      seoDescription="View Instagram profiles and content on the web without the app. Simple online Instagram viewer for browsing public accounts. No login required."
    />
  );
}
