'use client';

import { useEffect, useRef, useState } from 'react';

interface TrailerPlayerProps {
  videoKey: string;
  title: string;
  autoplay?: boolean;
  muted?: boolean;
  onReady?: () => void;
  onEnd?: () => void;
  className?: string;
}

interface YTPlayer {
  destroy(): void;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}

interface YTPlayerOptions {
  videoId?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: {
    autoplay?: 0 | 1;
    mute?: 0 | 1;
    controls?: 0 | 1 | 2;
    modestbranding?: 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    iv_load_policy?: 1 | 3;
    color?: 'red' | 'white';
    [key: string]: number | string | undefined;
  };
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number; target: YTPlayer }) => void;
    onError?: (event: { data: number; target: YTPlayer }) => void;
  };
}

/**
 * Robust YouTube Trailer Player using the IFrame API.
 */
export function TrailerPlayer({ 
  videoKey,  
  autoplay = true, 
  muted = false,
  onReady,
  onEnd,
  className 
}: TrailerPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(() => {
    return typeof window !== 'undefined' && !!window.YT;
  });

  useEffect(() => {
    if (isApiLoaded) return;

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setIsApiLoaded(true);
      };
    }
  }, [isApiLoaded]);

  useEffect(() => {
    if (isApiLoaded && containerRef.current && videoKey && window.YT) {
      // Destroy previous player if it exists
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoKey,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          mute: muted ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          color: 'white',
        },
        events: {
          onReady: () => {
            if (onReady) onReady();
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT.PlayerState.ENDED && onEnd) {
              onEnd();
            }
          },
        },
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isApiLoaded, videoKey, autoplay, muted, onReady, onEnd]);

  return (
    <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

// Global types for YouTube API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
      Player: new (element: HTMLElement | string, options: YTPlayerOptions) => YTPlayer;
    };
  }
}
