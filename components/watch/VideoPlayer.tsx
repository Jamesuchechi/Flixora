'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Play, SkipForward, Tv, Server, ChevronDown } from 'lucide-react';
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
  youtubeId?: string; // For trailers
  fullFilmYoutubeId?: string; // For verified free full films
  nextEpisodeUrl?: string;
  overview?: string;
  imdbId?: string;
}
const SERVERS = [
  { id: 'vidsrc_to', name: 'Server 1 (Clean)', url: 'https://vidsrc.to/embed/' },
  { id: 'vidsrc_me', name: 'Server 2 (Pro)', url: 'https://vidsrc.me/embed/' },
  { id: 'embed_su', name: 'Server 3 (Multi)', url: 'https://embed.su/embed/' },
  { id: 'vidsrc', name: 'Server 4 (Legacy)', url: 'https://vidsrc.xyz/embed/' },
];

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
  imdbId
}: VideoPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialMode = searchParams.get('mode') as 'player' | 'trailer' | 'free' | null;

  const [mode, setMode] = useState<'player' | 'trailer' | 'free'>(
    initialMode || 'player'
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
  const youtubeRef = useRef<YouTubePlayerRef>(null);

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

  // Sync URL changes to local state without triggering cascading renders
  const currentMode = initialMode || mode;

  const handleRefresh = () => {
    setPlayerKey(prev => prev + 1);
    setShowAdGuard(true);
  };

  const handleProgress = async (seconds: number, duration: number) => {
    if (duration > 0) {
      setCurrentTime(seconds);
      const percent = Math.floor((seconds / duration) * 100);
      // Sync every 5% to avoid spamming
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
    setMode(newMode);
    const params = new URLSearchParams(searchParams);
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
      const year = ""; // We could pass this as a prop, but matcher handles it
      const matchedId = await findFullMovieOnYouTube(tmdbId, title, year, mediaType);
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

  // Generate the professional embed URL using TMDB ID and selected Server
  const getStreamUrl = () => {
    const base = activeServer.url;
    const type = mediaType === 'tv' ? 'tv' : 'movie';
    const identifier = imdbId || tmdbId;
    
    // vidsrc.me uses a different query structure
    if (activeServer.id === 'vidsrc_me') {
      return `${base}${type}?${mediaType === 'tv' ? `tmdb=${tmdbId}&s=${season}&e=${episode}` : `tmdb=${tmdbId}`}`;
    }

    if (mediaType === 'tv') {
      return `${base}${type}/${identifier}/${season}/${episode}`;
    }
    return `${base}${type}/${identifier}`;
  };

  return (
    <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-[#090514] shadow-2xl border border-white/5 group">
      
      {/* Player Modes */}
      {currentMode === 'player' ? (
        <div className="w-full h-full relative">
          <SmartGuard 
            isShieldActive={showAdGuard} 
            onRefresh={handleRefresh}
          />
          <iframe
            key={`${activeServer.id}-${tmdbId}-${season}-${episode}-${playerKey}`}
            src={getStreamUrl()}
            title={`Video player for ${title}`}
            className="w-full h-full border-none z-10 relative"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          />
        </div>
      ) : currentMode === 'free' && (fullFilmYoutubeId || dynamicFreeId) ? (
        <div className="relative w-full h-full bg-black">
          <YouTubePlayer 
            ref={youtubeRef}
            videoId={(dynamicFreeId || fullFilmYoutubeId) as string} 
            title={title} 
            startTime={typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('t')) || 0 : 0}
            onProgress={(s, d) => handleProgress(s, d)}
          />
          <div className="absolute bottom-6 left-6 z-20">
            <ReportButton videoId={(dynamicFreeId || fullFilmYoutubeId) as string} title={title} />
          </div>
        </div>
      ) : (
        /* Trailer Mode (YouTube) */
        <div className="relative w-full h-full bg-black">
          {youtubeId ? (
            <YouTubePlayer 
              videoId={youtubeId as string} 
              title={title} 
              onEnd={() => handleModeChange('player')} 
            />
          ) : (
             <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[--flx-text-3] text-xs uppercase tracking-[3px] font-bold">No official trailer found</p>
             </div>
          )}
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {/* Main Toggle */}
          <div className="flex p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
            {(fullFilmYoutubeId || dynamicFreeId) && (
              <button 
                onClick={() => handleModeChange('free')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                  mode === 'free' || currentMode === 'free' ? "bg-[--flx-cyan] text-black shadow-lg" : "text-white/60 hover:text-white"
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
                currentMode === 'player' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <Play size={12} fill={currentMode === 'player' ? "black" : "none"} />
              STREAM
            </button>
            <button 
              onClick={() => handleModeChange('trailer')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                currentMode === 'trailer' ? "bg-[--flx-purple] text-white shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <Tv size={12} />
              TRAILER
            </button>
          </div>

          {/* AI Search / Recovery */}
          {mode === 'player' && !fullFilmYoutubeId && !dynamicFreeId && (
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
