import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Instagram, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getToolBySlug, instagramTools } from '../_data/tools';

const BrandInfluencerMatcher = dynamic(
  () => import('@/components/tools/brand-influencer-matcher').then((m) => m.BrandInfluencerMatcher),
  { ssr: false }
);

const AiMatchmaker = dynamic(
  () => import('@/components/tools/ai-matchmaker').then((m) => m.AiMatchmaker),
  { ssr: false }
);

const AdsSpyTool = dynamic(
  () => import('@/components/tools/ads-spy-tool').then((m) => m.AdsSpyTool),
  { ssr: false }
);

const FakeFollowerChecker = dynamic(
  () => import('@/components/tools/fake-follower-checker').then((m) => m.FakeFollowerChecker),
  { ssr: false }
);

const CaptionGenerator = dynamic(
  () => import('@/components/tools/caption-generator').then((m) => m.CaptionGenerator),
  { ssr: false }
);

const ContentIdeasGenerator = dynamic(
  () => import('@/components/tools/content-ideas-generator').then((m) => m.ContentIdeasGenerator),
  { ssr: false }
);

const EMVCalculator = dynamic(
  () => import('@/components/tools/emv-calculator').then((m) => m.EMVCalculator),
  { ssr: false }
);

const EngagementCalculator = dynamic(
  () => import('@/components/tools/engagement-calculator').then((m) => m.EngagementCalculator),
  { ssr: false }
);

const EngagementRateCalculator = dynamic(
  () => import('@/components/tools/engagement-rate-calculator').then((m) => m.EngagementRateCalculator),
  { ssr: false }
);

const FollowerTracker = dynamic(
  () => import('@/components/tools/follower-tracker').then((m) => m.FollowerTracker),
  { ssr: false }
);

const RatioCalculator = dynamic(
  () => import('@/components/tools/ratio-calculator').then((m) => m.RatioCalculator),
  { ssr: false }
);

const FancyFontsGenerator = dynamic(
  () => import('@/components/tools/fancy-fonts-generator').then((m) => m.FancyFontsGenerator),
  { ssr: false }
);

const AiHashtagGenerator = dynamic(
  () => import('@/components/tools/ai-hashtag-generator').then((m) => m.AiHashtagGenerator),
  { ssr: false }
);

const TrendingHashtags = dynamic(
  () => import('@/components/tools/trending-hashtags').then((m) => m.TrendingHashtags),
  { ssr: false }
);

const AnonymousHighlightViewer = dynamic(
  () => import('@/components/tools/anonymous-highlight-viewer').then((m) => m.AnonymousHighlightViewer),
  { ssr: false }
);

const InfluencerComparison = dynamic(
  () => import('@/components/tools/influencer-comparison').then((m) => m.InfluencerComparison),
  { ssr: false }
);

const InfluencerPricingCalculator = dynamic(
  () => import('@/components/tools/influencer-pricing-calculator').then((m) => m.InfluencerPricingCalculator),
  { ssr: false }
);

const InfluencerSearch = dynamic(
  () => import('@/components/tools/influencer-search').then((m) => m.InfluencerSearch),
  { ssr: false }
);

const InstagramMoneyCalculator = dynamic(
  () => import('@/components/tools/instagram-money-calculator').then((m) => m.InstagramMoneyCalculator),
  { ssr: false }
);

const InstagramPhotoDownloader = dynamic(
  () => import('@/components/tools/instagram-photo-downloader').then((m) => m.InstagramPhotoDownloader),
  { ssr: false }
);

const InstagramReelsDownloader = dynamic(
  () => import('@/components/tools/instagram-reels-downloader').then((m) => m.InstagramReelsDownloader),
  { ssr: false }
);

const AnonymousStoryViewer = dynamic(
  () => import('@/components/tools/anonymous-story-viewer').then((m) => m.AnonymousStoryViewer),
  { ssr: false }
);

const UsernameChecker = dynamic(
  () => import('@/components/tools/username-checker').then((m) => m.UsernameChecker),
  { ssr: false }
);

const WebViewer = dynamic(
  () => import('@/components/tools/web-viewer').then((m) => m.WebViewer),
  { ssr: false }
);

const LocalInfluencerSearch = dynamic(
  () => import('@/components/tools/local-influencer-search').then((m) => m.LocalInfluencerSearch),
  { ssr: false }
);

