'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Loader2, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface ReelData {
  videoUrl: string;
  shortcode: string;
  username?: string;
  caption?: string;
  thumbnailUrl?: string;
}

export function ReelDownloader() {
  const [reelUrl, setReelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reelData, setReelData] = useState<ReelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reelUrl.trim()) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    // STEP 2: Validate URL - Must contain /reel/
    if (!reelUrl.includes('instagram.com') || !reelUrl.includes('/reel/')) {
      setError('Please enter a valid Instagram reel URL (must contain /reel/)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReelData(null);

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

      // STEP 8: Fetch fresh every time (don't cache)
      const response = await fetch('/api/tools/reel-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reelUrl,
          clientIp,
          ipInfo,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reel');
      }

      // STEP 6: Receive videoUrl from backend
      setReelData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reelData?.videoUrl) return;

    // Use proxy endpoint to avoid CORS issues
    const proxyUrl = `/api/tools/reel-download/proxy?url=${encodeURIComponent(reelData.videoUrl)}`;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = `instagram-reel-${reelData.username}-${reelData.shortcode}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setReelUrl('');
    setReelData(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Input Form */}
      <div className="bg-background-elevated border border-border rounded-xl p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="https://www.instagram.com/reel/..."
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              disabled={isLoading}
              error={error || undefined}
              label="Instagram Reel URL"
              className="text-base"
            />
            <p className="text-xs text-foreground-muted mt-2">
              Paste the URL of an Instagram reel or video post
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading || !reelUrl.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching Reel...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Get Download Link
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Success Result */}
      {reelData && (
        <div className="mt-6 bg-background-elevated border border-border rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Reel Ready to Download!
              </h3>
              {reelData.username && (
                <p className="text-sm text-foreground-muted">
                  By @{reelData.username}
                </p>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div className="relative aspect-[9/16] max-h-[500px] bg-black rounded-lg overflow-hidden mb-4">
            {reelData.videoUrl ? (
              <>
                <video
                  className="w-full h-full object-contain"
                  controls
                  poster={reelData.thumbnailUrl}
                  preload="metadata"
                >
                  <source src={reelData.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </>
            ) : reelData.thumbnailUrl ? (
              <>
                <img
                  src={reelData.thumbnailUrl}
                  alt="Reel thumbnail"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Hide image on error
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-16 h-16 text-white opacity-80" />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Play className="w-16 h-16 text-white opacity-40" />
              </div>
            )}
          </div>

          {/* Caption */}
          {reelData.caption && (
            <div className="mb-4 p-3 bg-background rounded-lg">
              <p className="text-sm text-foreground line-clamp-3">
                {reelData.caption}
              </p>
            </div>
          )}

          {/* STEP 7: Download Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              <Download className="w-5 h-5" />
              Download Video
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="lg"
            >
              New Download
            </Button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-xs text-foreground-muted">
              <strong className="text-foreground">Note:</strong> This tool is for personal use only. 
              Please respect content creators' rights and Instagram's terms of service.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !reelData && (
        <div className="mt-6 bg-error/10 border border-error/20 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-error flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-error mb-1">
                Error
              </h3>
              <p className="text-sm text-foreground-muted">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How to Use Section */}
      <div className="mt-8 bg-background-elevated border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          How to Download Instagram Reels
        </h3>
        <ol className="space-y-3 text-sm text-foreground-muted">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent font-semibold flex items-center justify-center text-xs">
              1
            </span>
            <span>
              <strong className="text-foreground">Open Instagram</strong> and find the reel you want to download
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent font-semibold flex items-center justify-center text-xs">
              2
            </span>
            <span>
              <strong className="text-foreground">Copy the link</strong> by clicking the three dots (•••) and selecting "Copy link"
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent font-semibold flex items-center justify-center text-xs">
              3
            </span>
            <span>
              <strong className="text-foreground">Paste the URL</strong> in the input field above
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent font-semibold flex items-center justify-center text-xs">
              4
            </span>
            <span>
              <strong className="text-foreground">Click "Get Download Link"</strong> and wait a few seconds
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent font-semibold flex items-center justify-center text-xs">
              5
            </span>
            <span>
              <strong className="text-foreground">Download the video</strong> in high quality to your device
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
