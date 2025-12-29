import { Metadata } from 'next';
import { Download, Instagram, ArrowLeft, CheckCircle2, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReelDownloader } from '@/components/tools/reel-downloader';

export const metadata: Metadata = {
  title: 'Free Instagram Reel Downloader - Download Instagram Reels in HD',
  description: 'Download Instagram reels in high quality for free. Fast, secure, and easy to use. No watermarks, no login required. Save any public Instagram reel to your device.',
  keywords: [
    'instagram reel downloader',
    'download instagram reels',
    'instagram video downloader',
    'save instagram reels',
    'free reel downloader',
    'instagram downloader',
    'reel saver',
    'download reels online',
    'instagram video saver',
    'hd reel download',
  ],
  openGraph: {
    title: 'Free Instagram Reel Downloader - Download Reels in HD',
    description: 'Download Instagram reels in high quality. Fast, secure, and free. No watermarks or login required.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Instagram Reel Downloader',
    description: 'Download Instagram reels in high quality. Fast, secure, and free.',
  },
};

export default function ReelDownloaderPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">InstaDM</span>
            </Link>
            <Link href="/tools">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                All Tools
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
            <Download className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Free Instagram Tool</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Download Instagram Reels
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-500 mt-2">
              in High Quality
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto mb-8">
            Save any public Instagram reel to your device in seconds. Fast, secure, and completely free. 
            No watermarks, no login required.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-background-elevated border border-border rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-foreground-muted">HD Quality</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background-elevated border border-border rounded-full">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-foreground-muted">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background-elevated border border-border rounded-full">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-foreground-muted">100% Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Downloader Tool */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <ReelDownloader />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background-elevated border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Use Our Instagram Reel Downloader?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Easy to Use
              </h3>
              <p className="text-foreground-muted text-sm">
                Just paste the Instagram reel URL and click download. No complicated steps or technical knowledge required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                High Quality Downloads
              </h3>
              <p className="text-foreground-muted text-sm">
                Download reels in their original quality. Get crisp, clear videos without any compression or quality loss.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Safe & Private
              </h3>
              <p className="text-foreground-muted text-sm">
                Your privacy matters. We don't store your downloads or collect personal data. Everything happens securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group bg-background-elevated border border-border rounded-xl p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-foreground">
                Is this Instagram reel downloader free?
                <span className="text-foreground-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-foreground-muted text-sm">
                Yes! Our Instagram reel downloader is completely free to use. There are no hidden fees, 
                subscriptions, or premium features. Download as many reels as you want at no cost.
              </p>
            </details>

            <details className="group bg-background-elevated border border-border rounded-xl p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-foreground">
                Do I need to log in to Instagram?
                <span className="text-foreground-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-foreground-muted text-sm">
                No login required! Simply paste the reel URL and download. However, you can only download 
                public reels. Private account reels cannot be accessed without proper authorization.
              </p>
            </details>

            <details className="group bg-background-elevated border border-border rounded-xl p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-foreground">
                What quality are the downloaded reels?
                <span className="text-foreground-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-foreground-muted text-sm">
                We provide the highest quality available from Instagram. The downloaded video will be in 
                the same quality as the original reel posted by the creator, typically in HD.
              </p>
            </details>

            <details className="group bg-background-elevated border border-border rounded-xl p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-foreground">
                Can I download reels from private accounts?
                <span className="text-foreground-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-foreground-muted text-sm">
                No, our tool can only download reels from public Instagram accounts. Private account content 
                is protected by Instagram's privacy settings and cannot be accessed without permission.
              </p>
            </details>

            <details className="group bg-background-elevated border border-border rounded-xl p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-foreground">
                Is it legal to download Instagram reels?
                <span className="text-foreground-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-foreground-muted text-sm">
                Downloading reels for personal use is generally acceptable, but redistributing or using 
                them commercially without permission may violate copyright laws. Always respect content 
                creators' rights and Instagram's terms of service.
              </p>
            </details>

            <details className="group bg-background-elevated border border-border rounded-xl p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-foreground">
                Where are my downloaded reels saved?
                <span className="text-foreground-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-foreground-muted text-sm">
                Downloaded reels are saved to your device's default download folder (usually "Downloads"). 
                The exact location depends on your browser settings. You can change this in your browser 
                preferences if needed.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent/10 via-pink-500/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Need More Instagram Tools?
          </h2>
          <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
            Discover our powerful Instagram automation platform to manage DMs, automate outreach, 
            and grow your Instagram presence efficiently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tools">
              <Button variant="secondary" size="lg">
                Browse All Tools
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="lg">
                Try InstaDM Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-foreground-muted">
          <p>© 2025 InstaDM. All rights reserved.</p>
          <p className="mt-2">
            This tool is for personal use only. Please respect content creators' rights and 
            Instagram's terms of service.
          </p>
        </div>
      </footer>
    </div>
  );
}
