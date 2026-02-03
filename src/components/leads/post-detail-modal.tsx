'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Heart, MessageCircle, Loader2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PostData {
  id: string;
  shortcode: string;
  postUrl: string;
  imageUrl: string;
  images: string[];
  isCarousel: boolean;
  caption: string;
  likeCount: number;
  commentCount: number;
  takenAt: string;
  owner: {
    username: string;
    fullName: string;
    profilePicUrl: string;
  };
  likers: Array<{
    pk: string;
    username: string;
    fullName: string;
    profilePicUrl: string;
    isVerified: boolean;
  }>;
  commenters: Array<{
    pk: string;
    username: string;
    fullName: string;
    profilePicUrl: string;
    isVerified: boolean;
    commentText: string;
  }>;
}

interface PostDetailModalProps {
  shortcode: string;
  isOpen: boolean;
  onClose: () => void;
  cookies?: any;
  onUserClick?: (username: string) => void;
}

export function PostDetailModal({ 
  shortcode, 
  isOpen, 
  onClose,
  cookies,
  onUserClick
}: PostDetailModalProps) {
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && shortcode) {
      setCurrentImageIndex(0);
      fetchPostDetails();
    }
  }, [isOpen, shortcode]);

  const fetchPostDetails = async () => {
    setLoading(true);
    setError(null);
    setPostData(null);

    try {
      const response = await fetch(`/api/instagram/cookie/post/${shortcode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies }),
      });

      const data = await response.json();

      if (data.success) {
        setPostData(data.post);
      } else {
        setError(data.error || 'Failed to load post details');
      }
    } catch (err: any) {
      console.error('Error fetching post details:', err);
      setError('Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-background-elevated border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background-muted/50">
          <h2 className="text-lg font-semibold text-foreground">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-red-400 mb-4">
                <X className="w-12 h-12" />
              </div>
              <p className="text-sm text-foreground-muted text-center mb-4">{error}</p>
              <Button onClick={fetchPostDetails} variant="secondary">
                Try Again
              </Button>
            </div>
          )}

          {postData && !loading && !error && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Post Image(s) */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-background-muted group">
                  <img
                    src={postData.images?.[currentImageIndex] || postData.imageUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Carousel Navigation */}
                  {postData.isCarousel && postData.images && postData.images.length > 1 && (
                    <>
                      {currentImageIndex > 0 && (
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                      )}
                      {currentImageIndex < postData.images.length - 1 && (
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      )}
                      
                      {/* Image Counter */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 rounded-full text-white text-xs font-medium">
                        {currentImageIndex + 1} / {postData.images.length}
                      </div>
                      
                      {/* Dot Indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {postData.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              index === currentImageIndex 
                                ? 'bg-white w-6' 
                                : 'bg-white/50 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 p-4 bg-background-muted rounded-xl">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="font-semibold text-foreground">
                      {formatNumber(postData.likeCount)}
                    </span>
                    <span className="text-sm text-foreground-muted">likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500 fill-blue-500" />
                    <span className="font-semibold text-foreground">
                      {formatNumber(postData.commentCount)}
                    </span>
                    <span className="text-sm text-foreground-muted">comments</span>
                  </div>
                </div>

                {/* Caption */}
                {postData.caption && (
                  <div className="p-4 bg-background-muted rounded-xl">
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
                      {postData.caption}
                    </p>
                  </div>
                )}

                <div className="text-xs text-foreground-muted text-center">
                  Posted on {formatDate(postData.takenAt)}
                </div>
              </div>

              {/* Engagement Details */}
              <div className="space-y-6">
                {/* Recent Likers */}
                {postData.likers && postData.likers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      Recent Likers ({postData.likers.length})
                    </h3>
                    <div className="space-y-2">
                      {postData.likers.map((liker) => (
                        <div
                          key={liker.pk}
                          onClick={() => onUserClick?.(liker.username)}
                          className="flex items-center gap-3 p-3 bg-background-muted hover:bg-background-elevated rounded-xl cursor-pointer transition-colors"
                        >
                          <Avatar 
                            src={liker.profilePicUrl}
                            name={liker.username}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-foreground truncate text-sm">
                                {liker.fullName}
                              </span>
                              {liker.isVerified && (
                                <Badge variant="accent" className="scale-75">✓</Badge>
                              )}
                            </div>
                            <div className="text-xs text-foreground-muted truncate">
                              @{liker.username}
                            </div>
                          </div>
                          <User className="w-4 h-4 text-foreground-muted flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Commenters */}
                {postData.commenters && postData.commenters.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                      Recent Commenters ({postData.commenters.length})
                    </h3>
                    <div className="space-y-3">
                      {postData.commenters.map((commenter) => (
                        <div
                          key={commenter.pk}
                          onClick={() => onUserClick?.(commenter.username)}
                          className="flex items-start gap-3 p-3 bg-background-muted hover:bg-background-elevated rounded-xl cursor-pointer transition-colors"
                        >
                          <Avatar 
                            src={commenter.profilePicUrl}
                            name={commenter.username}
                            size="md"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="font-medium text-foreground truncate text-sm">
                                {commenter.fullName}
                              </span>
                              {commenter.isVerified && (
                                <Badge variant="accent" className="scale-75">✓</Badge>
                              )}
                            </div>
                            <div className="text-xs text-foreground-muted truncate mb-1">
                              @{commenter.username}
                            </div>
                            <div className="text-xs text-foreground bg-background/50 p-2 rounded-lg line-clamp-2">
                              {commenter.commentText}
                            </div>
                          </div>
                          <User className="w-4 h-4 text-foreground-muted flex-shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No engagement data */}
                {(!postData.likers || postData.likers.length === 0) && 
                 (!postData.commenters || postData.commenters.length === 0) && (
                  <div className="text-center py-8 px-4 bg-background-muted rounded-xl">
                    <p className="text-sm text-foreground-muted">
                      No engagement data available for this post
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {postData && !loading && !error && (
          <div className="p-4 border-t border-border bg-background-muted/50">
            <Button
              onClick={() => window.open(postData.postUrl, '_blank')}
              variant="secondary"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Post on Instagram
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
