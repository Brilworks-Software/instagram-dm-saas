'use client';

import { useState, useMemo } from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Check if URL is from Instagram CDN and proxy it if needed
 */
function getProxiedImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Check if it's an Instagram CDN URL
  const isInstagramUrl = 
    url.includes('instagram.com') || 
    url.includes('cdninstagram.com') || 
    url.includes('fbcdn.net');
  
  if (isInstagramUrl) {
    // Use our proxy endpoint
    return `/api/instagram/image-proxy?url=${encodeURIComponent(url)}`;
  }
  
  return url;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  // Proxy Instagram images to avoid CORS issues
  const proxiedSrc = useMemo(() => getProxiedImageUrl(src), [src]);
  const showImage = proxiedSrc && !hasError;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/90 font-semibold flex-shrink-0',
        sizes[size],
        className
      )}
      style={{ color: '#ffffff' }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxiedSrc}
          alt={alt || name || 'Avatar'}
          className="h-full w-full rounded-full object-cover"
          onError={() => setHasError(true)}
          crossOrigin="anonymous"
        />
      ) : (
        <span style={{ color: '#ffffff' }} className="font-bold select-none">{getInitials(name)}</span>
      )}
    </div>
  );
}

