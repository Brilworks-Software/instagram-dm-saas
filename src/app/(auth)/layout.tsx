import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Socialora - Instagram DM Automation',
    template: '%s | Socialora',
  },
  description: 'Automate Instagram DMs with AI-powered cold DM automation. Scale outreach, manage conversations, and convert leads.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

