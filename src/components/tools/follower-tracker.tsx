'use client';

import { GenericToolForm } from './generic-tool-form';

export function FollowerTracker() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter Instagram handle to track',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="follower-tracker"
      toolName="Instagram Follower Count Tracker"
      heroTitle="Instagram Follower Count Tracker (Real-Time)"
      heroDescription="Track follower changes over time to monitor growth and identify trends. Get real-time follower count updates."
      heroGradient="from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-indigo-950/20"
      heroBorder="border-cyan-200 dark:border-cyan-800"
      fields={fields}
      usageCount={5234}
      seoKeywords={[
        'instagram follower tracker',
        'follower count tracker',
        'instagram growth tracker',
        'real time follower count',
        'instagram analytics',
        'follower tracking tool',
        'instagram follower counter',
        'track instagram followers',
        'follower growth analysis',
        'instagram stats tracker'
      ]}
      seoTitle="Free Instagram Follower Tracker | Real-Time Follower Count"
      seoDescription="Track Instagram follower growth in real-time. Monitor follower changes, analyze trends, and measure account growth. Free follower tracking tool."
    />
  );
}
