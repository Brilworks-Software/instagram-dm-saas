'use client';

import Link from 'next/link';
import { Instagram, User, Bell, Shield, CreditCard, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SettingsItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const settingsItems: SettingsItem[] = [
  {
    title: 'Instagram Accounts',
    description: 'Connect and manage your Instagram accounts',
    href: '/settings/instagram',
    icon: Instagram,
    badge: 'Required',
  },
  {
    title: 'Profile',
    description: 'Update your personal information and preferences',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Notifications',
    description: 'Configure how and when you receive notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Security',
    description: 'Manage your password and security settings',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'Billing',
    description: 'View your subscription and manage payment methods',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Appearance',
    description: 'Customize the look and feel of your dashboard',
    href: '/settings/appearance',
    icon: Palette,
  },
];

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const fetchUserEmail = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request');
    const body = encodeURIComponent(`Hi Socialora Support Team,\n\n[Please describe your issue or question here]\n\n---\nFrom: ${userEmail}`);
    window.location.href = `mailto:digital@brilworks.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-foreground-muted">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-start gap-4 rounded-xl border border-border bg-background-elevated p-6 transition-all hover:border-border-hover hover:bg-background-secondary"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all">
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground group-hover:text-pink-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="inline-flex items-center rounded-full bg-pink-500/20 px-2 py-0.5 text-xs font-medium text-pink-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-muted line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-subtle group-hover:text-foreground-muted transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-background-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Need Help?</h2>
        <p className="text-foreground-muted text-sm mb-4">
          Check out our documentation or reach out to our support team.
        </p>
        <div className="flex gap-3">
          <a 
            href="https://socialora.app/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-background-secondary text-foreground hover:bg-background-tertiary transition-colors"
          >
            View Documentation
          </a>
          <button 
            onClick={handleContactSupport}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
