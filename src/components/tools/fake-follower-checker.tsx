'use client';

import { GenericToolForm } from './generic-tool-form';

export function FakeFollowerChecker() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter Instagram handle to check',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="fake-follower-checker"
      toolName="Instagram Fake Follower Checker"
      heroTitle="Instagram Fake Follower Checker"
      heroDescription="Estimate follower quality and spot potential bots or suspicious patterns. Get detailed analytics on follower authenticity."
      heroGradient="from-red-50 via-orange-50 to-pink-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-pink-950/20"
      heroBorder="border-red-200 dark:border-red-800"
      fields={fields}
      usageCount={2156}
      seoKeywords={[
        'fake follower checker',
        'instagram fake followers',
        'bot checker instagram',
        'fake follower detector',
        'instagram audit',
        'follower quality checker',
        'instagram bot detector',
        'check fake followers',
        'instagram followers audit',
        'authentic followers checker'
      ]}
      seoTitle="Free Instagram Fake Follower Checker | Detect Bots & Fake Followers"
      seoDescription="Check for fake followers and bots on Instagram. Free tool to audit follower quality and detect suspicious patterns. Ensure authentic engagement on your account."
    />
  );
}
