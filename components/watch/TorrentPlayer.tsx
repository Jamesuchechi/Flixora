'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, 
  Loader2, XCircle, Zap, Shield, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { torrentClient, type TorrentStreamState } from '@/lib/webtorrent-client';

interface TorrentPlayerProps {
  magnetUri: string;
  title: string;
  quality: string;
  startTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onError?: (message: string) => void;
}

export default function TorrentPlayer({
  magnetUri,
  title,
  quality,
  startTime = 0,
  onProgress,
  onError
}: TorrentPlayerProps) {
  const [streamState, setStreamState] = useState<TorrentStreamState>({
    status: 'idle',
    peers: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    progress: 0,
    timeRemaining: null,
    error: null,
    numFiles: 0
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showStatsPanel, setShowStatsPanel] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Initialization & Streaming ──────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    
    if (videoRef.current) {
      torrentClient.streamToVideo(magnetUri, videoRef.current, (state) => {
        if (mountedRef.current) setStreamState(state);
      }, startTime);
    }

    return () => {
      mountedRef.current = false;
      torrentClient.destroyCurrent();
    };
  }, [magnetUri, startTime]);

  // ── Progress Tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    if (streamState.status !== 'ready' || !videoRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        setCurrentTime(time);
        setDuration(dur);
        onProgress?.(time, dur);
      }
    }, 5000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [streamState.status, onProgress]);

  // ── Video Controls Handlers ──────────────────────────────────────────────────
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && streamState.status === 'ready') setShowControls(false);
    }, 3000);
  };

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSpeed = (bytesPerSec: number) => torrentClient.formatSpeed(bytesPerSec);

  // ── Status Overlay Components ───────────────────────────────────────────────
  const renderStatusOverlay = () => {
    if (streamState.status === 'ready') return null;

    const isError = streamState.status === 'error';
    const isBuffering = streamState.status === 'downloading' || streamState.status === 'connecting' || streamState.status === 'metadata';

    return (
      <div className="absolute inset-0 z-20 bg-[#07050f]/92 flex flex-col items-center justify-center gap-8 p-12 text-center transition-all duration-500">
        {/* Animated Icons */}
        <div className="relative">
          {streamState.status === 'connecting' && (
            <div className="w-20 h-20 rounded-full border-2 border-white/5 flex items-center justify-center">
               <Loader2 className="text-[--flx-cyan] animate-spin" size={40} />
            </div>
          )}
          {streamState.status === 'metadata' && (
            <div className="w-20 h-20 rounded-full border-2 border-white/5 flex items-center justify-center">
               <Shield className="text-[--flx-purple] animate-pulse" size={40} />
            </div>
          )}
          {streamState.status === 'downloading' && (
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-white/5 stroke-current" strokeWidth="4" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-[--flx-cyan] stroke-current" strokeWidth="4" strokeDasharray={251} strokeDashoffset={251 - (251 * streamState.progress)} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-white">{(streamState.progress * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
          {isError && (
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="text-red-500" size={40} />
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <h2 className="font-bebas text-5xl tracking-widest text-white uppercase">
            {streamState.status === 'connecting' && "Finding Peers"}
            {streamState.status === 'metadata' && "Loading Metadata"}
            {streamState.status === 'downloading' && "Buffering Stream"}
            {isError && "Stream Unavailable"}
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-[4px] font-bold">
            {isError ? streamState.error : `Quality: ${quality}`}
          </p>
        </div>

        {/* Stats Row */}
        {isBuffering && (
          <div className="flex items-center gap-8 py-4 px-8 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex flex-col items-center">
               <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Peers</span>
               <span className="text-sm font-bebas text-white tracking-wide">{streamState.peers} Active</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center">
               <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Speed</span>
               <span className="text-sm font-bebas text-[--flx-cyan] tracking-wide">{formatSpeed(streamState.downloadSpeed)}</span>
            </div>
          </div>
        )}

        {/* Progress Bar for Downloading */}
        {streamState.status === 'downloading' && (
           <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-linear-to-r from-[--flx-cyan] to-[--flx-purple] transition-all duration-500"
                style={{ width: `${streamState.progress * 100}%` }}
              />
           </div>
        )}

        {/* Action Buttons for Error */}
        {isError && (
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => {
                if (videoRef.current) {
                  torrentClient.streamToVideo(magnetUri, videoRef.current, setStreamState, startTime);
                }
              }}
              className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-[--flx-cyan] transition-colors"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => onError?.(streamState.error || 'Unknown error')}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-full transition-colors"
            >
              Use Trailer Mode
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-full bg-black group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && streamState.status === 'ready' && setShowControls(false)}
    >
      {/* Video Element - Always rendered for WebTorrent */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full bg-black"
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onDurationChange={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls={false}
        playsInline
      />

      {renderStatusOverlay()}

      {/* P2P Stats Badge */}
      {streamState.status === 'ready' && (
        <div className="absolute top-8 right-8 z-30 flex flex-col items-end gap-2">
          <button 
            onClick={() => setShowStatsPanel(!showStatsPanel)}
            className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-black/60 transition-all group/badge"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-wider">{streamState.peers} Peers</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-wider">{formatSpeed(streamState.downloadSpeed)}</span>
            {showStatsPanel ? <ChevronUp size={12} className="text-white/40" /> : <ChevronDown size={12} className="text-white/40" />}
          </button>

          {showStatsPanel && (
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl w-56 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[2px]">Stream Health</span>
                  <Zap size={14} className="text-[--flx-gold]" />
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between">
                     <span className="text-[10px] text-white/40 font-bold uppercase">Download</span>
                     <span className="text-[11px] text-white font-mono">{formatSpeed(streamState.downloadSpeed)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-[10px] text-white/40 font-bold uppercase">Upload</span>
                     <span className="text-[11px] text-white font-mono">{formatSpeed(streamState.uploadSpeed)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-[10px] text-white/40 font-bold uppercase">Buffered</span>
                     <span className="text-[11px] text-white font-mono">{(streamState.progress * 100).toFixed(1)}%</span>
                  </div>
               </div>
               <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                  <Info size={10} className="text-white/20" />
                  <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Powered by WebTorrent</span>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Video Controls (Shared with YouTube style) */}
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-500",
        (showControls && streamState.status === 'ready') ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        
        {/* Top Title Bar */}
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-[4px]">P2P Stream</span>
               <span className="px-2 py-0.5 rounded bg-[--flx-cyan] text-black text-[8px] font-black uppercase tracking-widest">PRO</span>
             </div>
             <h3 className="text-lg font-bebas tracking-wider text-white">{title} <span className="opacity-40 ml-2">[{quality}]</span></h3>
          </div>
        </div>

        {/* Center Toggle Area */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {!isPlaying && streamState.status === 'ready' && (
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center animate-in zoom-in-75">
              <Play size={40} fill="white" className="ml-1" />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-8 space-y-6">
          {/* Progress Slider */}
          <div className="relative group/progress h-1.5 w-full bg-white/10 rounded-full cursor-pointer">
             {/* Buffered background */}
             <div 
                className="absolute top-0 left-0 h-full bg-white/10 rounded-full transition-all"
                style={{ width: `${streamState.progress * 100}%` }}
             />
             {/* Current Playback */}
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
