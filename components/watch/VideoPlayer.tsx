'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  backdrop: string;
  season?: number;
  episode?: number;
  initialProgress?: number;
  videoUrl?: string;
  youtubeId?: string;
  nextEpisodeUrl?: string;
}

interface PlyrInstance {
  on: (event: string, callback: (event: { detail: { plyr: PlyrInstance } }) => void) => void;
  off: (event: string, callback: (event: { detail: { plyr: PlyrInstance } }) => void) => void;
  currentTime: number;
  duration: number;
  source: unknown;
  destroy: () => void;
  togglePlay: () => void;
  fullscreen: { toggle: () => void };
  forward: (seconds: number) => void;
  rewind: (seconds: number) => void;
}

interface HlsInstance {
  isSupported: () => boolean;
  new (): {
    loadSource: (src: string) => void;
    attachMedia: (element: HTMLVideoElement) => void;
  };
}

declare global {
  interface Window {
    Plyr: new (element: HTMLElement | string, options?: Record<string, unknown>) => PlyrInstance;
    Hls: HlsInstance;
  }
}

export function VideoPlayer({
  tmdbId,
  mediaType,
  backdrop,
  season,
  episode,
  initialProgress = 0,
  videoUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  youtubeId,
  nextEpisodeUrl
}: VideoPlayerProps) {
  const router = useRouter();
  const { saveProgress } = useWatchProgress();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlyrInstance | null>(null);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [showNextCard, setShowNextCard] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Load CDN Libraries
  useEffect(() => {
    const loadScript = (src: string, id: string) => {
      return new Promise((resolve) => {
        if (document.getElementById(id)) return resolve(true);
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = () => resolve(true);
        document.body.appendChild(script);
      });
    };

    const loadStyle = (href: string, id: string) => {
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.id = id;
      document.head.appendChild(link);
    };

    Promise.all([
      loadScript('https://cdn.plyr.io/3.7.8/plyr.js', 'plyr-js'),
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest', 'hls-js'),
      loadStyle('https://cdn.plyr.io/3.7.8/plyr.css', 'plyr-css'),
    ]).then(() => {
      setLibsLoaded(true);
    });
  }, []);

  // Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const player = playerRef.current;
    if (!player) return;

    // Don't trigger if user is typing in an input
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        player.togglePlay();
        break;
      case 'KeyF':
        e.preventDefault();
        player.fullscreen.toggle();
        break;
      case 'ArrowRight':
        e.preventDefault();
        player.forward(10);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        player.rewind(10);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Initialize Player
  useEffect(() => {
    if (!libsLoaded || !playerContainerRef.current) return;

    let videoElement: HTMLVideoElement | null = null;
    
    if (!youtubeId) {
      videoElement = document.createElement('video');
      videoElement.className = 'plyr-video';
      playerContainerRef.current.appendChild(videoElement);
    }

    const player = new window.Plyr(videoElement || playerContainerRef.current, {
      autoplay: false,
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 
        'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
      keyboard: { focused: true, global: false }, // We handle global ourselves
    });

    playerRef.current = player;

    if (videoElement && window.Hls && window.Hls.isSupported() && videoUrl.includes('.m3u8')) {
      const hls = new window.Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
    } else if (videoElement) {
      videoElement.src = videoUrl;
    }

    if (youtubeId) {
      player.source = {
        type: 'video',
        sources: [{ src: youtubeId, provider: 'youtube' }]
      };
    }

    // Progress & Events
    player.on('ready', () => {
      if (initialProgress > 0 && player.duration > 0) {
        player.currentTime = (initialProgress / 100) * player.duration;
      }
    });

    player.on('timeupdate', () => {
      const remaining = player.duration - player.currentTime;
      const percentage = Math.floor((player.currentTime / player.duration) * 100);
      
      // Show Next Episode card 20 seconds before end
      if (mediaType === 'tv' && nextEpisodeUrl && remaining < 20 && remaining > 0 && !showNextCard) {
        setShowNextCard(true);
      } else if (remaining >= 20 && showNextCard) {
        setShowNextCard(false);
      }

      if (percentage % 5 === 0 && percentage > initialProgress) {
        saveProgress(tmdbId, mediaType, percentage, season, episode);
      }
    });

    player.on('ended', () => {
      if (mediaType === 'tv' && nextEpisodeUrl) {
        router.push(nextEpisodeUrl);
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (videoElement && videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
      }
    };
  }, [libsLoaded, videoUrl, youtubeId, tmdbId, mediaType, season, episode, initialProgress, saveProgress, nextEpisodeUrl, router, showNextCard]);

  // Next Episode Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showNextCard && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (showNextCard && countdown === 0 && nextEpisodeUrl) {
      router.push(nextEpisodeUrl);
    }
    return () => clearInterval(timer);
  }, [showNextCard, countdown, nextEpisodeUrl, router]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5 group">
      <div ref={playerContainerRef} className="w-full h-full" />
      
      {!libsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
           <div className="w-12 h-12 border-4 border-white/10 border-t-[--flx-cyan] rounded-full animate-spin" />
        </div>
      )}

      {/* Next Episode Overlay */}
      {showNextCard && nextEpisodeUrl && (
        <div className="absolute bottom-24 right-8 z-50 animate-fade-left">
           <div className="bg-[--flx-surface-1]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-72">
              <p className="text-[10px] font-bold text-[--flx-cyan] uppercase tracking-[3px] mb-3">Up Next</p>
              <div className="flex gap-4 items-center mb-6">
                 <div className="relative w-20 aspect-video rounded-lg overflow-hidden border border-white/5">
                    <Image src={backdrop} alt="Next" fill className="object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-white font-bold text-xs">S{season}:E{(episode || 0) + 1}</span>
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">Next Episode</h4>
                    <p className="text-[10px] text-white/40 uppercase">Playing in {countdown}s</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={() => router.push(nextEpisodeUrl)}
                   className="flex-1 bg-white text-black font-bold text-xs py-2.5 rounded-lg hover:bg-[--flx-cyan] transition-colors cursor-pointer"
                 >
                    Play Now
                 </button>
                 <button 
                   onClick={() => setShowNextCard(false)}
                   className="px-4 bg-white/10 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        :root {
          --plyr-color-main: #8b5cf6;
        }
        .plyr--video {
          border-radius: 16px;
        }
        .plyr__control--overlaid {
          background: rgba(139, 92, 246, 0.8) !important;
        }
      `}</style>
    </div>
  );
}
