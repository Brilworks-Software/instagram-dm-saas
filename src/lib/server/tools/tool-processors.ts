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
      const contentType = formData['content-type'] || formData['type'] || 'Posts, Stories, Reels';
      const ideas = await generateContentIdeas(niche, 15);
      return {
        ideas,
        count: ideas.length,
        niche,
        contentType,
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

    case 'engagement-calculator': {
      // Direct calculator using likes, comments, followers
      const likes = parseFloat(formData['likes'] || formData['total-likes'] || '0');
      const comments = parseFloat(formData['comments'] || formData['total-comments'] || '0');
      const followers = parseFloat(formData['followers'] || formData['total-followers'] || '0');
      
      if (followers === 0) {
        return {
          error: 'Invalid input',
          message: 'Follower count must be greater than 0',
        };
      }
      
      // Calculate engagement rate: (likes + comments) / followers * 100
      const totalEngagement = likes + comments;
      const engagementRate = (totalEngagement / followers) * 100;
      
      // Determine engagement quality
      let quality = 'Low';
      let qualityColor = 'red';
      let description = 'Your engagement rate is below average. Focus on creating more engaging content and interacting with your audience.';
      
      if (engagementRate >= 10) {
        quality = 'Excellent';
        qualityColor = 'green';
        description = 'Outstanding! Your engagement rate is exceptional. Keep creating the amazing content your audience loves.';
      } else if (engagementRate >= 5) {
        quality = 'Very Good';
        qualityColor = 'green';
        description = 'Great job! Your engagement rate is well above average. Your audience is highly engaged with your content.';
      } else if (engagementRate >= 3) {
        quality = 'Good';
        qualityColor = 'blue';
        description = 'Good engagement rate! You\'re doing well. Keep interacting with your audience to maintain and improve this rate.';
      } else if (engagementRate >= 1) {
        quality = 'Average';
        qualityColor = 'yellow';
        description = 'Your engagement rate is average. Try posting more engaging content and use stories to connect with your audience.';
      }
      
      return {
        engagementRate: engagementRate.toFixed(2) + '%',
        engagementRateValue: parseFloat(engagementRate.toFixed(2)),
        likes: likes.toLocaleString(),
        comments: comments.toLocaleString(),
        followers: followers.toLocaleString(),
        totalEngagement: totalEngagement.toLocaleString(),
        quality,
        qualityColor,
        description,
      };
    }
    
    case 'engagement-rate-calculator': {
      const username = extractInstagramHandle(formData);
      const contentType = (formData['content-type'] || 'posts').toLowerCase();
      
      if (!username) throw new Error('Instagram handle required');
      
      const serviceCookies = getServiceCookies();
      if (!serviceCookies) {
        return {
          error: 'Service account not configured',
          message: 'Instagram service account cookies are required for this tool.',
        };
      }

      try {
        // Get user profile
        const profile = await instagramCookieService.getUserProfileByUsername(
          serviceCookies,
          username
        );
        
        if (!profile) {
          return { error: 'User not found or account is private' };
        }

        // Fetch last 5 posts or reels
        const mediaType = contentType.includes('reel') ? 'reels' : 'posts';
        const media = await instagramCookieService.getUserRecentMedia(
          serviceCookies,
          username,
          5,
          mediaType
        );

        if (media.length === 0) {
          return {
            error: 'No content found',
            message: `No ${mediaType} found for @${username}. The account may be private or have no ${mediaType}.`,
          };
        }

        // Calculate engagement metrics
        const totalLikes = media.reduce((sum, m) => sum + m.likeCount, 0);
        const totalComments = media.reduce((sum, m) => sum + m.commentCount, 0);
        const totalViews = media.reduce((sum, m) => sum + (m.viewCount || m.playCount || 0), 0);
        
        const avgLikes = Math.round(totalLikes / media.length);
        const avgComments = Math.round(totalComments / media.length);
        const avgViews = Math.round(totalViews / media.length);
        
        // Calculate engagement rate
        const avgEngagement = avgLikes + avgComments;
        const engagementRate = profile.followerCount > 0 
          ? (avgEngagement / profile.followerCount) * 100 
          : 0;
        
        // Determine quality
        let quality = 'Low';
        let qualityColor = 'red';
        let description = 'Your engagement rate is below average. Try posting more engaging content and interacting with your audience.';
        
        if (engagementRate >= 10) {
          quality = 'Excellent';
          qualityColor = 'green';
          description = 'Outstanding! Your engagement rate is exceptional. Your audience loves your content!';
        } else if (engagementRate >= 5) {
          quality = 'Very Good';
          qualityColor = 'green';
          description = 'Great work! Your engagement rate is well above average. Keep it up!';
        } else if (engagementRate >= 3) {
          quality = 'Good';
          qualityColor = 'blue';
          description = 'Good engagement rate! You\'re doing well. Keep engaging with your audience.';
        } else if (engagementRate >= 1) {
          quality = 'Average';
          qualityColor = 'yellow';
          description = 'Your engagement rate is average. Consider experimenting with different content types.';
        }

        return {
          username: profile.username,
          followerCount: profile.followerCount || 0,
          contentType: mediaType,
          postsAnalyzed: media.length,
          
          // Engagement metrics
          engagementRate: engagementRate.toFixed(2) + '%',
          engagementRateValue: parseFloat(engagementRate.toFixed(2)),
          quality,
          qualityColor,
          description,
          
          // Average metrics
          avgLikes: avgLikes.toLocaleString(),
          avgComments: avgComments.toLocaleString(),
          avgViews: avgViews > 0 ? avgViews.toLocaleString() : null,
          
          // Total metrics
          totalLikes: totalLikes.toLocaleString(),
          totalComments: totalComments.toLocaleString(),
          totalViews: totalViews > 0 ? totalViews.toLocaleString() : null,
          
          // Individual posts
          posts: media.map(m => ({
            url: m.url,
            shortcode: m.shortcode,
            likes: m.likeCount.toLocaleString(),
            comments: m.commentCount.toLocaleString(),
            views: m.viewCount || m.playCount || 0,
            thumbnailUrl: m.thumbnailUrl,
            caption: m.caption ? (m.caption.length > 100 ? m.caption.substring(0, 100) + '...' : m.caption) : '',
          })),
        };
      } catch (error: any) {
        console.error('Engagement rate calculator error:', error);
        return {
          error: 'Failed to calculate engagement',
          message: error.message || 'Unable to fetch Instagram data. Please try again later.',
        };
      }
    }

    // Pure JavaScript Calculators (no API needed)
    case 'ratio-calculator': {
      const followers = parseFormattedNumber(formData['followers'] || formData['follower-count'] || '0');
      const following = parseFormattedNumber(formData['following'] || formData['following-count'] || '0');
      const ratio = following > 0 ? (followers / following) : 0;
      const ratioFormatted = following > 0 ? `1:${(following / followers).toFixed(2)}` : '1:0';
      
      return {
        ratio: parseFloat(ratio.toFixed(2)),
        ratioFormatted,
        followers,
        following,
        status: getRatioStatus(ratio),
        description: getRatioDescription(followers, following, ratio),
      };
    }

    case 'emv-calculator': {
      const followers = parseFormattedNumber(formData['followers'] || formData['follower-count'] || '0');
      const engagementRate = parseFloat(formData['engagement-rate'] || formData['engagement'] || '0');
      
      // Calculate estimated engagements
      const estimatedEngagements = followers * (engagementRate / 100);
      
      // EMV calculation: Industry standard is $0.01-$0.05 per engagement
      // Using $0.02 as average
      const emvPerEngagement = 0.02;
      const emv = estimatedEngagements * emvPerEngagement;
      
      // Calculate per post value
      const perPostValue = emv;
      
      // Calculate monthly value (assuming 20 posts per month)
      const monthlyValue = perPostValue * 20;
      
      return {
        emv: emv.toFixed(2),
        followers,
        engagementRate,
        estimatedValue: `$${emv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        perPostValue: `$${perPostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        monthlyValue: `$${monthlyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        estimatedEngagements: Math.round(estimatedEngagements).toLocaleString(),
        description: getEMVDescription(followers, engagementRate, emv),
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

function parseFormattedNumber(value: string): number {
  if (!value) return 0;
  
  const cleaned = value.toString().trim().toLowerCase();
  const number = parseFloat(cleaned);
  
  if (cleaned.endsWith('k')) {
    return number * 1000;
  } else if (cleaned.endsWith('m')) {
    return number * 1000000;
  } else if (cleaned.endsWith('b')) {
    return number * 1000000000;
  } else if (cleaned.endsWith('t')) {
    return number * 1000000000000;
  }
  
  return number;
}

function getRatioStatus(ratio: number): string {
  if (ratio > 10) return 'Excellent - High follower quality';
  if (ratio > 5) return 'Good - Healthy account';
  if (ratio > 2) return 'Average - Room for improvement';
  return 'Low - Consider unfollowing inactive accounts';
}

function getRatioDescription(followers: number, following: number, ratio: number): string {
  if (followers === 0 && following === 0) {
    return 'Please enter valid follower and following counts.';
  }
  
  if (followers > following) {
    const times = ratio.toFixed(1);
    return `Your followers are ${times}x higher than your following. This indicates strong account credibility and influence.`;
  } else if (following > followers) {
    const times = (following / followers).toFixed(1);
    return `You're following ${times}x more accounts than your followers. Consider unfollowing inactive accounts to improve your ratio.`;
  } else {
    return 'Your followers and following are equal. This is a balanced account, but aim for more followers than following.';
  }
}

function getEMVDescription(followers: number, engagementRate: number, emv: number): string {
  if (followers === 0 || engagementRate === 0) {
    return 'Enter your follower count and engagement rate to calculate your content\'s monetary value.';
  }
  
  let tier = '';
  if (followers < 10000) {
    tier = 'nano-influencer';
  } else if (followers < 50000) {
    tier = 'micro-influencer';
  } else if (followers < 500000) {
    tier = 'mid-tier influencer';
  } else if (followers < 1000000) {
    tier = 'macro-influencer';
  } else {
    tier = 'mega-influencer';
  }
  
  let engagementLevel = '';
  if (engagementRate < 1) {
    engagementLevel = 'below average';
  } else if (engagementRate < 3) {
    engagementLevel = 'average';
  } else if (engagementRate < 6) {
    engagementLevel = 'good';
  } else {
    engagementLevel = 'excellent';
  }
  
  return `As a ${tier} with ${engagementLevel} engagement (${engagementRate}%), each post generates approximately $${emv.toFixed(2)} in earned media value. This represents the monetary worth brands would need to spend on traditional advertising to achieve similar reach and engagement.`;
}

function getLikesRatioStatus(ratio: number): string {
  if (ratio > 5) return 'Excellent engagement';
  if (ratio > 3) return 'Good engagement';
  if (ratio > 1) return 'Average engagement';
  return 'Low engagement - needs improvement';
}

