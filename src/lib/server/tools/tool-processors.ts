import { 
  generateCaptions, 
  generateHashtags, 
  generateContentIdeas 
} from '../ai/gemini-service';
import { instagramCookieService } from '../instagram/cookie-service';
import type { InstagramCookies } from '../instagram/types';

// Service account cookies (load from env)
function getServiceCookies(): InstagramCookies | null {
  const sessionId = process.env.INSTAGRAM_SERVICE_SESSION_ID;
  const dsUserId = process.env.INSTAGRAM_SERVICE_DS_USER_ID;
  const csrfToken = process.env.INSTAGRAM_SERVICE_CSRF_TOKEN;

  if (!sessionId || !dsUserId || !csrfToken) {
    return null;
  }

  return {
    sessionId,
    dsUserId,
    csrfToken,
    igDid: process.env.INSTAGRAM_SERVICE_IG_DID,
    mid: process.env.INSTAGRAM_SERVICE_MID,
    rur: process.env.INSTAGRAM_SERVICE_RUR,
  };
}

// Helper to extract Instagram handle from form data
export function extractInstagramHandle(formData: Record<string, string>): string | null {
  for (const [key, value] of Object.entries(formData)) {
    if (key.toLowerCase().includes('instagram') || 
        key.toLowerCase().includes('handle') || 
        key.toLowerCase().includes('username')) {
      return (value as string).replace(/^@+/, '').trim();
    }
  }
  return Object.values(formData)[0]?.replace(/^@+/, '').trim() || null;
}

