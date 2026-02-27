import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | SocialOra",
  description:
    "Read the official Terms and Conditions for using SocialOra platform and services.",
  keywords: [
    "SocialOra terms and conditions",
    "SaaS terms of service",
    "Instagram automation terms",
    "user agreement",
    "SocialOra legal policy",
  ],
  openGraph: {
    title: "Terms and Conditions | SocialOra",
    description:
      "Read the official Terms and Conditions for using SocialOra platform and services.",
    type: "website",
  },
  alternates: {
    canonical: "/terms",
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
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms and Conditions
          </h1>
          <p className="text-foreground-muted mb-8">
            Effective Date: February 26, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Eligibility
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              You must be at least 18 years old to use SocialOra. By using the
              Service, you confirm that:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mt-4">
              <li>
                You are legally capable of entering into a binding agreement.
              </li>
              <li>You will comply with all applicable laws and regulations.</li>
              <li>
                You will comply with Instagram’s Terms of Service and platform
                policies.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Description of Service
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              SocialOra provides tools for:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mt-4">
              <li>Instagram account connection via browser extension</li>
              <li>Lead generation from public Instagram accounts</li>
              <li>Campaign creation and message automation</li>
              <li>Inbox and conversation management</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed mt-4">
              SocialOra does not store your Instagram password. Account
              connection is performed using a browser session through the Chrome
              extension. We reserve the right to modify, suspend, or discontinue
              any part of the Service at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. User Responsibilities
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              You agree that you will:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mt-4">
              <li>Use the Service only for lawful purposes</li>
              <li>
                Not use the platform to send spam, harassment, or abusive
                messages
              </li>
              <li>
                Not engage in fraudulent, misleading, or harmful activities
              </li>
              <li>Not attempt to reverse engineer or misuse the platform</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed mt-4">
              You are fully responsible for your Instagram account activity,
              messages sent through automation, and compliance with Instagram
              policies. SocialOra is not responsible for account restrictions,
              blocks, or bans resulting from misuse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Instagram Compliance
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              SocialOra is not affiliated with Instagram. You acknowledge that
              Instagram may update its policies at any time. Automation carries
              inherent risk and you use the Service at your own discretion. If
              Instagram restricts your account, SocialOra is not liable for any
              loss, suspension, or damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Account Security
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              You are responsible for maintaining the confidentiality of your
              account login, securing your browser and extension access, and
              immediately notifying us of unauthorized use. We are not
              responsible for damages resulting from unauthorized access caused
              by your negligence.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Payments and Subscriptions
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              If you purchase a paid plan:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mt-4">
              <li>You agree to pay all fees listed at the time of purchase.</li>
              <li>Subscriptions may renew automatically unless canceled.</li>
              <li>Fees are non-refundable unless stated otherwise.</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed mt-4">
              We reserve the right to change pricing at any time. Changes will
              not affect active billing periods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Refund Policy
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              Unless explicitly stated, all purchases are final. Refunds may be
              granted at our sole discretion. For refund inquiries, contact our
              support team.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Acceptable Use Policy
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              You may not use SocialOra to:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mt-4">
              <li>Send bulk unsolicited spam</li>
              <li>Promote illegal products or services</li>
              <li>Harass or threaten individuals</li>
              <li>Violate intellectual property rights</li>
              <li>Collect private data unlawfully</li>
            </ul>
            <p className="text-foreground-muted leading-relaxed mt-4">
              Violation may result in immediate suspension or termination.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Intellectual Property
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              All content, branding, design, and technology related to SocialOra
              are owned by SocialOra. You may not copy or reproduce platform
              code, resell or redistribute the Service, or use our branding
              without written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              To the maximum extent permitted by law, SocialOra shall not be
              liable for Instagram account bans or restrictions, loss of data,
              loss of business or revenue, or indirect or consequential damages.
              The Service is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Termination
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              We may suspend or terminate your access if you violate these
              Terms, misuse the platform, or as required by law. You may stop
              using the Service at any time. Termination does not waive
              outstanding payment obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Privacy
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              Your use of SocialOra is also governed by our Privacy Policy. We
              collect and process data as described in that policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              13. Third-Party Services
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              SocialOra interacts with third-party platforms including
              Instagram. We are not responsible for third-party service changes,
              API limitations, or platform policy updates.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              14. Modifications to Terms
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              We may update these Terms at any time. Changes become effective
              upon posting on this page. Continued use of the Service
              constitutes acceptance of updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              15. Governing Law
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              These Terms shall be governed by and interpreted in accordance
              with the laws applicable in your jurisdiction unless otherwise
              required by law. Any disputes shall be resolved in the appropriate
              courts of that jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              16. Contact Information
            </h2>
            <p className="text-foreground-muted leading-relaxed">
              If you have questions regarding these Terms, contact us at{" "}
              <a
                href="mailto:support@socialora.app"
                className="text-accent hover:underline"
              >
                support@socialora.app
              </a>
              .
            </p>
            <p className="text-foreground-muted mt-4">
              By using SocialOra, you acknowledge that you have read,
              understood, and agreed to these Terms and Conditions.
            </p>
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
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </Link>
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
