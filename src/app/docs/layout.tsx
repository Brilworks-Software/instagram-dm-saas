import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation - Instagram DM Automation Guide | Socialora',
  description: 'Complete guide to using Socialora for Instagram DM automation. Learn how to connect accounts, create campaigns, automate responses, find leads, and analyze performance.',
  keywords: [
    'Instagram DM automation guide',
    'Instagram automation tutorial',
    'how to automate Instagram DMs',
    'Instagram DM automation documentation',
    'Instagram automation help',
    'Instagram DM automation setup',
    'Instagram automation guide 2025',
  ],
  openGraph: {
    title: 'Documentation - Instagram DM Automation Guide | Socialora',
    description: 'Complete guide to using Socialora for Instagram DM automation. Learn how to connect accounts, create campaigns, and automate responses.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Documentation - Instagram DM Automation Guide | Socialora',
    description: 'Complete guide to using Socialora for Instagram DM automation.',
  },
  alternates: {
    canonical: '/docs',
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

