'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, AlertTriangle, ExternalLink, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  startTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onBuffering?: (isBuffering: boolean) => void;
  onEnd?: () => void;
  onError?: (errorCode: number) => void;
}

interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export interface YouTubePlayerRef {
  seekTo: (seconds: number) => void;
}

// Map YouTube error codes to user-friendly messages
function getErrorInfo(code: number): { message: string; isEmbedError: boolean; suggestion: string } {
  switch (code) {
    case 2:
      return {
        message: 'Invalid video request.',
        isEmbedError: false,
        suggestion: 'The video ID may be incorrect.',
      };
    case 5:
      return {
        message: 'This video cannot play in the embedded player.',
        isEmbedError: true,
        suggestion: 'Try watching directly on YouTube.',
      };
    case 100:
      return {
        message: 'This video has been removed or is private.',
        isEmbedError: false,
        suggestion: 'The uploader may have taken it down.',
      };
    case 101:
    case 150:
      return {
        message: 'The video owner has disabled embedding for this video.',
        isEmbedError: true,
        suggestion: 'You can watch it directly on YouTube, or find it on a legal streaming service.',
      };
    default:
      return {
        message: 'An unknown playback error occurred.',
        isEmbedError: false,
        suggestion: 'Try refreshing the page.',
      };
  }
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({
  videoId,
  title,
  startTime = 0,
  onProgress,
  onBuffering,
  onEnd,
  onError: onPlayerError
}, ref) => {
  const [player, setPlayer] = useState<YouTubePlayerInstance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<{ code: number; message: string; isEmbedError: boolean; suggestion: string } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      player?.seekTo(seconds, true);
    }
  }), [player]);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      disablekb: 1,
      start: startTime,
      enablejsapi: 1,
      origin: isMounted ? window.location.origin : '',
    },
  };

  const onReady = (event: { target: YouTubePlayerInstance }) => {
    const playerInst = event.target;
    setPlayer(playerInst);
    setDuration(playerInst.getDuration());
    if (startTime > 0) playerInst.seekTo(startTime, true);
    setIsPlaying(true);
    setError(null);
  };

  const onError = (event: { data: number }) => {
    console.error('YouTube Player Error:', event.data);
    const errorInfo = getErrorInfo(event.data);
    setError({ code: event.data, ...errorInfo });
    onPlayerError?.(event.data);
    setIsPlaying(false);
  };

  const onStateChange = (event: { data: number }) => {
    setIsPlaying(event.data === 1);
    onBuffering?.(event.data === 3);
  };

  useEffect(() => {
    if (!player || !isPlaying) return;
    const interval = setInterval(() => {
      const time = player.getCurrentTime();
      setCurrentTime(time);
      onProgress?.(time, duration);
    }, 1000);
    return () => clearInterval(interval);
  }, [player, isPlaying, onProgress, duration]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (isPlaying) player?.pauseVideo();
    else player?.playVideo();
  };

  const toggleMute = () => {
    if (isMuted) player?.unMute();
    else player?.mute();
    setIsMuted(!isMuted);
  };

  const seek = (seconds: number) => {
    const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
    player?.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    const justWatchUrl = title
      ? `https://www.justwatch.com/us/search?q=${encodeURIComponent(title)}`
      : 'https://www.justwatch.com';

    return (
      <div className="w-full h-full bg-[#090514] flex flex-col items-center justify-center p-8 text-center space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={40} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#090514] border border-red-500/20 flex items-center justify-center text-lg">
            {error.code}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 max-w-sm">
          <h4 className="text-white font-black uppercase tracking-wider text-lg">
            {error.isEmbedError ? 'Embedding Disabled' : 'Video Unavailable'}
          </h4>
          <p className="text-white/50 text-sm leading-relaxed">
            {error.message}
          </p>
          <p className="text-white/30 text-xs leading-relaxed">
            {error.suggestion}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* Watch on YouTube */}
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF0000] hover:bg-[#cc0000] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02]"
          >
            <ExternalLink size={14} />
            Watch on YouTube
          </a>

          {/* Find on JustWatch */}
          <a
            href={justWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
          >
            <Search size={14} />
            Find on JustWatch
          </a>

          {/* Retry */}
          <button
            onClick={() => {
              setError(null);
              setPlayer(null);
            }}
            className="px-6 py-3 bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl text-[10px] font-black text-white/30 hover:text-white/60 uppercase tracking-[2px] transition-all"
          >
            Try Again
          </button>
        </div>

        <p className="text-[9px] text-white/15 uppercase tracking-widest">
          Error code: {error.code} — This video cannot be embedded on third-party sites.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {isMounted && (
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={onError}
          onEnd={onEnd}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      )}

      {/* Custom Controls Overlay */}
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-500",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-[4px]">Now Playing</span>
            <h3 className="text-lg font-bebas tracking-wider text-white">{title || 'Video Player'}</h3>
          </div>
        </div>

        {/* Center Play/Pause */}
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          {!isPlaying && (
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center animate-in zoom-in-75">
              <Play size={40} fill="white" className="ml-1" />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-8 space-y-6">
          <div className="relative group/progress h-1.5 w-full bg-white/10 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              const newTime = ratio * duration;
              player?.seekTo(newTime, true);
              setCurrentTime(newTime);
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-[--flx-purple] rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity -ml-2"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-[--flx-cyan] transition-colors cursor-pointer">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <div className="flex items-center gap-4">
                <button onClick={() => seek(-10)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                  <RotateCcw size={20} />
                </button>
                <button onClick={() => seek(10)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                  <RotateCw size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <button onClick={toggleMute} className="text-white hover:text-[--flx-cyan] transition-colors cursor-pointer">
                  {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                <span className="text-[11px] font-bold text-white/40 font-mono tracking-tighter">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const el = document.querySelector('iframe');
                if (el?.requestFullscreen) el.requestFullscreen();
              }}
              className="text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';