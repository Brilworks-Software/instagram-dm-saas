'use client';

import { Play, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';

export function HeroVideo({ 
  videoId = "qfZBnw7G2Tw", 
  isInHero = false 
}: { 
  videoId?: string;
  isInHero?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  // Auto-play video when component mounts
  useEffect(() => {
    setIsPlaying(true);
  }, []);

  return (
    <div 
      id="demo-video-section" 
      className={`relative w-full max-w-7xl mx-auto ${isInHero ? 'mt-6 sm:mt-8 mb-6 sm:mb-8' : 'mt-16 sm:mt-20 md:mt-24 mb-16 sm:mb-24 md:mb-32'} px-4 sm:px-6 lg:px-8`}
    >
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] rounded-full -z-10 opacity-60"></div>
        {!isInHero && (
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
        )}

        {/* Video Container */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/50 dark:border-white/10 shadow-2xl bg-background-elevated/40 backdrop-blur-sm group hover:shadow-accent/20 transition-all duration-300">
            {/* Top Bar (Browser-like) */}
            <div className="h-10 sm:h-12 bg-background/80 dark:bg-black/40 backdrop-blur-md border-b border-border/50 dark:border-white/5 flex items-center px-3 sm:px-4 gap-2">
                <div className="flex gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="mx-auto bg-foreground/5 dark:bg-white/5 rounded-full px-3 sm:px-4 py-1 flex items-center gap-2">
                   <span className="text-[10px] sm:text-xs text-foreground/70 dark:text-foreground-muted font-medium">socialora.app</span>
                </div>
            </div>

            {/* Video Area */}
            <div className="relative aspect-video w-full bg-black/90">
                <div className="relative w-full h-full">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`}
                        title="SocialOra AI Demo - Instagram DM Automation"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                        allowFullScreen
                    />
                    {/* Mute/Unmute Button Overlay */}
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        // Note: YouTube iframe doesn't allow programmatic mute control
                        // User can use YouTube's built-in controls
                      }}
                      className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 p-2 sm:p-3 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-all z-10"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                      title="Use YouTube controls to mute/unmute"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
