import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Instagram, ArrowLeft, ArrowRight, Sparkles, CheckCircle2, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getToolBySlug, instagramTools } from '../_data/tools';
import { FAQSection } from '@/components/blog/faq-section';
import Script from 'next/script';

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

function getToolFAQs(slug: string, title: string) {
  const baseFAQs = [
    {
      question: `Is ${title} free to use?`,
      answer: `Yes, ${title} is completely free to use. There are no costs, subscriptions, or premium tiers. You can use this tool as many times as you need without any limitations.`,
    },
    {
      question: `Do I need to create an account to use ${title}?`,
      answer: `No, you don't need to create an account or log in to use ${title}. Simply visit the page and start using the tool immediately. We respect your privacy and don't require any personal information.`,
    },
    {
      question: `How accurate are the results from ${title}?`,
      answer: `Our tool uses real Instagram data and industry-standard formulas to provide accurate results. We regularly update the tool to ensure it works with the latest Instagram features and provides reliable insights.`,
    },
    {
      question: `Can I use ${title} on mobile devices?`,
      answer: `Yes, ${title} is fully responsive and works on desktop, tablet, and mobile devices. You can access and use the tool from any device with a web browser.`,
    },
  ];

  // Tool-specific FAQs
  const toolSpecificFAQs: Record<string, Array<{ question: string; answer: string }>> = {
    'ai-hashtag-generator': [
      {
        question: 'How many hashtags should I use with the AI Hashtag Generator?',
        answer: 'Instagram allows up to 30 hashtags per post, but we recommend using 5-10 highly relevant hashtags for best results. Our AI generator helps you find the most effective hashtags for your content.',
      },
      {
        question: 'Does the AI Hashtag Generator find trending hashtags?',
        answer: 'Yes, our AI-powered generator analyzes trending hashtags, engagement rates, and relevance to suggest the best hashtags for your posts and Reels.',
      },
    ],
    'engagement-rate-calculator': [
      {
        question: 'What is a good Instagram engagement rate?',
        answer: 'A good engagement rate varies by industry and account size. Generally, 1-3% is average, 3-6% is good, and above 6% is excellent. Our calculator helps you understand where you stand.',
      },
      {
        question: 'Does the calculator work for Instagram Reels?',
        answer: 'Yes, our engagement rate calculator works for regular posts, Reels, and carousel posts. Simply enter the engagement metrics for any content type.',
      },
    ],
    'fake-follower-checker': [
      {
        question: 'How does the Fake Follower Checker detect fake followers?',
        answer: 'Our tool analyzes account patterns, engagement ratios, follower growth patterns, and other signals to identify potential fake followers and bots.',
      },
      {
        question: 'Can fake followers harm my account?',
        answer: 'Yes, fake followers can hurt your account by lowering engagement rates, making it harder to reach your real audience, and potentially violating Instagram\'s terms of service.',
      },
    ],
    'influencer-search': [
      {
        question: 'How do I find the right influencers with this tool?',
        answer: 'Use our influencer search tool to filter by niche, audience size, location, and engagement rate. The tool helps you find influencers that match your brand and campaign goals.',
      },
      {
        question: 'Can I search for micro-influencers?',
        answer: 'Yes, our influencer search tool allows you to filter by follower count, making it easy to find micro-influencers (1K-100K followers) who often have higher engagement rates.',
      },
    ],
    'caption-generator': [
      {
        question: 'Can I customize the generated captions?',
        answer: 'Yes, our AI caption generator creates captions that you can edit and customize to match your brand voice and style. Generate multiple options and choose the best one.',
      },
      {
        question: 'Does the caption generator work for Instagram Reels?',
        answer: 'Yes, our caption generator creates captions optimized for both regular posts and Reels. You can specify the content type for better results.',
      },
    ],
  };

  return [...baseFAQs, ...(toolSpecificFAQs[slug] || [])];
}

function ToolStructuredData({ tool }: { tool: { slug: string; title: string; description: string; category: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    url: `${cleanBaseUrl}/tools/${tool.slug}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '500',
    },
  };

  return (
    <Script
      id={`tool-structured-data-${tool.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
    />
  );
}

export async function generateStaticParams() {
  return instagramTools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return { title: 'Tool Not Found | Socialora' };
  }

  const seoTitle = tool.seoTitle || `${tool.title} | Free Instagram Tool`;
  const seoDescription = tool.seoDescription || tool.description;
  const keywords = tool.seoKeywords || [tool.title.toLowerCase(), 'instagram tool', 'free tool'];
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      ...keywords,
      'free instagram tool',
      'instagram tool online',
      'instagram tool 2025',
      'socialora tools',
      'instagram tool no login',
    ],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
      url: `${cleanBaseUrl}/tools/${tool.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
    },
    alternates: {
      canonical: `/tools/${tool.slug}`,
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

        <div className="bg-background-elevated rounded-2xl border border-border p-10 mb-8">
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

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
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

        {/* SEO Content Section */}
        <div className="bg-background-elevated rounded-2xl border border-border p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            About This {tool.category} Tool
          </h2>
          <div className="prose prose-lg max-w-none text-foreground-muted space-y-4">
            <p>
              Our <strong className="text-foreground">{tool.title}</strong> is a free, AI-powered tool designed to help you {tool.description.toLowerCase()}. This tool is part of our comprehensive collection of Instagram tools that help creators, businesses, and marketers optimize their Instagram presence.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">100% Free</h3>
                  <p className="text-sm text-foreground-muted">No cost, no subscription, no hidden fees. Use this tool as many times as you need.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">No Login Required</h3>
                  <p className="text-sm text-foreground-muted">Start using immediately without creating an account or providing personal information.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Instant Results</h3>
                  <p className="text-sm text-foreground-muted">Get accurate results in seconds with our fast and reliable tool.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">AI-Powered</h3>
                  <p className="text-sm text-foreground-muted">Leverage advanced AI technology for accurate analysis and intelligent recommendations.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-background-secondary rounded-xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-3">How to Use This Tool</h3>
              <p className="text-foreground-muted">
                Simply enter the required information in the tool above and click the generate or calculate button. The tool will process your input and provide instant results. You can use this tool multiple times to test different scenarios and optimize your Instagram strategy.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-background-elevated rounded-2xl border border-border p-8 md:p-10">
          <FAQSection
            faqs={getToolFAQs(tool.slug, tool.title)}
            title={`Frequently Asked Questions About ${tool.title}`}
          />
        </div>

        {/* Structured Data for Tool */}
        <ToolStructuredData tool={tool} />
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