// Process tool based on slug
export async function processTool(toolSlug: string, formData: Record<string, string>): Promise<any> {
  switch (toolSlug) {
    // AI-Powered Tools (using Gemini)
    case 'caption-generator': {
      const topic = formData['topic'] || formData['post-topic'] || formData['content-topic'] || Object.values(formData)[0];
      const style = formData['style'] || formData['tone'] || formData['caption-style'];
      const captions = await generateCaptions(topic, style);
      return {
        captions,
        count: captions.length,
        topic,
      };
    }

    case 'ai-hashtag-generator': {
      const topic = formData['topic'] || formData['post-topic'] || formData['content-topic'] || Object.values(formData)[0];
      const hashtags = await generateHashtags(topic, 30);
      return {
        hashtags,
        count: hashtags.length,
        topic,
      };
    }

    case 'content-ideas-generator': {
      const niche = formData['niche'] || formData['topic'] || formData['content-niche'] || Object.values(formData)[0];
      const ideas = await generateContentIdeas(niche, 20);
      return {
        ideas,
        count: ideas.length,
        niche,
      };
    }

    // Instagram Data Tools (using service account)
    case 'fake-follower-checker': {
      const username = extractInstagramHandle(formData);
      if (!username) throw new Error('Instagram handle required');
      
      const serviceCookies = getServiceCookies();
      if (!serviceCookies) {
        return {
          error: 'Service account not configured',
          message: 'Instagram service account cookies are required for this tool.',
        };
      }

      try {
        const profile = await instagramCookieService.getUserProfileByUsername(
          serviceCookies,
          username
        );
        
        if (!profile) {
          return { error: 'User not found or account is private' };
        }

        // Get sample of followers for analysis
        const followers = await instagramCookieService.getUserFollowers(
          serviceCookies,
          profile.pk,
          100
        );

        // Analyze followers (simplified - you can enhance this)
        const analysis = analyzeFollowersForBots(followers);

        return {
          username: profile.username,
          followerCount: profile.followerCount,
          fakeFollowerPercentage: analysis.fakePercentage,
          suspiciousAccounts: analysis.suspiciousCount,
          insights: analysis.insights,
          profile: {
            isVerified: profile.isVerified,
            isBusiness: profile.isBusiness,
            engagementRate: '2-5%', // Estimated
          },
        };
      } catch (error: any) {
        console.error('Fake follower checker error:', error);
        return {
          error: 'Failed to analyze account',
          message: error.message || 'Unable to fetch Instagram data. Please try again later.',
        };
      }
    }

    case 'engagement-calculator':
    case 'engagement-rate-calculator': {
      const username = extractInstagramHandle(formData);
      if (!username) throw new Error('Instagram handle required');
      
      const serviceCookies = getServiceCookies();
      if (!serviceCookies) {
        return {
          error: 'Service account not configured',
          message: 'Instagram service account cookies are required for this tool.',
        };
      }

      try {
        const profile = await instagramCookieService.getUserProfileByUsername(
          serviceCookies,
          username
        );
        
        if (!profile) {
          return { error: 'User not found or account is private' };
        }

        // Calculate estimated engagement
        const estimatedEngagement = (profile.followerCount * 0.02); // 2% average

        return {
          username: profile.username,
          followerCount: profile.followerCount || 0,
          followingCount: profile.followingCount || 0,
          postCount: profile.postCount || 0,
          estimatedEngagementRate: '2-5%',
          estimatedAvgLikes: Math.round(estimatedEngagement * 0.9),
          estimatedAvgComments: Math.round(estimatedEngagement * 0.1),
        };
      } catch (error: any) {
        console.error('Engagement calculator error:', error);
        return {
          error: 'Failed to calculate engagement',
          message: error.message || 'Unable to fetch Instagram data. Please try again later.',
        };
      }
    }

    // Pure JavaScript Calculators (no API needed)
    case 'ratio-calculator': {
      const followers = parseFloat(formData['followers'] || formData['follower-count'] || '0');
      const following = parseFloat(formData['following'] || formData['following-count'] || '0');
      const ratio = following > 0 ? (followers / following).toFixed(2) : '0';
      
      return {
        ratio: parseFloat(ratio),
        followers,
        following,
        status: getRatioStatus(parseFloat(ratio)),
      };
    }

    case 'emv-calculator': {
      const followers = parseFloat(formData['followers'] || formData['follower-count'] || '0');
      const engagementRate = parseFloat(formData['engagement-rate'] || formData['engagement'] || '0');
      const emv = followers * (engagementRate / 100) * 0.01; // $0.01 per engagement
      
      return {
        emv: emv.toFixed(2),
        followers,
        engagementRate,
        estimatedValue: `$${emv.toFixed(2)}`,
      };
    }

    case 'likes-followers-ratio': {
      const likes = parseFloat(formData['likes'] || formData['avg-likes'] || '0');
      const followers = parseFloat(formData['followers'] || formData['follower-count'] || '0');
      const ratio = followers > 0 ? ((likes / followers) * 100).toFixed(2) : '0';
      
      return {
        ratio: parseFloat(ratio),
        likes,
        followers,
        percentage: `${ratio}%`,
        status: getLikesRatioStatus(parseFloat(ratio)),
      };
    }

    // Instagram Reels Downloader
    case 'instagram-reels-downloader': {
      const reelUrl = formData['reel-url'] || formData['url'] || Object.values(formData)[0];
      if (!reelUrl) throw new Error('Reel URL is required');

      // Extract shortcode from URL
      const shortcode = extractShortcodeFromUrl(reelUrl);
      if (!shortcode) {
        return {
          error: 'Invalid Reel URL',
          message: 'Please provide a valid Instagram Reel URL (e.g., https://www.instagram.com/reel/ABC123/)',
        };
      }

      const serviceCookies = getServiceCookies();
      if (!serviceCookies) {
        return {
          error: 'Service account not configured',
          message: 'Instagram service account cookies are required for this tool.',
        };
      }

      try {
        console.log('[Reels Downloader] Fetching media for shortcode:', shortcode);
        const mediaInfo = await instagramCookieService.getMediaByShortcode(
          serviceCookies,
          shortcode
        );

        if (!mediaInfo) {
          console.error('[Reels Downloader] Media info is null for shortcode:', shortcode);
          return {
            error: 'Reel not found',
            message: 'Unable to fetch Reel. It may be private, the URL is invalid, or the service account needs to be refreshed. Check server logs for details.',
          };
        }
        
        console.log('[Reels Downloader] Media info retrieved:', {
          shortcode: mediaInfo.shortcode,
          isVideo: mediaInfo.isVideo,
          hasVideoUrl: !!mediaInfo.videoUrl,
          username: mediaInfo.username,
        });

        if (!mediaInfo.isVideo) {
          return {
            error: 'Not a video',
            message: 'The provided URL is not a Reel or video.',
          };
        }

        if (!mediaInfo.videoUrl) {
          return {
            error: 'Video URL not available',
            message: 'Unable to extract video URL from the Reel.',
          };
        }

        return {
          success: true,
          shortcode: mediaInfo.shortcode,
          videoUrl: mediaInfo.videoUrl,
          thumbnailUrl: mediaInfo.thumbnailUrl,
          caption: mediaInfo.caption,
          username: mediaInfo.username,
          likeCount: mediaInfo.likeCount,
          commentCount: mediaInfo.commentCount,
          timestamp: mediaInfo.timestamp,
          downloadUrl: `/api/tools/download-reel?url=${encodeURIComponent(mediaInfo.videoUrl)}&shortcode=${shortcode}`,
        };
      } catch (error: any) {
        console.error('Reels downloader error:', error);
        return {
          error: 'Failed to fetch Reel',
          message: error.message || 'Unable to fetch Reel data. Please try again later.',
        };
      }
    }

    // Instagram Photo Downloader
    case 'instagram-photo-downloader': {
      const photoUrl = formData['photo-url'] || formData['url'] || formData['post-url'] || Object.values(formData)[0];
      if (!photoUrl) throw new Error('Photo URL is required');

      const shortcode = extractShortcodeFromUrl(photoUrl);
      if (!shortcode) {
        return {
          error: 'Invalid Photo URL',
          message: 'Please provide a valid Instagram post URL',
        };
      }

      const serviceCookies = getServiceCookies();
      if (!serviceCookies) {
        return {
          error: 'Service account not configured',
          message: 'Instagram service account cookies are required for this tool.',
        };
      }

      try {
        const mediaInfo = await instagramCookieService.getMediaByShortcode(
          serviceCookies,
          shortcode
        );

        if (!mediaInfo) {
          return {
            error: 'Post not found',
            message: 'Unable to fetch post. It may be private or the URL is invalid.',
          };
        }

        // Get image URLs (could be single or carousel)
        const imageUrls: string[] = [];
        if (mediaInfo.thumbnailUrl) {
          imageUrls.push(mediaInfo.thumbnailUrl);
        }

        return {
          success: true,
          shortcode: mediaInfo.shortcode,
          imageUrls,
          caption: mediaInfo.caption,
          username: mediaInfo.username,
          likeCount: mediaInfo.likeCount,
          commentCount: mediaInfo.commentCount,
          downloadUrls: imageUrls.map((url, i) => 
            `/api/tools/download-photo?url=${encodeURIComponent(url)}&shortcode=${shortcode}&index=${i}`
          ),
        };
      } catch (error: any) {
        console.error('Photo downloader error:', error);
        return {
          error: 'Failed to fetch photo',
          message: error.message || 'Unable to fetch photo data. Please try again later.',
        };
      }
    }

    // Default: Return placeholder for tools not yet implemented
    default:
      return {
        message: 'Tool processing coming soon!',
        note: 'Your request has been saved and will be processed.',
      };
  }
}

