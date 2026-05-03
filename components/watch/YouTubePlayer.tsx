'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  startTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnd?: () => void;
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
  onEnd 
}, ref) => {
  const [player, setPlayer] = useState<YouTubePlayerInstance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
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
      controls: 0, // Hide YouTube's default controls
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      disablekb: 1, // Disable keyboard so we can handle it
      start: startTime, // Initial start time if iframe reloads
    },
  };

  const onReady = (event: { target: YouTubePlayerInstance }) => {
    const playerInst = event.target;
    setPlayer(playerInst);
    setDuration(playerInst.getDuration());
    
    if (startTime > 0) {
      playerInst.seekTo(startTime, true);
    }

    setIsPlaying(true);
    setError(null);
  };

  const onError = (event: { data: number }) => {
    // 2: Invalid param, 100: Not found, 101/150: Not allowed to embed or country restricted
    console.error('YouTube Player Error:', event.data);
    if (event.data === 101 || event.data === 150) {
      setError('This video is restricted in your region or unavailable for embedding.');
    } else if (event.data === 100) {
      setError('This video could not be found or has been removed.');
    } else {
      setError('An error occurred while trying to play this video.');
    }
    setIsPlaying(false);
  };

  const onStateChange = (event: { data: number }) => {
    // 1: Playing, 2: Paused
    setIsPlaying(event.data === 1);
  };

  // Progress tracking
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      const time = player.getCurrentTime();
      setCurrentTime(time);
      onProgress?.(time, duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [player, isPlaying, onProgress, duration]);

  // Handle auto-hide controls
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
    return (
      <div className="w-full h-full bg-[#090514] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-bold uppercase tracking-[2px]">Playback Restricted</h4>
          <p className="text-white/40 text-[10px] uppercase tracking-widest max-w-[280px] leading-relaxed">
            {error}
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-[2px] transition-all"
        >
          Try Refreshing
        </button>
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

      {/* Flixora Premium UI Overlay */}
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

        {/* Big Center Play/Pause Toggle Area */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {!isPlaying && (
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center animate-in zoom-in-75">
              <Play size={40} fill="white" className="ml-1" />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-8 space-y-6">
          {/* Progress Bar */}
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

            <div className="flex items-center gap-6">
               <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
                 <Maximize size={20} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';
