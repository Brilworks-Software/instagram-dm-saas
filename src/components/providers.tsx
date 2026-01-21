'use client';

import { useEffect } from 'react';
import { PostHogProvider } from '@/lib/posthog';
import { Toaster } from '@/components/ui/toast';
import JobPoller from '@/components/JobPoller';

// Load and apply appearance preferences on app startup
function AppearanceLoader() {
  useEffect(() => {
    const STORAGE_KEY = 'socialora_appearance_preferences';
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        const root = document.documentElement;
        const body = document.body;

        // Apply theme - remove both classes first, then add the correct one
        root.classList.remove('dark', 'light');
        if (preferences.theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.add(prefersDark ? 'dark' : 'light');
        } else {
          root.classList.add(preferences.theme);
        }

        // Apply accent color
        const accentColorMap: Record<string, string> = {
          pink: '#ec4899',
          purple: '#a855f7',
          blue: '#3b82f6',
          green: '#10b981',
          orange: '#f97316',
        };
        
        const accentHex = accentColorMap[preferences.accentColor] || accentColorMap.pink;
        root.style.setProperty('--accent-color', accentHex);
        
        // Calculate hover and muted colors
        const adjustBrightness = (hex: string, percent: number): string => {
          const num = parseInt(hex.replace('#', ''), 16);
          const r = Math.min(255, Math.max(0, (num >> 16) + percent));
          const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
          const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
          return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
        };
        
        root.style.setProperty('--accent-hover', adjustBrightness(accentHex, 20));
        root.style.setProperty('--accent-muted', adjustBrightness(accentHex, 40));

        // Apply font size
        body.classList.remove('text-sm', 'text-base', 'text-lg');
        if (preferences.fontSize === 'small') {
          body.classList.add('text-sm');
        } else if (preferences.fontSize === 'large') {
          body.classList.add('text-lg');
        } else {
          body.classList.add('text-base');
        }

        // Apply compact mode
        body.classList.toggle('compact-mode', preferences.compactMode);
      } catch (e) {
        console.error('Failed to load appearance preferences:', e);
        // Default to dark theme if loading fails
        document.documentElement.classList.add('dark');
      }
    } else {
      // No preferences saved, default to dark theme
      document.documentElement.classList.add('dark');
    }
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <JobPoller />
      <AppearanceLoader />
      {children}
      <Toaster />
    </PostHogProvider>
  );
}