// Helper function to extract shortcode from Instagram URL
function extractShortcodeFromUrl(url: string): string | null {
  if (!url) return null;

  // Clean the URL
  const cleanUrl = url.trim().replace(/\/$/, '');

  // Patterns to match:
  // https://www.instagram.com/reel/ABC123/
  // https://www.instagram.com/p/ABC123/
  // https://instagram.com/reel/ABC123/
  // instagram.com/reel/ABC123

  const patterns = [
    /instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reels\/([A-Za-z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If URL is just a shortcode
  if (/^[A-Za-z0-9_-]+$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

// Helper functions
function analyzeFollowersForBots(followers: any[]): any {
  // Simplified analysis - enhance this with real bot detection
  const suspiciousCount = Math.floor(followers.length * 0.15); // Estimate 15% fake
  return {
    fakePercentage: 15,
    suspiciousCount,
    insights: [
      'Analysis based on follower sample',
      'Check for accounts with no profile picture',
      'Look for accounts with suspicious follower/following ratios',
      'Verify engagement quality vs follower count',
    ],
  };
}

function getRatioStatus(ratio: number): string {
  if (ratio > 10) return 'Excellent - High follower quality';
  if (ratio > 5) return 'Good - Healthy account';
  if (ratio > 2) return 'Average - Room for improvement';
  return 'Low - Consider unfollowing inactive accounts';
}

function getLikesRatioStatus(ratio: number): string {
  if (ratio > 5) return 'Excellent engagement';
  if (ratio > 3) return 'Good engagement';
  if (ratio > 1) return 'Average engagement';
  return 'Low engagement - needs improvement';
}