const NicheInfluencerSearch = dynamic(
  () => import('@/components/tools/niche-influencer-search').then((m) => m.NicheInfluencerSearch),
  { ssr: false }
);

const LikesFollowersRatio = dynamic(
  () => import('@/components/tools/likes-followers-ratio').then((m) => m.LikesFollowersRatio),
  { ssr: false }
);

const LookalikeFinder = dynamic(
  () => import('@/components/tools/lookalike-finder').then((m) => m.LookalikeFinder),
  { ssr: false }
);

const MetricsQuiz = dynamic(
  () => import('@/components/tools/metrics-quiz').then((m) => m.MetricsQuiz),
  { ssr: false }
);

export async function generateStaticParams() {
  return instagramTools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return { title: 'Tool Not Found | Socialora' };
  }

  return {
    title: `${tool.title} | Socialora Tools`,
    description: tool.description,
    openGraph: {
      title: `${tool.title} | Socialora Tools`,
      description: tool.description,
      type: 'website',
    },
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const toolUi = (() => {
    switch (tool.slug) {
      case 'ai-brand-influencer-matcher':
        return <BrandInfluencerMatcher />;
      case 'ai-product-matchmaker':
        return <AiMatchmaker />;
      case 'instagram-ads-spy':
        return <AdsSpyTool />;
      case 'fake-follower-checker':
        return <FakeFollowerChecker />;
      case 'caption-generator':
        return <CaptionGenerator />;
      case 'content-ideas-generator':
        return <ContentIdeasGenerator />;
      case 'emv-calculator':
        return <EMVCalculator />;
      case 'engagement-calculator':
        return <EngagementCalculator />;
      case 'engagement-rate-calculator':
        return <EngagementRateCalculator />;
      case 'follower-tracker':
        return <FollowerTracker />;
      case 'ratio-calculator':
        return <RatioCalculator />;
      case 'fancy-fonts-generator':
        return <FancyFontsGenerator />;
      case 'ai-hashtag-generator':
        return <AiHashtagGenerator />;
      case 'trending-hashtags-country':
        return <TrendingHashtags />;
      case 'anonymous-highlight-viewer':
        return <AnonymousHighlightViewer />;
      case 'influencer-comparison':
        return <InfluencerComparison />;
      case 'influencer-pricing-calculator':
        return <InfluencerPricingCalculator />;
      case 'influencer-search':
        return <InfluencerSearch />;
      case 'likes-followers-ratio':
        return <LikesFollowersRatio />;
      case 'lookalike-finder':
        return <LookalikeFinder />;
      case 'metrics-quiz':
        return <MetricsQuiz />;
      case 'instagram-money-calculator':
        return <InstagramMoneyCalculator />;
      case 'instagram-photo-downloader':
        return <InstagramPhotoDownloader />;
      case 'instagram-reels-downloader':
        return <InstagramReelsDownloader />;
      case 'anonymous-story-viewer':
        return <AnonymousStoryViewer />;
      case 'username-checker':
        return <UsernameChecker />;
      case 'web-viewer':
        return <WebViewer />;
      case 'local-influencer-search':
        return <LocalInfluencerSearch />;
      case 'niche-influencer-search':
        return <NicheInfluencerSearch />;
      default:
        return (
          <div className="rounded-xl border border-border bg-background-secondary p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="font-medium text-foreground">Tool UI placeholder</p>
            </div>
            <p className="text-sm text-foreground-muted">
              This is the UI shell for the tool. If you want, tell me which tool(s) should be functional first and what inputs/outputs you want.
            </p>
          </div>
        );
    }
  })();

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
              <span className="font-bold text-lg">
                Social<span className="text-accent">ora</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/tools">
                <Button variant="ghost" size="sm">
                  Tools
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  Blog
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/tools">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
        </Link>

        <div className="bg-background-elevated rounded-2xl border border-border p-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="accent">{tool.category}</Badge>
            {(tool.badges || []).slice(0, 2).map((b) => (
              <Badge key={b} variant="default">
                {b}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{tool.title}</h1>
          <p className="text-foreground-muted text-lg leading-relaxed mb-8">{tool.description}</p>

          {toolUi}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup">
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg">
                Read Docs
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Link href="/tools" className="hover:text-foreground transition-colors">
                Tools
              </Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
            <p className="text-sm text-foreground-muted">© 2025 Socialora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


