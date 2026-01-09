'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle2, AlertCircle, Loader2, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PostDetailModal } from './post-detail-modal';

interface ProfileData {
  success: boolean;
  username: string;
  profileUrl: string;
  profilePicUrl?: string;
  fullName?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isVerified?: boolean;
  isPrivate?: boolean;
  isBusiness?: boolean;
  externalUrl?: string;
  recentPosts?: Array<{
    thumbnail: string;
    postUrl: string;
    likes?: number;
    comments?: number;
  }>;
  error?: string;
}

interface LeadProfileModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToLeads?: (username: string) => void;
  isAlreadyLead?: boolean;
  cookies?: any; // Instagram cookies for authenticated requests
  selectedAccount?: any; // Selected Instagram account
}

export function LeadProfileModal({ 
  username, 
  isOpen, 
  onClose, 
  onAddToLeads,
  isAlreadyLead = false,
  cookies,
  selectedAccount
}: LeadProfileModalProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Post detail modal state
  const [selectedPostShortcode, setSelectedPostShortcode] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // Nested profile modal state (for viewing liker/commenter profiles)
  const [nestedProfileUsername, setNestedProfileUsername] = useState<string | null>(null);
  const [isNestedProfileOpen, setIsNestedProfileOpen] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      fetchProfile();
    }
  }, [isOpen, username]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    setProfileData(null);

    try {
      // Use cookie-based API if cookies are available (more reliable and gets recent posts)
      if (cookies && selectedAccount) {
        const response = await fetch(`/api/instagram/cookie/user/${username}/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        // Transform the profile data to match our interface
        const profile = data.profile;
        setProfileData({
          success: true,
          username: profile.username,
          profileUrl: `https://www.instagram.com/${profile.username}/`,
          profilePicUrl: profile.profilePicUrl,
          fullName: profile.fullName,
          bio: profile.bio,
          followerCount: profile.followerCount,
          followingCount: profile.followingCount,
          postCount: profile.postCount || profile.mediaCount,
          isVerified: profile.isVerified,
          isPrivate: profile.isPrivate,
          isBusiness: profile.isBusiness,
          externalUrl: profile.externalUrl,
          recentPosts: profile.recentPosts || [],
        });
      } else {
        // Fallback to scraper API if no cookies (less reliable)
        const response = await fetch('/api/leads/scrape-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        setProfileData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background-elevated border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              @{username}
            </h2>
            <a
              href={`https://www.instagram.com/${username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground transition-colors p-2 hover:bg-background-muted rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <p className="text-foreground-muted">Loading fresh profile data...</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-error mb-1">Error</h3>
                <p className="text-sm text-foreground-muted">{error}</p>
                <Button
                  onClick={fetchProfile}
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {profileData && !error && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex flex-col items-center text-center">
                <Avatar
                  src={profileData.profilePicUrl}
                  alt={username}
                  size="xl"
                  className="w-32 h-32 mb-4 ring-4 ring-accent/20"
                />
                
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {profileData.fullName || username}
                  </h3>
                  
                  {/* Badges */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {profileData.isVerified && (
                      <Badge variant="accent" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                    {profileData.isPrivate && (
                      <Badge variant="default">🔒 Private</Badge>
                    )}
                    {profileData.isBusiness && (
                      <Badge variant="default">💼 Business</Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 my-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(profileData.postCount)}
                    </div>
                    <div className="text-sm text-foreground-muted">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(profileData.followerCount)}
                    </div>
                    <div className="text-sm text-foreground-muted">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(profileData.followingCount)}
                    </div>
                    <div className="text-sm text-foreground-muted">Following</div>
                  </div>
                </div>

                {/* Bio */}
                {profileData.bio && (
                  <div className="max-w-md">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {profileData.bio}
                    </p>
                  </div>
                )}

                {/* External URL */}
                {profileData.externalUrl && (
                  <a
                    href={profileData.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline mt-2 flex items-center gap-1"
                  >
                    {profileData.externalUrl.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Recent Posts - Only show for public accounts */}
              {!profileData.isPrivate && profileData.recentPosts && profileData.recentPosts.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-4">
                    Recent Posts
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {profileData.recentPosts.slice(0, 3).map((post, index) => {
                      // Extract shortcode from post URL
                      const shortcode = post.postUrl.match(/\/p\/([^/]+)\//)?.[1] || '';
                      
                      return (
                        <div
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPostShortcode(shortcode);
                            setIsPostModalOpen(true);
                          }}
                          className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={post.thumbnail}
                            alt={`Post ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            {post.likes !== undefined && (
                              <div className="flex items-center gap-1 text-white text-sm font-semibold">
                                <Heart className="w-4 h-4 fill-white" />
                                {formatNumber(post.likes)}
                              </div>
                            )}
                            {post.comments !== undefined && (
                              <div className="flex items-center gap-1 text-white text-sm font-semibold">
                                <MessageCircle className="w-4 h-4 fill-white" />
                                {formatNumber(post.comments)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Private Account Message */}
              {profileData.isPrivate && (
                <div className="text-center py-8 px-4 bg-background-muted rounded-xl">
                  <p className="text-sm text-foreground-muted">
                    🔒 This account is private. Posts are not visible.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Detail Modal */}
        {selectedPostShortcode && (
          <PostDetailModal
            shortcode={selectedPostShortcode}
            isOpen={isPostModalOpen}
            onClose={() => {
              setIsPostModalOpen(false);
              setSelectedPostShortcode(null);
            }}
            cookies={cookies}
            onUserClick={(username) => {
              setIsPostModalOpen(false);
              setNestedProfileUsername(username);
              setIsNestedProfileOpen(true);
            }}
          />
        )}

        {/* Nested Profile Modal (for likers/commenters) */}
        {nestedProfileUsername && (
          <LeadProfileModal
            username={nestedProfileUsername}
            isOpen={isNestedProfileOpen}
            onClose={() => {
              setIsNestedProfileOpen(false);
              setNestedProfileUsername(null);
            }}
            cookies={cookies}
            selectedAccount={selectedAccount}
            onAddToLeads={onAddToLeads}
          />
        )}

        {/* Footer Actions */}
        {profileData && !error && (
          <div className="p-6 border-t border-border bg-background-muted/50">
            <div className="flex items-center gap-3">
              {!isAlreadyLead && onAddToLeads && (
                <Button
                  onClick={() => onAddToLeads(username)}
                  variant="primary"
                  className="flex-1"
                >
                  Add to Leads
                </Button>
              )}
              {isAlreadyLead && (
                <div className="flex-1 flex items-center justify-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Already in Leads</span>
                </div>
              )}
              <Button
                onClick={() => window.open(`https://www.instagram.com/${username}/`, '_blank')}
                variant="secondary"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open on Instagram
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
