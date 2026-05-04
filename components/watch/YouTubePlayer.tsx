'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, AlertTriangle, ExternalLink } from 'lucide-react';
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
  const [error, setError] = useState<{ code: number; message: string } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      origin: typeof window !== 'undefined' ? window.location.origin : '',
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
    let message = 'An error occurred while trying to play this video.';
    
    // Error code reference:
    // 2: Invalid parameter
    // 5: HTML5 player error
    // 100: Video not found or private
    // 101/150: Embedding not allowed (region or uploader restriction)
    if (event.data === 101 || event.data === 150) {
      message = 'This video is restricted in your region or the uploader has disabled embedding.';
    } else if (event.data === 100) {
      message = 'This video could not be found or has been removed.';
    }
    
    setError({ code: event.data, message });
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
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    const isEmbedError = error.code === 101 || error.code === 150;
    return (
      <div className="w-full h-full bg-[#090514] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="text-red-400" size={36} />
        </div>
        
        <div className="space-y-2 max-w-xs">
          <h4 className="text-white font-black uppercase tracking-[2px]">
            {isEmbedError ? 'Playback Restricted' : 'Video Unavailable'}
          </h4>
          <p className="text-white/40 text-[11px] uppercase tracking-widest leading-relaxed">
            {error.message}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF0000] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#cc0000] transition-all"
          >
            <ExternalLink size={14} />
            Watch on YouTube
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white/50 hover:text-white uppercase tracking-[2px] transition-all"
          >
            Try Refreshing
          </button>
        </div>

        <p className="text-[9px] text-white/15 uppercase tracking-widest max-w-xs">
          Error code: {error.code}
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

        {/* Center Play/Pause Toggle */}
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          {!isPlaying && (
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center animate-in zoom-in-75">
              <Play size={40} fill="white" className="ml-1" />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-8 space-y-6">
          <div className="relative group/progress h-1.5 w-full bg-white/10 rounded-full cursor-pointer">
            <div
              className="absolute top-0 left-0 h-full bg-[--flx-purple] rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / duration) * 100}%` }}
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
            <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';