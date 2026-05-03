'use client';

import YouTube, { YouTubeProps } from 'react-youtube';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (seconds: number) => void;
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

export function YouTubePlayer({ videoId, title, onProgress, onEnd }: YouTubePlayerProps) {
  const [player, setPlayer] = useState<YouTubePlayerInstance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    },
  };

  const onReady = (event: { target: YouTubePlayerInstance }) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    setIsPlaying(true);
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
      onProgress?.(time);
    }, 1000);

    return () => clearInterval(interval);
  }, [player, isPlaying, onProgress]);

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
        onEnd={onEnd}
        className="w-full h-full pointer-events-none" // Disable clicks on iframe
        iframeClassName="w-full h-full pointer-events-none"
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
}
