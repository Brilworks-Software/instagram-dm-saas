'use client';

import { useState } from 'react';
import { Sparkles, Flame, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'number';
  required?: boolean;
}

interface GenericToolFormProps {
  toolSlug: string;
  toolName: string;
  heroTitle: string;
  heroDescription: string;
  heroGradient?: string;
  heroBorder?: string;
  fields: FormField[];
  usageCount?: number;
  seoKeywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export function GenericToolForm({ 
  toolSlug, 
  toolName, 
  heroTitle,
  heroDescription,
  heroGradient = 'from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20',
  heroBorder = 'border-purple-200 dark:border-purple-800',
  fields, 
  usageCount = 0,
  seoKeywords = [],
  seoTitle = '',
  seoDescription = ''
}: GenericToolFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);

    try {
      // Get client IP
      let clientIp: string | null = null;
      let ipInfo: { city?: string; region?: string; country_name?: string } | null = null;

      try {
        const ipResp = await fetch('https://api.ipify.org?format=json');
        if (ipResp.ok) {
          const ipData = await ipResp.json();
          clientIp = ipData.ip;
        }

        if (clientIp) {
          const geoResp = await fetch(`https://ipapi.co/${clientIp}/json/`);
          if (geoResp.ok) {
            const geoData = await geoResp.json();
            ipInfo = {
              city: geoData.city,
              region: geoData.region,
              country_name: geoData.country_name,
            };
          }
        }
      } catch {
        // Best-effort only
      }

      const response = await fetch('/api/tools/generic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug,
          formData,
          clientIp,
          ipInfo,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || 'Failed to submit');
        setIsLoading(false);
        return;
      }

