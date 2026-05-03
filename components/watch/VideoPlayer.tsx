'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Play, SkipForward, Tv, Server, ChevronDown, Calendar, AlertCircle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { YouTubePlayer, YouTubePlayerRef } from './YouTubePlayer';
import { updateWatchProgress } from '@/lib/supabase/actions/progress';
import { ReportButton } from './ReportButton';
import { SmartGuard } from './SmartGuard';
import { SceneAssistant } from './SceneAssistant';
import { Sparkles } from 'lucide-react';
import { getSkipSegments, SkipSegment } from '@/lib/ai/skip-detection';
import { SkipPrompt } from './SkipPrompt';
import { updatePlaybackPreference, getUserPreferences, logSkipEvent } from '@/lib/supabase/actions/preferences';
import { findFullMovieOnYouTube } from '@/lib/supabase/actions/matcher';
import { Loader2, Search } from 'lucide-react';

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  backdrop: string;
  season?: number;
  episode?: number;
  youtubeId?: string;
  fullFilmYoutubeId?: string;
  nextEpisodeUrl?: string;
  overview?: string;
  imdbId?: string;
  releaseDate?: string;
  status?: string;
}

const SERVERS = [
  { 
    id: 'vidsrc_cc', 
    name: 'Server 1 (Fast)', 
    url: 'https://vidsrc.cc/v2/embed/' 
  },
  { 
    id: 'autoembed', 
    name: 'Server 2 (Auto)', 
    url: 'https://player.autoembed.cc/embed/' 
  },
  { 
    id: 'vidlink', 
    name: 'Server 3 (HD)', 
    url: 'https://vidlink.pro/' 
  },
  { 
    id: 'embed_su', 
    name: 'Server 4 (Backup)', 
    url: 'https://embed.su/embed/' 
  },
  { 
    id: 'twoembed', 
    name: 'Server 5 (Alt)', 
    url: 'https://www.2embed.cc/embed/' 
  },
];

const CURRENT_TIME = Date.now();

