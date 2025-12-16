import Link from 'next/link';
import { Instagram, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Bulk<span className="text-accent">DM</span>
              </span>
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-foreground-muted mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              Welcome to BulkDM ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Instagram DM automation platform.
            </p>
            <p className="text-foreground-muted leading-relaxed">
              By using BulkDM, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.1 Account Information</h3>
            <p className="text-foreground-muted leading-relaxed mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Password (encrypted and hashed)</li>
              <li>Authentication tokens from Supabase</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Instagram Account Data</h3>
            <p className="text-foreground-muted leading-relaxed mb-4">
              To provide our services, we collect and store:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Instagram session cookies (encrypted)</li>
              <li>Instagram user ID and username</li>
              <li>Profile information (name, profile picture URL)</li>
              <li>Direct messages and conversations (stored securely)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.3 Usage Data</h3>
            <p className="text-foreground-muted leading-relaxed mb-4">
              We automatically collect information about how you use our service:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Campaign performance metrics</li>
              <li>Message sending statistics</li>
              <li>Feature usage analytics (via PostHog)</li>
              <li>Error logs and debugging information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">We use the collected information for:</p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Providing and maintaining our service</li>
              <li>Processing and managing Instagram DM campaigns</li>
              <li>Authenticating and authorizing access to your account</li>
              <li>Improving our service and user experience</li>
              <li>Analyzing usage patterns and performance</li>
              <li>Sending important service notifications</li>
              <li>Detecting and preventing fraud or abuse</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Storage and Security</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li><strong>Encryption:</strong> All sensitive data, including Instagram cookies, are encrypted at rest and in transit</li>
              <li><strong>Database Security:</strong> Row-level security (RLS) policies ensure data isolation between users</li>
              <li><strong>Authentication:</strong> Secure authentication via Supabase with email verification</li>
              <li><strong>Access Control:</strong> Workspace-based access control ensures users can only access their own data</li>
              <li><strong>Regular Backups:</strong> Data is regularly backed up to prevent loss</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li><strong>Service Providers:</strong> With trusted third-party services (Supabase, PostHog) that help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent for data processing</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              To exercise these rights, please contact us at the email address provided in the Contact section.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies and Tracking</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Maintain your session and authentication state</li>
              <li>Store your preferences and settings</li>
              <li>Analyze service usage and performance</li>
              <li>Provide personalized experiences</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              You can control cookies through your browser settings, but this may affect the functionality of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Third-Party Services</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">Our service integrates with:</p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li><strong>Supabase:</strong> Authentication and database hosting</li>
              <li><strong>PostHog:</strong> Analytics and product insights</li>
              <li><strong>Instagram:</strong> Direct message platform (via official API and cookies)</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Data Retention</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Delete your account information within 30 days</li>
              <li>Remove all Instagram session data</li>
              <li>Delete all messages and conversations</li>
              <li>Retain anonymized analytics data for service improvement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
            <p className="text-foreground-muted leading-relaxed">
              Our service is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. International Data Transfers</h2>
            <p className="text-foreground-muted leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Policy</h2>
            <p className="text-foreground-muted leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. You are advised to review this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
            <p className="text-foreground-muted leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-background-elevated rounded-lg p-6 border border-border">
              <p className="text-foreground-muted">
                <strong className="text-foreground">Email:</strong> privacy@bulkdm.com
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
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Bulk<span className="text-accent">DM</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2024 BulkDM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

