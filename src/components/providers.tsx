'use client';

import { PostHogProvider } from '@/lib/posthog';

export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>;
}

