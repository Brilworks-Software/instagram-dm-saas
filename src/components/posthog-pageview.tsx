'use client';

import { usePostHog } from '@/hooks/use-posthog';

/**
 * Component to track page views in client components
 * Add this to pages that need pageview tracking
 */
export function PostHogPageView() {
  usePostHog();
  return null;
}

