import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { TERMS_LAST_UPDATED } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service - Instagram DM Automation | SocialOra',
  description: 'Read SocialOra\'s terms of service for Instagram DM automation. Understand usage guidelines, account responsibilities, and service terms.',
  keywords: [
    'SocialOra terms of service',
    'Instagram automation terms',
    'DM automation terms',
    'Instagram automation service agreement',
  ],
  openGraph: {
    title: 'Terms of Service - Instagram DM Automation | SocialOra',
    description: 'Read SocialOra\'s terms of service for Instagram DM automation. Understand usage guidelines and service terms.',
    type: 'website',
  },
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
                  <Image 
                    src="/images/logo.png" 
                    alt="SocialOra" 
                    width={56} 
                    height={56} 
                    className="h-full w-full object-contain" 
                  />
                </div>
                <span className="font-bold text-xl">
                  Social<span className="text-accent">Ora</span>
                </span>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-foreground-muted mb-8">Last updated: {TERMS_LAST_UPDATED}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              By accessing and using SocialOra ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className="text-foreground-muted leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of SocialOra's Instagram DM automation platform. Please read these Terms carefully before using our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              SocialOra is a software-as-a-service platform that enables users to:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Manage Instagram direct messages through a unified inbox</li>
              <li>Create and manage automated DM campaigns</li>
              <li>Use AI-powered features for message automation</li>
              <li>Generate leads and manage contacts</li>
              <li>Analyze campaign performance and engagement metrics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.1 Account Creation</h3>
            <p className="text-foreground-muted leading-relaxed mb-4">
              To use our Service, you must:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Be at least 13 years old (or the age of majority in your jurisdiction)</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.2 Account Responsibility</h3>
            <p className="text-foreground-muted leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>All activities that occur under your account</li>
              <li>Maintaining the confidentiality of your password</li>
              <li>Ensuring your account information is up to date</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Send spam, unsolicited messages, or engage in harassment</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated systems to access the Service in violation of rate limits</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Violate Instagram's Terms of Service or Community Guidelines</li>
              <li>Collect or harvest personal information from other users</li>
              <li>Transmit any viruses, malware, or harmful code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Instagram Compliance</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              You must comply with Instagram's Terms of Service and Community Guidelines when using our Service. This includes:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Not sending unsolicited direct messages</li>
              <li>Respecting rate limits and sending restrictions</li>
              <li>Not engaging in spam or abusive behavior</li>
              <li>Obtaining proper consent before sending marketing messages</li>
              <li>Not using the Service to violate Instagram's policies</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate Instagram's policies or engage in abusive behavior.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">6.1 Our Rights</h3>
            <p className="text-foreground-muted leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by SocialOra and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">6.2 Your Content</h3>
            <p className="text-foreground-muted leading-relaxed mb-4">
              You retain ownership of any content you create or upload through the Service. By using the Service, you grant us a license to:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Store and process your content to provide the Service</li>
              <li>Use anonymized data for service improvement</li>
              <li>Backup and restore your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Payment and Billing</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              If you subscribe to a paid plan:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>You agree to pay all fees associated with your subscription</li>
              <li>Fees are billed in advance on a recurring basis</li>
              <li>All fees are non-refundable unless required by law</li>
              <li>We reserve the right to change our pricing with 30 days notice</li>
              <li>Failure to pay may result in service suspension or termination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Service Availability</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              We strive to provide reliable service but do not guarantee:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Uninterrupted or error-free service</li>
              <li>That the Service will meet your specific requirements</li>
              <li>That defects will be corrected</li>
              <li>Compatibility with all devices or browsers</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              We may perform scheduled maintenance that temporarily interrupts service availability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOCIALORA SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Damages resulting from your use or inability to use the Service</li>
              <li>Damages resulting from unauthorized access to your account</li>
              <li>Damages resulting from Instagram account suspension or termination</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Indemnification</h2>
            <p className="text-foreground-muted leading-relaxed">
              You agree to indemnify and hold harmless SocialOra, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Termination</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              We may terminate or suspend your account immediately, without prior notice, for:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Violation of these Terms of Service</li>
              <li>Violation of Instagram's Terms of Service</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Non-payment of fees (for paid plans)</li>
              <li>Extended periods of account inactivity</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              Upon termination, your right to use the Service will cease immediately. You may delete your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to Terms</h2>
            <p className="text-foreground-muted leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Posting the updated Terms on this page</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>Updating the "Last updated" date</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Governing Law</h2>
            <p className="text-foreground-muted leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-background-elevated rounded-lg p-6 border border-border">
              <p className="text-foreground-muted">
                <strong className="text-foreground">Email:</strong> legal@socialora.app
              </p>
              <p className="text-foreground-muted mt-2">
                <strong className="text-foreground">Support:</strong> <Link href="/support" className="text-accent hover:underline">Visit Support Page</Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/images/logo.png" 
                  alt="SocialOra" 
                  width={56} 
                  height={56} 
                  className="h-full w-full object-contain" 
                />
              </div>
              <span className="font-bold text-xl">
                Social<span className="text-accent">Ora</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2025 SocialOra. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

