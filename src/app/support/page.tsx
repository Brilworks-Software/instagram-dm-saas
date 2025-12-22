import { Button } from '@/components/ui/button';
import { Book, FileText, HelpCircle, Instagram, Mail, Search, Users, Video } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SupportHeader } from './support-header';

export const metadata: Metadata = {
  title: 'Support - Instagram DM Automation Help Center | Socialora',
  description: 'Get help with Instagram DM automation. Find answers to FAQs, contact support, access tutorials, and learn how to use Socialora effectively.',
  keywords: [
    'Instagram DM automation support',
    'Instagram automation help',
    'Socialora support',
    'Instagram automation FAQ',
    'Instagram DM automation customer service',
    'Instagram automation troubleshooting',
  ],
  openGraph: {
    title: 'Support - Instagram DM Automation Help Center | Socialora',
    description: 'Get help with Instagram DM automation. Find answers to FAQs, contact support, and access tutorials.',
    type: 'website',
  },
  alternates: {
    canonical: '/support',
  },
};

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I connect my Instagram account?",
      answer: "You can connect your Instagram account in three ways: 1) Use our Direct Login feature (recommended) - just click 'Connect with Direct Login' and follow the prompts. 2) Use the Socialora Chrome Extension - install the extension, go to Instagram, and click 'Grab Instagram Session'. 3) Manually enter your cookies in Settings > Instagram Accounts."
    },
    {
      question: "Is my Instagram account safe?",
      answer: "Yes! We use enterprise-grade encryption to protect your Instagram session cookies. All data is stored securely with row-level security policies. We never share your credentials with third parties, and you can disconnect your account at any time."
    },
    {
      question: "Can I use multiple Instagram accounts?",
      answer: "Absolutely! You can connect multiple Instagram accounts to your Socialora workspace. Each account is managed separately, and you can switch between them easily from the Settings page."
    },
    {
      question: "How does the AI automation work?",
      answer: "Our AI Studio allows you to create automation rules based on keywords, message types, or user behavior. When a message matches your rules, the AI can automatically respond using templates you've configured. You can review and approve responses before sending, or enable fully automated mode."
    },
    {
      question: "What are the rate limits?",
      answer: "Rate limits depend on your subscription plan. Free plans have lower limits to prevent abuse. Paid plans include higher limits. We also implement intelligent rate limiting to ensure compliance with Instagram's policies and prevent account suspension."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period. You'll continue to have access to all features until then."
    },
    {
      question: "What happens if my Instagram account gets suspended?",
      answer: "If your Instagram account is suspended, you'll need to resolve the issue with Instagram directly. Once resolved, you can reconnect your account to Socialora. We recommend following Instagram's Community Guidelines and using our rate limiting features to prevent suspensions."
    },
    {
      question: "How do I export my data?",
      answer: "You can export your data at any time from Settings > Data Export. This will include all your messages, campaigns, contacts, and account information in a machine-readable format."
    }
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      action: "Send us an email",
      href: "mailto:dhaval.m@brilworks.com?cc=digital@socialora.com&subject=Socialora Support Request"
    },
    {
      icon: Book,
      title: "Documentation",
      description: "Browse our guides",
      action: "View docs",
      href: "/docs"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      action: "Watch videos",
      href: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SupportHeader />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto mb-8">
            Find answers to common questions or get in touch with our support team
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full h-12 pl-12 pr-4 rounded-lg bg-background-elevated border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className="bg-background-elevated rounded-xl p-6 border border-border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center mb-4">
                <option.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-foreground-muted mb-4">
                {option.description}
              </p>
              {option.href.startsWith("/") ? (
                <Link
                  href={option.href}
                  className="text-accent hover:underline text-sm font-medium">
                  {option.action} →
                </Link>
              ) : (
                <a
                  href={option.href}
                  className="text-accent hover:underline text-sm font-medium">
                  {option.action} →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-background-elevated rounded-2xl p-8 border border-border mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Quick Links
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/privacy"
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-background-secondary transition-colors">
              <FileText className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium text-foreground">
                  Privacy Policy
                </div>
                <div className="text-sm text-foreground-muted">
                  Learn how we protect your data
                </div>
              </div>
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-background-secondary transition-colors">
              <FileText className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium text-foreground">
                  Terms of Service
                </div>
                <div className="text-sm text-foreground-muted">
                  Read our terms and conditions
                </div>
              </div>
            </Link>
            <a
              href="mailto:dhaval.m@brilworks.com?cc=digital@socialora.com&subject=Socialora Support Request"
              className="group">
              <Button
                size="lg"
                className="group-hover:scale-[1.02] transition-all">
                <Mail className="h-5 w-5 mr-2 group-hover:translate-x-0.5 transition-transform" />
                Email Support
              </Button>
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="h-6 w-6 text-accent" />
            <h2 className="text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-background-elevated rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-accent/10 via-pink-500/10 to-accent/10 rounded-2xl p-8 border border-border">
          <div className="text-center">
            <Users className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Still need help?
            </h2>
            <p className="text-foreground-muted mb-6 max-w-2xl mx-auto">
              Our support team is here to help you. Reach out to us and we'll
              get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:dhaval.m@brilworks.com?cc=digital@socialora.com&subject=Socialora Support Request">
                <Button size="lg">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Support
                </Button>
              </a>
              <Link href="/">
                <Button variant="secondary" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Social<span className="text-accent">ora</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2025 Socialora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

