import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Play, SkipForward, Tv, Server, ChevronDown, Calendar, AlertCircle, PlayCircle, Monitor, Maximize2, Volume2, Info, RefreshCw } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

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
  rating?: number;
}

const SERVERS = [
  { 
    id: 'vidsrc_cc', 
    name: 'Server 1 (Fast)', 
    url: 'https://vidsrc.cc/v2/embed/',
    health: 'working'
  },
  { 
    id: 'autoembed', 
    name: 'Server 2 (Auto)', 
    url: 'https://player.autoembed.cc/embed/',
    health: 'working'
  },
  { 
    id: 'vidlink', 
    name: 'Server 3 (HD)', 
    url: 'https://vidlink.pro/',
    health: 'warning'
  },
  { 
    id: 'embed_su', 
    name: 'Server 4 (Backup)', 
    url: 'https://embed.su/embed/',
    health: 'working'
  },
  { 
    id: 'twoembed', 
    name: 'Server 5 (Alt)', 
    url: 'https://www.2embed.cc/embed/',
    health: 'error'
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
  status,
  rating = 0
}: VideoPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialMode = searchParams.get('mode') as 'player' | 'trailer' | 'free' | null;

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
  const [duration, setDuration] = useState(0);
  const [skipSegments, setSkipSegments] = useState<SkipSegment[]>([]);
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [dynamicFreeId, setDynamicFreeId] = useState<string | null>(null);
  const [forceStream, setForceStream] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const youtubeRef = useRef<YouTubePlayerRef>(null);

  // Listen for ready signals from 3rd-party iframes
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Check for common 'ready' events from player embeds
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        const readyEvents = ['ready', 'player_ready', 'video_ready', 'vidsrc_ready', 'vidlink_ready'];
        if (data && (readyEvents.includes(data.event) || readyEvents.includes(data.type) || data === 'ready')) {
          setIsPlayerReady(true);
        }
      } catch {
        // Not JSON or other message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const isUnreleased = useMemo(() => {
    if (!releaseDate) return false;
    const releaseMs = new Date(releaseDate).getTime();
    const nowMs = CURRENT_TIME;
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

    // Hide shortcuts after 5s
    const timer = setTimeout(() => setShowShortcuts(false), 5000);
    return () => clearTimeout(timer);
  }, [tmdbId, mediaType, season, episode, fullFilmYoutubeId, youtubeId]);

  // Handle Auto-Skip Logic
  useEffect(() => {
    if (autoSkipEnabled && skipSegments.length > 0) {
      const currentSegment = skipSegments.find(s => currentTime >= s.startTime && currentTime < s.endTime);
      if (currentSegment && youtubeRef.current) {
        youtubeRef.current.seekTo(currentSegment.endTime);
        logSkipEvent(tmdbId, 'auto');
      }
    }
  }, [currentTime, autoSkipEnabled, skipSegments, tmdbId]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setIsAssistantOpen(prev => !prev);
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsCinemaMode(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsAssistantOpen(false);
        setIsCinemaMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = () => {
    setPlayerKey(prev => prev + 1);
    setShowAdGuard(true);
    setIsPlayerReady(false);
  };

  const lastUpdateRef = useRef<{ percent: number; time: number }>({ percent: -1, time: 0 });

  const handleProgress = async (seconds: number, dur: number) => {
    if (dur > 0) {
      setCurrentTime(seconds);
      setDuration(dur);
      
      const percent = Math.floor((seconds / dur) * 100);
      const now = Date.now();
      
      const isMilestone = percent % 5 === 0;
      const isNewPercent = percent !== lastUpdateRef.current.percent;
      const enoughTimePassed = now - lastUpdateRef.current.time > 10000;

      if (isMilestone && isNewPercent && enoughTimePassed) {
        lastUpdateRef.current = { percent, time: now };
        await updateWatchProgress(tmdbId, mediaType, percent, season, episode);
      }
    }
  };

  const handleModeChange = (newMode: 'player' | 'trailer' | 'free') => {
    setMode(newMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', newMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (newMode === 'player') {
      setShowAdGuard(true);
    }
  };

  const handleServerChange = (server: typeof SERVERS[0]) => {
    setActiveServer(server);
    setShowServerList(false);
    setShowAdGuard(true);
    setIsPlayerReady(false);
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
    if (id === 'vidsrc_cc') return mediaType === 'tv' ? `https://vidsrc.cc/v2/embed/tv/${identifier}/${season}/${episode}` : `https://vidsrc.cc/v2/embed/movie/${identifier}`;
    if (id === 'autoembed') return mediaType === 'tv' ? `https://player.autoembed.cc/embed/tv/${identifier}/${season}/${episode}` : `https://player.autoembed.cc/embed/movie/${identifier}`;
    if (id === 'vidlink') return mediaType === 'tv' ? `https://vidlink.pro/tv/${identifier}/${season}/${episode}` : `https://vidlink.pro/movie/${identifier}`;
    if (id === 'embed_su') return mediaType === 'tv' ? `https://embed.su/embed/tv/${identifier}/${season}/${episode}` : `https://embed.su/embed/movie/${identifier}`;
    if (id === 'twoembed') return mediaType === 'tv' ? `https://www.2embed.cc/embedtv/${identifier}&s=${season}&e=${episode}` : `https://www.2embed.cc/embed/${identifier}`;
    return mediaType === 'tv' ? `https://vidsrc.cc/v2/embed/tv/${identifier}/${season}/${episode}` : `https://vidsrc.cc/v2/embed/movie/${identifier}`;
  };

  const activeFreeId = dynamicFreeId || fullFilmYoutubeId;

  return (
    <div className="flex flex-col gap-6">
      {/* Cinema Mode Backdrop */}
      <AnimatePresence>
        {isCinemaMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCinemaMode(false)}
            className="fixed inset-0 bg-black/95 z-40 cursor-pointer"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "relative w-full aspect-video rounded-[32px] overflow-hidden bg-[#090514] shadow-2xl border border-white/5 group transition-all duration-700",
        isCinemaMode ? "z-50 shadow-[0_0_100px_rgba(0,0,0,0.8)] scale-[1.02]" : "z-10"
      )}>

        {/* Player Modes */}
        {mode === 'player' ? (
          <div className="w-full h-full relative">
            <SmartGuard isShieldActive={showAdGuard} onRefresh={handleRefresh} isReady={isPlayerReady} />
            {isUnreleased && !forceStream ? (
              <div className="absolute inset-0 z-40 bg-[#090514] flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-[--flx-cyan]/10 flex items-center justify-center animate-pulse"><Calendar className="text-[--flx-cyan]" size={40} /></div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bebas tracking-[4px] text-white">Coming Soon to Streaming</h3>
                  <p className="text-white/40 text-xs uppercase tracking-[2px] max-w-md">This media is not yet available on our streaming servers. Expected release: <span className="text-white">{releaseDate}</span></p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button onClick={() => handleModeChange('trailer')} className="flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-[3px] transition-all"><Tv size={14} />Watch Official Trailer</button>
                  <button onClick={() => setForceStream(true)} className="flex items-center gap-3 px-8 py-3 bg-[--flx-cyan]/10 hover:bg-[--flx-cyan]/20 border border-[--flx-cyan]/20 rounded-full text-[10px] font-black text-[--flx-cyan] uppercase tracking-[3px] transition-all"><PlayCircle size={14} />Try Streaming Anyway</button>
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
                referrerPolicy="no-referrer"
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
              onProgress={handleProgress}
            />
            <div className="absolute bottom-6 left-6 z-20"><ReportButton videoId={activeFreeId} title={title} /></div>
          </div>
        ) : (
          <div className="relative w-full h-full bg-black">
            {youtubeId ? <YouTubePlayer videoId={youtubeId} title={title} onEnd={() => handleModeChange('player')} /> : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#090514] flex-col space-y-4"><AlertCircle className="text-white/20" size={48} /><p className="text-[--flx-text-3] text-[10px] uppercase tracking-[3px] font-bold">No official trailer available</p></div>
            )}
          </div>
        )}

        {/* Keyboard Shortcut Hints */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none z-30"
            >
              <div className="flex gap-4 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                {[
                  { icon: <Play size={10} />, key: 'Space', label: 'Play' },
                  { icon: <Maximize2 size={10} />, key: 'F', label: 'Full' },
                  { icon: <Volume2 size={10} />, key: 'M', label: 'Mute' },
                  { icon: <Sparkles size={10} />, key: '?', label: 'AI' },
                  { icon: <SkipForward size={10} />, key: 'C', label: 'Cinema' },
                ].map(hint => (
                  <div key={hint.key} className="flex items-center gap-2">
                    <span className="bg-white/10 px-2 py-1 rounded text-[9px] font-black text-white">{hint.key}</span>
                    <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest">{hint.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Episode Overlay */}
        {mediaType === 'tv' && nextEpisodeUrl && (
          <button
            onClick={() => router.push(nextEpisodeUrl)}
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

        {/* Top Navigation Bar */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="flex p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
              {activeFreeId && (
                <button onClick={() => handleModeChange('free')} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all", mode === 'free' ? "bg-[--flx-cyan] text-black shadow-lg" : "text-white/60 hover:text-white")}>
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse" />WATCH FREE
                </button>
              )}
              <button onClick={() => handleModeChange('player')} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all", mode === 'player' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white")}><Play size={12} fill={mode === 'player' ? "black" : "none"} />STREAM</button>
              <button onClick={() => handleModeChange('trailer')} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all", mode === 'trailer' ? "bg-[--flx-purple] text-white shadow-lg" : "text-white/60 hover:text-white")}><Tv size={12} />TRAILER</button>
            </div>

            <button onClick={() => setIsCinemaMode(!isCinemaMode)} className={cn("flex items-center gap-2 px-4 py-3 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-bold tracking-widest transition-all", isCinemaMode ? "bg-white text-black" : "bg-black/40 text-white hover:bg-black/60")}>
              <Monitor size={12} />CINEMA
            </button>

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
                {isSearchingAI ? "FINDING..." : "AI MATCHER"}
              </button>
            )}

            <div className="relative">
              <button onClick={() => setShowServerList(!showServerList)} className="flex items-center gap-2 px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-bold text-white tracking-widest hover:bg-black/60 transition-all">
                <Server size={12} className="text-[--flx-cyan]" />{activeServer.name}<ChevronDown size={12} className={cn("transition-transform", showServerList && "rotate-180")} />
              </button>
              {showServerList && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#110c1d]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {SERVERS.map((server) => (
                    <button key={server.id} onClick={() => handleServerChange(server)} className={cn("w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold tracking-widest transition-colors border-b border-white/5 last:border-none", activeServer.id === server.id ? "text-[--flx-cyan] bg-white/5" : "text-white/60 hover:text-white hover:bg-white/5")}>
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1.5 h-1.5 rounded-full", server.health === 'working' ? "bg-green-500" : server.health === 'warning' ? "bg-yellow-500" : "bg-red-500")} />
                        {server.name}
                      </div>
                      {activeServer.id === server.id && <div className="w-1.5 h-1.5 rounded-full bg-[--flx-cyan] animate-pulse" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <SceneAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} title={title} timestamp={currentTime} plotContext={overview} />
        <SkipPrompt currentTime={currentTime} segments={skipSegments} onSkip={(to) => { if (mode === 'free' && youtubeRef.current) { youtubeRef.current.seekTo(to); logSkipEvent(tmdbId, 'manual'); } }} onAlwaysSkip={async () => { setAutoSkipEnabled(true); await updatePlaybackPreference('auto_skip_intros', true); }} />
      </div>

      {/* ── NOW PLAYING INFO BAR ── */}
      <div className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center text-white shadow-lg">
            <Play fill="white" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bebas text-2xl text-white tracking-wide">{title}</h4>
              <span className="text-[10px] font-black bg-[--flx-cyan] text-black px-1.5 py-0.5 rounded uppercase">{mediaType === 'movie' ? 'Movie' : `S${season} E${episode}`}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
              <span className="text-[--flx-gold]">★ {rating.toFixed(1)}</span>
              <span>•</span>
              <span>HD 1080P</span>
              <span>•</span>
              <span>Dolby Digital</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md w-full space-y-2">
          <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
            <span>Progress</span>
            <span>{duration > 0 ? `${Math.floor(currentTime/60)}:${(currentTime%60).toString().padStart(2,'0')} / ${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,'0')}` : 'Live Stream'}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-purple] bg-size-[200%_100%] animate-shimmer" 
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '100%' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"><Info size={18} /></button>
          <button onClick={handleRefresh} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-[--flx-cyan] transition-all"><RefreshCw size={18} /></button>
        </div>
      </div>
    </div>
  );
}
