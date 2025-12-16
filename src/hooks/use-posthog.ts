'use client';

import { posthog } from '@/lib/posthog';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Hook to track page views and provide PostHog utilities
 */
function usePostHogInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && posthog) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        path: pathname,
      });
    }
  }, [pathname, searchParams]);

  return {
    posthog: posthog || null,
    capture: (event: string, properties?: Record<string, unknown>) => {
      if (posthog) {
        posthog.capture(event, properties);
      }
    },
    identify: (userId: string, properties?: Record<string, unknown>) => {
      if (posthog) {
        posthog.identify(userId, properties);
      }
    },
    reset: () => {
      if (posthog) {
        posthog.reset();
      }
    },
  };
}

export function usePostHog() {
  return usePostHogInner();
}