      // Store the results from the API response
      setResults(data.result || data);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="space-y-6 mb-8">
      {/* SEO Hidden Content */}
      {(seoKeywords.length > 0 || seoTitle || seoDescription) && (
        <div className="sr-only" aria-hidden="true">
          {seoTitle && <h1>{seoTitle}</h1>}
          {seoDescription && <p>{seoDescription}</p>}
          {seoKeywords.length > 0 && (
            <meta name="keywords" content={seoKeywords.join(', ')} />
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className={`rounded-2xl bg-gradient-to-br ${heroGradient} p-8 border ${heroBorder}`}>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {heroTitle}
        </h2>
        <p className="text-foreground-muted leading-relaxed">
          {heroDescription}
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-6 space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-foreground mb-2">
                {index + 1}. {field.label}
              </label>
              <Input
                id={field.id}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full"
                required={field.required !== false}
              />
            </div>
          ))}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Submit
            </>
          )}
        </Button>

        {usageCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>Used <strong className="text-orange-600 dark:text-orange-400">{usageCount}</strong> times today.</span>
          </div>
        )}
      </form>

      {/* Results Display */}
      {results && !results.error && (
        <div className="rounded-xl border border-accent/30 bg-background-elevated p-6 space-y-4 animate-slide-up">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Results
          </h3>
          
          {/* Caption Generator Results */}
          {results.captions && Array.isArray(results.captions) && (
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Generated Captions ({results.count}):</h4>
              <div className="space-y-3">
                {results.captions.map((caption: string, i: number) => (
                  <div key={i} className="p-4 bg-background rounded-lg border border-border hover:border-accent/50 transition-all group">
                    <p className="text-sm text-foreground mb-2">{caption}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(caption);
                        alert('Caption copied to clipboard!');
                      }}
                      className="text-xs text-accent hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Generator Results */}
          {results.hashtags && Array.isArray(results.hashtags) && (
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Generated Hashtags ({results.count}):</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {results.hashtags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-background rounded-lg border border-border text-sm cursor-pointer hover:bg-accent/10 hover:border-accent/50 transition-all"
                    onClick={() => {
                      navigator.clipboard.writeText(tag);
                    }}
                    title="Click to copy"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(results.hashtags.join(' '));
                  alert('All hashtags copied to clipboard!');
                }}
                className="text-sm text-accent hover:underline font-medium"
              >
                Copy All Hashtags
              </button>
            </div>
          )}

          {/* Content Ideas Results */}
          {results.ideas && Array.isArray(results.ideas) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">💡 Content Ideas ({results.count})</h4>
                {results.niche && (
                  <span className="text-xs text-foreground-muted">For: {results.niche}</span>
                )}
              </div>
              <div className="grid gap-3">
                {results.ideas.map((idea: string, i: number) => (
                  <div 
                    key={i} 
                    className="group p-4 bg-gradient-to-br from-background to-background-elevated rounded-lg border border-border hover:border-accent/50 transition-all cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(idea);
                      alert('Idea copied to clipboard!');
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="flex-1 text-sm text-foreground font-medium">{idea}</p>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-accent hover:underline">
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-xs text-foreground-muted">
                  💡 <strong>Tip:</strong> Click any idea to copy it. Mix and match these with your unique style!
                </p>
              </div>
            </div>
          )}

          {/* Fake Follower Checker Results */}
          {results.fakeFollowerPercentage !== undefined && (
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Analysis Results for @{results.username}</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-foreground-muted mb-1">Fake Followers</p>
                  <p className="text-3xl font-bold text-red-500">{results.fakeFollowerPercentage}%</p>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-foreground-muted mb-1">Total Followers</p>
                  <p className="text-3xl font-bold text-foreground">{results.followerCount?.toLocaleString()}</p>
                </div>
              </div>
              {results.insights && Array.isArray(results.insights) && (
                <div className="p-4 bg-background-secondary rounded-lg border border-border">
                  <p className="text-xs font-semibold text-foreground-muted mb-2">Insights:</p>
                  <ul className="space-y-1">
                    {results.insights.map((insight: string, i: number) => (
                      <li key={i} className="text-xs text-foreground-muted">• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Engagement Calculator Results (Direct Calculation) */}
          {results.engagementRate && results.engagementRateValue !== undefined && (
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Your Engagement Rate</h4>
              <div className="p-8 bg-background rounded-lg border border-border text-center space-y-6">
                <div>
                  <p className="text-sm text-foreground-muted mb-2">Engagement Rate</p>
                  <p className="text-6xl font-bold text-accent mb-3">{results.engagementRate}</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    results.qualityColor === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    results.qualityColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    results.qualityColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    <span className="font-semibold text-sm">{results.quality}</span>
                  </div>
                </div>
                
                {results.description && (
                  <div className="bg-background-secondary p-4 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">{results.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-foreground-muted mb-1 text-xs">Total Likes</p>
                    <p className="font-semibold text-lg">{results.likes}</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted mb-1 text-xs">Total Comments</p>
                    <p className="font-semibold text-lg">{results.comments}</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted mb-1 text-xs">Followers</p>
                    <p className="font-semibold text-lg">{results.followers}</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted mb-1 text-xs">Total Engagement</p>
                    <p className="font-semibold text-lg">{results.totalEngagement}</p>
                  </div>
                </div>
              </div>
              
              {/* Info Box */}
              <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground-muted mb-2">
                  <strong className="text-foreground">📊 How is this calculated?</strong>
                </p>
                <p className="text-xs text-foreground-muted">
                  Engagement Rate = (Total Likes + Total Comments) ÷ Followers × 100
                </p>
                <p className="text-xs text-foreground-muted mt-2">
                  <strong>Benchmarks:</strong> 1-3% is average, 3-5% is good, 5-10% is very good, 10%+ is excellent
                </p>
              </div>
            </div>
          )}

          {/* Engagement Rate Calculator Results (Profile-based) */}
          {results.postsAnalyzed && results.username && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h4 className="font-semibold mb-2 text-foreground">
                  Engagement Analysis for @{results.username}
                </h4>
                <p className="text-sm text-foreground-muted">
                  Based on {results.postsAnalyzed} most recent {results.contentType}
                </p>
              </div>

              {/* Main Engagement Rate */}
              <div className="p-8 bg-background rounded-lg border border-border text-center space-y-6">
                <div>
                  <p className="text-sm text-foreground-muted mb-2">Average Engagement Rate</p>
                  <p className="text-6xl font-bold text-accent mb-3">{results.engagementRate}</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    results.qualityColor === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    results.qualityColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    results.qualityColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    <span className="font-semibold text-sm">{results.quality}</span>
                  </div>
                </div>
                
                {results.description && (
                  <div className="bg-background-secondary p-4 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">{results.description}</p>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-foreground-muted mb-1">Avg Likes</p>
                  <p className="text-2xl font-bold text-foreground">{results.avgLikes}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-foreground-muted mb-1">Avg Comments</p>
                  <p className="text-2xl font-bold text-foreground">{results.avgComments}</p>
                </div>
                {results.avgViews && (
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-xs text-foreground-muted mb-1">Avg Views</p>
                    <p className="text-2xl font-bold text-foreground">{results.avgViews}</p>
                  </div>
                )}
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-foreground-muted mb-1">Total Likes</p>
                  <p className="text-2xl font-bold text-foreground">{results.totalLikes}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-foreground-muted mb-1">Total Comments</p>
                  <p className="text-2xl font-bold text-foreground">{results.totalComments}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-foreground-muted mb-1">Followers</p>
                  <p className="text-2xl font-bold text-foreground">{results.followerCount?.toLocaleString()}</p>
                </div>
              </div>

              {/* Individual Posts */}
              {results.posts && results.posts.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-3 text-foreground">Analyzed {results.contentType}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.posts.map((post: any, i: number) => (
                      <a
                        key={i}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-lg border border-border bg-background hover:border-accent/50 transition-all overflow-hidden"
                      >
                        {post.thumbnailUrl && (
                          <div className="relative aspect-square overflow-hidden bg-background-secondary">
                            <img 
                              src={post.thumbnailUrl} 
                              alt={`Post ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-center justify-between text-xs text-foreground-muted mb-2">
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                            {post.views > 0 && <span>👁️ {post.views.toLocaleString()}</span>}
                          </div>
                          {post.caption && (
                            <p className="text-xs text-foreground-muted line-clamp-2">
                              {post.caption}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground-muted mb-2">
                  <strong className="text-foreground">📊 How is this calculated?</strong>
                </p>
                <p className="text-xs text-foreground-muted">
                  We analyze the last {results.postsAnalyzed} {results.contentType} to calculate average engagement. 
                  Engagement Rate = (Avg Likes + Avg Comments) ÷ Followers × 100
                </p>
                <p className="text-xs text-foreground-muted mt-2">
                  <strong>Benchmarks:</strong> 1-3% is average, 3-5% is good, 5-10% is very good, 10%+ is excellent
                </p>
              </div>
            </div>
          )}

          {/* Ratio Calculator Results */}
          {results.ratio !== undefined && (
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Follower-to-Following Ratio</h4>
              <div className="p-6 bg-background rounded-lg border border-border text-center space-y-4">
                <div>
                  <p className="text-sm text-foreground-muted mb-2">Your Ratio</p>
                  <p className="text-5xl font-bold text-accent mb-2">{results.ratioFormatted || results.ratio}</p>
                  <p className="text-sm font-medium text-foreground-muted mb-4">{results.status}</p>
                </div>
                
                {results.description && (
                  <div className="bg-background-secondary p-4 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">{results.description}</p>
                  </div>
                )}
                
                <div className="flex justify-center gap-8 text-sm pt-4 border-t border-border">
                  <div>
                    <p className="text-foreground-muted mb-1">Followers</p>
                    <p className="font-semibold text-lg">{results.followers?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted mb-1">Following</p>
                    <p className="font-semibold text-lg">{results.following?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMV Calculator Results */}
          {results.emv && (
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Earned Media Value (EMV)</h4>
              <div className="p-6 bg-background rounded-lg border border-border space-y-6">
                <div className="text-center">
                  <p className="text-sm text-foreground-muted mb-2">Per Post Value</p>
                  <p className="text-5xl font-bold text-accent mb-1">{results.estimatedValue}</p>
                  <p className="text-sm text-foreground-muted">Estimated Earned Media Value</p>
                </div>
                
                {results.description && (
                  <div className="bg-background-secondary p-4 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">{results.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background-secondary rounded-lg">
                    <p className="text-xs text-foreground-muted mb-1">Monthly Value</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{results.monthlyValue || `$${(parseFloat(results.emv) * 20).toFixed(2)}`}</p>
                    <p className="text-xs text-foreground-muted mt-1">~20 posts/month</p>
                  </div>
                  <div className="text-center p-4 bg-background-secondary rounded-lg">
                    <p className="text-xs text-foreground-muted mb-1">Est. Engagements</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{results.estimatedEngagements || Math.round(results.followers * (results.engagementRate / 100)).toLocaleString()}</p>
                    <p className="text-xs text-foreground-muted mt-1">per post</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-8 text-sm pt-4 border-t border-border">
                  <div>
                    <p className="text-foreground-muted mb-1">Followers</p>
                    <p className="font-semibold text-lg">{results.followers?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted mb-1">Engagement Rate</p>
                    <p className="font-semibold text-lg">{results.engagementRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reels Downloader Results */}
          {results.videoUrl && results.success && (
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Reel Ready to Download</h4>
              <div className="space-y-4">
                {/* Thumbnail Preview */}
                {results.thumbnailUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img 
                      src={results.thumbnailUrl} 
                      alt="Reel thumbnail" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                )}
                
                {/* Reel Info */}
                <div className="p-4 bg-background rounded-lg border border-border">
                  {results.username && (
                    <p className="text-sm text-foreground-muted mb-1">
                      <span className="font-semibold">Creator:</span> @{results.username}
                    </p>
                  )}
                  {results.caption && (
                    <p className="text-sm text-foreground mt-2 mb-2">{results.caption}</p>
                  )}
                  <div className="flex gap-4 text-xs text-foreground-muted mt-3">
                    {results.likeCount !== undefined && (
                      <span>❤️ {results.likeCount.toLocaleString()} likes</span>
                    )}
                    {results.commentCount !== undefined && (
                      <span>💬 {results.commentCount.toLocaleString()} comments</span>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <a
                  href={results.downloadUrl}
                  download
                  className="block w-full text-center px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <ArrowRight className="inline-block h-5 w-5 mr-2" />
                  Download Reel (MP4)
                </a>

                {/* Direct Video URL (for advanced users) */}
                <details className="mt-4">
                  <summary className="text-sm text-foreground-muted cursor-pointer hover:text-foreground">
                    Show Direct Video URL
                  </summary>
                  <div className="mt-2 p-3 bg-background-secondary rounded border border-border">
                    <p className="text-xs text-foreground-muted mb-2 break-all">{results.videoUrl}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(results.videoUrl);
                        alert('Video URL copied to clipboard!');
                      }}
                      className="text-xs text-accent hover:underline"
                    >
                      Copy URL
                    </button>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Likes-to-Followers Ratio Results */}
          {results.percentage && results.ratio !== undefined && (
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Likes-to-Followers Ratio</h4>
              <div className="p-6 bg-background rounded-lg border border-border text-center">
                <p className="text-5xl font-bold text-accent mb-2">{results.percentage}</p>
                <p className="text-sm text-foreground-muted mb-4">{results.status}</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-foreground-muted">Likes: </span>
                    <span className="font-semibold">{results.likes?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Followers: </span>
                    <span className="font-semibold">{results.followers?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {results?.error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                {results.error}
              </p>
              {results.message && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  {results.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message (when no results) */}
      {showSuccess && !results && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Success!</h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                {results?.message || "Your request has been submitted successfully. We're processing your information."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl border border-border bg-background-secondary p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          How It Works
        </h3>
        <ul className="space-y-2 text-sm text-foreground-muted">
          <li className="flex items-start gap-2">
            <span className="text-accent font-semibold mt-0.5">1.</span>
            <span>Fill out the form above with your information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-semibold mt-0.5">2.</span>
            <span>Our AI analyzes your data and matches it with relevant opportunities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-semibold mt-0.5">3.</span>
            <span>Get personalized recommendations tailored to your profile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-semibold mt-0.5">4.</span>
            <span>100% free with no login required</span>
          </li>
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/signup"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-accent bg-accent hover:bg-accent/90 text-white px-6 py-4 font-semibold transition-all"
        >
          <Sparkles className="h-5 w-5" />
          Get Started Free
          <ArrowRight className="h-5 w-5" />
        </a>
        <a
          href="/docs"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-border hover:border-accent bg-background hover:bg-background-secondary text-foreground px-6 py-4 font-semibold transition-all"
        >
          <FileText className="h-5 w-5" />
          Read Documentation
        </a>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        
        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">What is {toolName}?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            {toolName} is an advanced AI-powered tool designed to help you optimize your Instagram presence. It analyzes your profile data and provides personalized recommendations to help you grow your audience and engagement.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How do I use this tool?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Simply fill out the form above with your information and click Submit. Our AI will analyze your data and provide you with personalized insights and recommendations. No login or registration required!
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">Is this tool free to use?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Yes! This tool is completely free to use with no hidden fees. You don't even need to create an account or log in to access it.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How accurate are the results?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            Our AI uses advanced algorithms and real-time data to provide accurate and up-to-date insights. While results may vary based on your specific situation, our tool is designed to give you the most reliable information possible.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">Do I need an Instagram account to use this?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            While having an Instagram account helps you get the most personalized results, you can still use this tool to explore opportunities and understand the platform better even without an account.
          </p>
        </details>

        <details className="group rounded-xl border border-border bg-background p-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-semibold text-foreground">How often should I use this tool?</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-foreground-muted">
            We recommend using this tool regularly to track your growth and discover new opportunities. Monthly checks can help you stay on top of trends and adjust your strategy accordingly.
          </p>
        </details>
      </div>

      {/* Related Instagram Tools */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Related Instagram Tools</h2>
          <a href="/tools" className="text-sm text-accent hover:underline flex items-center gap-1">
            See all Instagram tools
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool Card 1 - Fake Follower Checker */}
          <a href="/tools/fake-follower-checker" className="group rounded-xl border border-border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Analytics</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Fake Follower Checker</h3>
            <p className="text-sm text-foreground-muted mb-4">Estimate follower quality and spot potential bots or suspicious patterns.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">Free</span>
            </div>
          </a>

          {/* Tool Card 2 - Caption Generator */}
          <a href="/tools/caption-generator" className="group rounded-xl border border-border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Content</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Caption Generator</h3>
            <p className="text-sm text-foreground-muted mb-4">Generate captions optimized for engagement and your brand voice.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded">AI</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">Free</span>
            </div>
          </a>

          {/* Tool Card 3 - Content Ideas Generator */}
          <a href="/tools/content-ideas-generator" className="group rounded-xl border border-border bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-6 hover:border-accent transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded">Content</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Content Ideas Generator</h3>
            <p className="text-sm text-foreground-muted mb-4">Get fresh content ideas for posts, stories, and Reels based on your niche.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-1 rounded">AI</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">Free</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