export function VideoPlayer({
  tmdbId,
  mediaType,
  title,
  season,
  episode,
  youtubeId,
  fullFilmYoutubeId,
  nextEpisodeUrl,
  overview = "",
  imdbId,
  releaseDate,
  status
}: VideoPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialMode = searchParams.get('mode') as 'player' | 'trailer' | 'free' | null;

  // FIX 1: Use local state as the source of truth.
  // initialMode only seeds the initial value — after that, `mode` drives everything.
  const [mode, setMode] = useState<'player' | 'trailer' | 'free'>(
    initialMode === 'free' && fullFilmYoutubeId ? 'free'
    : initialMode === 'trailer' ? 'trailer'
    : 'player'
  );
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [showServerList, setShowServerList] = useState(false);
  const [showAdGuard, setShowAdGuard] = useState(true);
  const [playerKey, setPlayerKey] = useState(0);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [skipSegments, setSkipSegments] = useState<SkipSegment[]>([]);
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [dynamicFreeId, setDynamicFreeId] = useState<string | null>(null);
  const [forceStream, setForceStream] = useState(false);
  const youtubeRef = useRef<YouTubePlayerRef>(null);

  const isUnreleased = useMemo(() => {
    if (!releaseDate) return false;
    const releaseMs = new Date(releaseDate).getTime();
    const nowMs = CURRENT_TIME;
    // Only treat as unreleased if date is clearly in the future (>1 day buffer)
    // AND status is not a released/active value
    const isFutureDate = releaseMs > nowMs + 86_400_000;
    const releasedStatuses = ['Released', 'Returning Series', 'Ended', 'Canceled'];
    const isConfirmedReleased = status ? releasedStatuses.includes(status) : false;
    return isFutureDate && !isConfirmedReleased;
  }, [releaseDate, status]);

  useEffect(() => {
    async function loadInitialData() {
      const [segments, prefs] = await Promise.all([
        getSkipSegments(tmdbId, mediaType, season, episode, fullFilmYoutubeId || youtubeId),
        getUserPreferences()
      ]);
      setSkipSegments(segments);
      if (prefs?.auto_skip_intros) setAutoSkipEnabled(true);
    }
    loadInitialData();
  }, [tmdbId, mediaType, season, episode, fullFilmYoutubeId, youtubeId]);

  // Handle Auto-Skip Logic
  useEffect(() => {
    if (autoSkipEnabled && skipSegments.length > 0) {
      const currentSegment = skipSegments.find(s => currentTime >= s.startTime && currentTime < s.endTime);
      if (currentSegment && youtubeRef.current) {
        youtubeRef.current.seekTo(currentSegment.endTime);
      }
    }
  }, [currentTime, autoSkipEnabled, skipSegments]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setIsAssistantOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsAssistantOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = () => {
    setPlayerKey(prev => prev + 1);
    setShowAdGuard(true);
  };

  const handleProgress = async (seconds: number, duration: number) => {
    if (duration > 0) {
      setCurrentTime(seconds);
      const percent = Math.floor((seconds / duration) * 100);
      if (percent % 5 === 0) {
        await updateWatchProgress(tmdbId, mediaType, percent, season, episode);
      }
    }
  };

  useEffect(() => {
    if (showAdGuard) {
      const timer = setTimeout(() => setShowAdGuard(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showAdGuard]);

  const handleModeChange = (newMode: 'player' | 'trailer' | 'free') => {
    // FIX 1 cont: Update local state first, then sync URL
    setMode(newMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', newMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (newMode === 'player') {
      setShowAdGuard(true);
      setTimeout(() => setShowAdGuard(false), 4000);
    }
  };

  const handleServerChange = (server: typeof SERVERS[0]) => {
    setActiveServer(server);
    setShowServerList(false);
    setShowAdGuard(true);
    setTimeout(() => setShowAdGuard(false), 4000);
  };

  const handleAISearch = async () => {
    setIsSearchingAI(true);
    try {
      const matchedId = await findFullMovieOnYouTube(tmdbId, title, "", mediaType);
      if (matchedId) {
        setDynamicFreeId(matchedId);
        setMode('free');
      } else {
        alert("AI Matcher couldn't find a verified full version on YouTube. Try another server.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingAI(false);
    }
  };

  const getStreamUrl = () => {
    const { id } = activeServer;
    const identifier = tmdbId || imdbId;

    if (id === 'vidsrc_cc') {
      return mediaType === 'tv'
        ? `https://vidsrc.cc/v2/embed/tv/${identifier}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${identifier}`;
    }

    if (id === 'autoembed') {
      return mediaType === 'tv'
        ? `https://player.autoembed.cc/embed/tv/${identifier}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${identifier}`;
    }

    if (id === 'vidlink') {
      return mediaType === 'tv'
        ? `https://vidlink.pro/tv/${identifier}/${season}/${episode}`
        : `https://vidlink.pro/movie/${identifier}`;
    }

    if (id === 'embed_su') {
      return mediaType === 'tv'
        ? `https://embed.su/embed/tv/${identifier}/${season}/${episode}`
        : `https://embed.su/embed/movie/${identifier}`;
    }

    if (id === 'twoembed') {
      // 2embed often prefers IMDb for movies, but can use TMDB too. 
      // We'll stick to identifier but use their specific TV format.
      return mediaType === 'tv'
        ? `https://www.2embed.cc/embedtv/${identifier}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${identifier}`;
    }

    // fallback
    return mediaType === 'tv'
      ? `https://vidsrc.cc/v2/embed/tv/${identifier}/${season}/${episode}`
      : `https://vidsrc.cc/v2/embed/movie/${identifier}`;
  };

  // Determine what the free video ID is
  const activeFreeId = dynamicFreeId || fullFilmYoutubeId;

  return (
    <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-[#090514] shadow-2xl border border-white/5 group">

      {/* Player Modes */}
      {mode === 'player' ? (
        <div className="w-full h-full relative">
          <SmartGuard
            isShieldActive={showAdGuard}
            onRefresh={handleRefresh}
          />
          {isUnreleased && !forceStream ? (
            <div className="absolute inset-0 z-40 bg-[#090514] flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-[--flx-cyan]/10 flex items-center justify-center animate-pulse">
                <Calendar className="text-[--flx-cyan]" size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bebas tracking-[4px] text-white">Coming Soon to Streaming</h3>
                <p className="text-white/40 text-xs uppercase tracking-[2px] max-w-md">
                  This media is not yet available on our streaming servers.
                  Expected release: <span className="text-white">{releaseDate}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => handleModeChange('trailer')}
                  className="flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-[3px] transition-all"
                >
                  <Tv size={14} />
                  Watch Official Trailer
                </button>
                <button
                  onClick={() => setForceStream(true)}
                  className="flex items-center gap-3 px-8 py-3 bg-[--flx-cyan]/10 hover:bg-[--flx-cyan]/20 border border-[--flx-cyan]/20 rounded-full text-[10px] font-black text-[--flx-cyan] uppercase tracking-[3px] transition-all"
                >
                  <PlayCircle size={14} />
                  Try Streaming Anyway
                </button>
              </div>
            </div>
          ) : (
            <iframe
              key={`${activeServer.id}-${tmdbId}-${season}-${episode}-${playerKey}`}
              src={getStreamUrl()}
              title={`Video player for ${title}`}
              className="w-full h-full border-none z-10 relative"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            />
          )}
        </div>
      ) : mode === 'free' && activeFreeId ? (
        <div className="relative w-full h-full bg-black">
          <YouTubePlayer
            ref={youtubeRef}
            videoId={activeFreeId}
            title={title}
            startTime={typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('t')) || 0 : 0}
            onProgress={(s, d) => handleProgress(s, d)}
          />
          <div className="absolute bottom-6 left-6 z-20">
            <ReportButton videoId={activeFreeId} title={title} />
          </div>
        </div>
      ) : (
        /* Trailer Mode (YouTube) */
        <div className="relative w-full h-full bg-black">
          {youtubeId ? (
            <YouTubePlayer
              videoId={youtubeId}
              title={title}
              onEnd={() => handleModeChange('player')}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#090514] flex-col space-y-4">
              <AlertCircle className="text-white/20" size={48} />
              <p className="text-[--flx-text-3] text-[10px] uppercase tracking-[3px] font-bold">No official trailer available</p>
            </div>
          )}
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {/* Main Toggle */}
          <div className="flex p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
            {activeFreeId && (
              <button
                onClick={() => handleModeChange('free')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                  mode === 'free' ? "bg-[--flx-cyan] text-black shadow-lg" : "text-white/60 hover:text-white"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                WATCH FREE (NO ADS)
              </button>
            )}
            <button
              onClick={() => handleModeChange('player')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                mode === 'player' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <Play size={12} fill={mode === 'player' ? "black" : "none"} />
              STREAM
            </button>
            <button
              onClick={() => handleModeChange('trailer')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                mode === 'trailer' ? "bg-[--flx-purple] text-white shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <Tv size={12} />
              TRAILER
            </button>
          </div>

          {/* AI Search / Recovery */}
          {mode === 'player' && !activeFreeId && (
            <button
              onClick={handleAISearch}
              disabled={isSearchingAI}
              className="flex items-center gap-2 px-4 py-3 bg-[--flx-purple]/10 hover:bg-[--flx-purple]/20 border border-[--flx-purple]/20 rounded-2xl text-[10px] font-bold text-[--flx-purple] tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {isSearchingAI ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Search size={12} />
              )}
              {isSearchingAI ? "FINDING FULL VERSION..." : "FIND ON YOUTUBE (AI)"}
            </button>
          )}

          {/* AI Advisor Button */}
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-bold tracking-widest transition-all",
              isAssistantOpen ? "bg-[--flx-cyan] text-black" : "bg-black/40 text-white hover:bg-black/60"
            )}
          >
            <Sparkles size={12} className={cn(isAssistantOpen ? "text-black" : "text-[--flx-cyan] animate-pulse")} />
            AI ADVISOR
          </button>

          {/* Server Switcher */}
          {mode === 'player' && (
            <div className="relative">
              <button
                onClick={() => setShowServerList(!showServerList)}
                aria-label="Select streaming server"
                aria-expanded={showServerList}
                className="flex items-center gap-2 px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-bold text-white tracking-widest hover:bg-black/60 transition-all"
              >
                <Server size={12} className="text-[--flx-cyan]" />
                {activeServer.name}
                <ChevronDown size={12} className={cn("transition-transform", showServerList && "rotate-180")} />
              </button>

              {showServerList && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#110c1d]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {SERVERS.map((server) => (
                    <button
                      key={server.id}
                      onClick={() => handleServerChange(server)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold tracking-widest transition-colors border-b border-white/5 last:border-none",
                        activeServer.id === server.id ? "text-[--flx-cyan] bg-white/5" : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {server.name}
                      {activeServer.id === server.id && <div className="w-1.5 h-1.5 rounded-full bg-[--flx-cyan] animate-pulse" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Currently Playing Info */}
        <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="text-[8px] font-black text-[--flx-cyan] uppercase tracking-[3px]">Now Streaming</span>
          <h4 className="text-[11px] font-bold text-white uppercase tracking-tight max-w-[200px] truncate">{title}</h4>
        </div>
      </div>

      {/* Next Episode Overlay */}
      {mediaType === 'tv' && nextEpisodeUrl && (
        <button
          onClick={() => router.push(nextEpisodeUrl)}
          aria-label={`Watch next episode: Season ${season} Episode ${Number(episode || 0) + 1}`}
          className="absolute top-24 right-8 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-95 group/next shadow-2xl opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 duration-500"
        >
          <div className="text-right">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[1px]">Next Up</p>
            <p className="text-[11px] font-bold text-white">S{season} E{(episode || 0) + 1}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[--flx-purple] flex items-center justify-center shadow-lg shadow-[--flx-purple]/20 group-hover/next:scale-110 transition-transform">
            <SkipForward size={20} className="text-white fill-white" />
          </div>
        </button>
      )}

      {/* Atmospheric Glowing Orbs */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[--flx-purple]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[--flx-cyan]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* AI Assistant Sidebar */}
      <SceneAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        title={title}
        timestamp={currentTime}
        plotContext={overview}
      />

      <SkipPrompt
        currentTime={currentTime}
        segments={skipSegments}
        onSkip={(to) => {
          if (mode === 'free' && youtubeRef.current) {
            youtubeRef.current.seekTo(to);
            logSkipEvent(tmdbId, 'manual');
          }
        }}
        onAlwaysSkip={async () => {
          setAutoSkipEnabled(true);
          await updatePlaybackPreference('auto_skip_intros', true);
        }}
      />
    </div>
  );
}