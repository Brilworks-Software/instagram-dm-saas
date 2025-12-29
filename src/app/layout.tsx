import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app'),
  title: {
    default: "SocialOra - #1 Instagram DM Automation Tool 2026",
    template: "%s | SocialOra"
  },
  description: "Automate Instagram DMs with AI. Free forever: 1 account + 40 DMs daily. Best Instagram automation tool for businesses, creators & agencies. No credit card required.",
  keywords: [
    // Primary keywords
    "Instagram DM automation",
    "Instagram automation tool",
    "cold DM automation",
    "Instagram DM manager",
    "automated Instagram messages",
    "Instagram outreach automation",
    "Instagram DM bot",
    "Instagram marketing automation",
    "Instagram DM scheduler",
    "Instagram direct message automation",
    "Instagram DM automation software",
    "best Instagram automation tool",
    "Instagram automation platform",
    "Instagram DM automation service",
    "Instagram message automation",
    "Instagram DM automation app",
    "Instagram automation 2025",
    "Instagram DM automation free",
    "Instagram automation tool free trial",
    "Instagram DM automation for business",
    "Instagram automation for creators",
    "Instagram DM automation agency",
    "Instagram automation software",
    "Instagram DM automation tool review",
    "how to automate Instagram DMs",
    "Instagram DM automation tutorial",
    "Instagram automation best practices",
    "Instagram DM automation pricing",
    "Instagram automation alternatives",
    "Instagram DM automation features",
    // Long-tail keywords for AEO
    "how to automate Instagram direct messages",
    "best tool for Instagram cold DM automation",
    "Instagram DM automation software free",
    "automate Instagram messages for business",
    "Instagram outreach automation tool",
    "cold DM automation Instagram free",
    "Instagram DM automation for agencies",
    "AI Instagram DM automation",
    "Instagram message automation software",
    "automated Instagram DM campaigns",
    // Geographic variations (GEO)
    "Instagram DM automation USA",
    "Instagram automation tool United States",
    "Instagram DM automation UK",
    "Instagram automation Canada",
    "Instagram DM automation Australia",
    "Instagram automation India",
    // Intent-based keywords
    "Instagram DM automation comparison",
    "SocialOra vs ColdDMs",
    "Instagram automation tool pricing",
    "free Instagram DM automation",
    "Instagram automation free forever",
    "Instagram DM automation reviews",
    "best Instagram automation 2025"
  ],
  authors: [{ name: "SocialOra" }],
  creator: "SocialOra",
  publisher: "SocialOra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SocialOra",
    title: "SocialOra - #1 Instagram DM Automation Tool 2025",
    description: "Automate Instagram DMs with AI. Free forever: 1 account + 40 DMs daily. Best Instagram automation for businesses, creators & agencies. No credit card required.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SocialOra - Instagram DM Automation Tool | Free Forever Plan Available",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialOra - #1 Instagram DM Automation Tool 2026",
    description: "Automate Instagram DMs with AI. Free forever: 1 account + 40 DMs daily. Best Instagram automation tool. No credit card required.",
    images: ["/og-image.jpg"],
    creator: "@SocialOra",
    site: "@SocialOra",
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
    yandex: process.env.YANDEX_VERIFICATION_ID,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent flash of light mode by setting dark mode immediately
                const savedTheme = localStorage.getItem('theme');
                const savedPreferences = localStorage.getItem('socialora_appearance_preferences');
                
                // Check for theme preference
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else if (savedPreferences) {
                  try {
                    const preferences = JSON.parse(savedPreferences);
                    if (preferences.theme === 'light') {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                    } else if (preferences.theme !== 'system') {
                      // Ensure dark is set (default)
                      document.documentElement.classList.remove('light');
                      document.documentElement.classList.add('dark');
                    }
                  } catch (e) {
                    // Default to dark on error
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } else {
                  // No preference saved, default to dark
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
