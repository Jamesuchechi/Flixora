import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Play, SkipForward, AlertCircle, Monitor, Maximize2, Volume2, Info, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { YouTubePlayer, YouTubePlayerRef } from './YouTubePlayer';
import { updateWatchProgress } from '@/lib/supabase/actions/progress';
import { ReportButton } from './ReportButton';
import { SceneAssistant } from './SceneAssistant';
import { Sparkles } from 'lucide-react';
import { getSkipSegments, SkipSegment } from '@/lib/ai/skip-detection';
import { SkipPrompt } from './SkipPrompt';
import { updatePlaybackPreference, getUserPreferences, logSkipEvent } from '@/lib/supabase/actions/preferences';
import { ReactionOverlay } from './ReactionOverlay';
import { ReactionHeatmap } from './ReactionHeatmap';
import { ReactionToggle } from './ReactionToggle';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { EndPartyScreen } from '../social/EndPartyScreen';
import dynamic from 'next/dynamic';
import { getMediaTorrents, type StreamTorrent } from '@/lib/torrentio';
import { useToast } from '@/hooks/useToast';

const P2P_ENABLED = process.env.NEXT_PUBLIC_ENABLE_P2P === 'true';
const MODE_STORAGE_KEY = 'flixora-preferred-mode';

const TorrentPlayer = dynamic(
  () => import('./TorrentPlayer'),
  { ssr: false, loading: () => <div className="w-full h-full bg-black animate-pulse" /> }
);

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  backdrop: string;
  posterPath?: string;
  season?: number;
  episode?: number;
  youtubeId?: string;
  fullFilmYoutubeId?: string;
  nextEpisodeUrl?: string;
  overview?: string;
  rating?: number;
  partyId?: string;
  isHost?: boolean;
  imdbId?: string;
}

type PlayerMode = 'free' | 'torrent' | 'hd';

// ── No-content placeholder shown when nothing can play ──────────────────────
function NoContentPlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#090514] p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <AlertCircle className="text-white/20" size={40} />
      </div>
      <div className="space-y-3 max-w-sm">
        <h3 className="text-lg font-black text-white uppercase tracking-wider">Not Available for Streaming</h3>
        <p className="text-white/40 text-sm leading-relaxed">
          <span className="text-white font-bold">{title}</span> isn&apos;t available to watch for free right now. Find it on a streaming service below.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[--flx-cyan] transition-all"
        >
          <ExternalLink size={14} />
          Find on JustWatch
        </a>
        <p className="text-[9px] text-white/20 uppercase tracking-widest">
          Netflix · Prime · Disney+ · and more
        </p>
      </div>
    </div>
  );
}

export function VideoPlayer({
  tmdbId,
  mediaType,
  title,
  backdrop,
  posterPath,
  season,
  episode,
  youtubeId,
  fullFilmYoutubeId,
  nextEpisodeUrl,
  overview = "",
  rating = 0,
  partyId,
  isHost = false,
  imdbId
}: VideoPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();

  const activeFreeId = fullFilmYoutubeId ?? null;

  const getDefaultMode = (): PlayerMode => {
    // URL param takes highest priority (explicit user choice)
    const urlMode = searchParams.get('mode') as PlayerMode | null;
    if (urlMode === 'torrent' && P2P_ENABLED && imdbId) return 'torrent';
    if (urlMode === 'hd') return 'hd';
    if (urlMode === 'free' && activeFreeId) return 'free';

    // Stored preference is second priority
    const stored = typeof window !== 'undefined'
      ? (localStorage.getItem(MODE_STORAGE_KEY) as PlayerMode | null)
      : null;
    if (stored === 'torrent' && P2P_ENABLED && imdbId) return 'torrent';
    if (stored === 'hd') return 'hd';
    if (stored === 'free' && activeFreeId) return 'free';

    // Auto-select best available:
    if (P2P_ENABLED && imdbId) return 'torrent';
    if (activeFreeId) return 'free';
    return 'hd';
  };

  const [mode, setMode] = useState<PlayerMode>(() => getDefaultMode());

  const [torrents, setTorrents] = useState<StreamTorrent[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [torrentLoading, setTorrentLoading] = useState(P2P_ENABLED && !!imdbId);

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const availableModes = [
    P2P_ENABLED && (torrents.length > 0 || torrentLoading) ? 'torrent' : 'hd',
    activeFreeId ? 'free' : null,
  ].filter(Boolean) as PlayerMode[];

  const [duration, setDuration] = useState(0);
  const [skipSegments, setSkipSegments] = useState<SkipSegment[]>([]);
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferingParticipants, setBufferingParticipants] = useState<string[]>([]);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [isPartyEnded, setIsPartyEnded] = useState(false);
  // Track if free stream has failed so we can show fallback
  const [freeStreamFailed, setFreeStreamFailed] = useState(false);
  const youtubeRef = useRef<YouTubePlayerRef>(null);

  useEffect(() => {
    async function loadInitialData() {
      const [segments, prefs] = await Promise.all([
        getSkipSegments(tmdbId, mediaType, season, episode, fullFilmYoutubeId || youtubeId),
        getUserPreferences()
      ]);
      setSkipSegments(segments);
      if (prefs?.auto_skip_intros) setAutoSkipEnabled(true);

      // Load torrents if enabled
      if (P2P_ENABLED && imdbId) {
        setTorrentLoading(true);
        try {
          const { torrents: fetched } = await getMediaTorrents(imdbId, mediaType, season, episode);
          if (fetched.length > 0) {
            setTorrents(fetched);
            const has1080 = fetched.some(t => t.quality === '1080p');
            setSelectedQuality(has1080 ? '1080p' : fetched[0].quality);
            
            // If we have torrents and no explicit mode is in URL, prefer torrent
            setMode(prevMode => {
              const currentUrlMode = new URLSearchParams(window.location.search).get('mode');
              if (!currentUrlMode && prevMode !== 'torrent') return 'torrent';
              return prevMode;
            });
          } else {
             // If P2P enabled but no torrents found, fallback to free
             setMode(prevMode => {
               const currentUrlMode = new URLSearchParams(window.location.search).get('mode');
               if (!currentUrlMode && prevMode === 'torrent') return 'free';
               return prevMode;
             });
          }
        } catch (err) {
          console.error('[P2P] Fetch failed:', err);
        } finally {
          setTorrentLoading(false);
        }
      }
    }
    loadInitialData();

    const timer = setTimeout(() => setShowShortcuts(false), 5000);
    return () => clearTimeout(timer);
  }, [tmdbId, mediaType, season, episode, fullFilmYoutubeId, youtubeId, imdbId]); 

  useEffect(() => {
    if (autoSkipEnabled && skipSegments.length > 0) {
      const currentSegment = skipSegments.find(s => currentTime >= s.startTime && currentTime < s.endTime);
      if (currentSegment && youtubeRef.current) {
        youtubeRef.current.seekTo(currentSegment.endTime);
        logSkipEvent(tmdbId, 'auto');
      }
    }
  }, [currentTime, autoSkipEnabled, skipSegments, tmdbId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') { e.preventDefault(); setIsAssistantOpen(prev => !prev); }
      if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setIsCinemaMode(prev => !prev); }
      if (e.key === 'Escape') { setIsAssistantOpen(false); setIsCinemaMode(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Watch party sync
  useEffect(() => {
    if (!partyId) return;
    const supabase = createClient();
    const channel = supabase.channel(`party_sync:${partyId}`, { config: { broadcast: { self: false } } });
    channel
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        if (isHost) return;
        const { timestamp, status: syncStatus, mode: remoteMode } = payload;
        if (remoteMode !== mode) setMode(remoteMode);
        if (Math.abs(currentTime - timestamp) > 3 && youtubeRef.current) {
          youtubeRef.current.seekTo(timestamp);
        }
        void syncStatus;
      })
      .on('broadcast', { event: 'ended' }, () => setIsPartyEnded(true))
      .on('broadcast', { event: 'buffering' }, ({ payload }) => {
        const { isBuffering: remoteBuffering, username } = payload;
        setBufferingParticipants(prev =>
          remoteBuffering ? [...new Set([...prev, username])] : prev.filter(n => n !== username)
        );
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [partyId, isHost, mode, currentTime]);

  useEffect(() => {
    if (!partyId || !isHost) return;
    const supabase = createClient();
    const channel = supabase.channel(`party_sync:${partyId}`);
    const interval = setInterval(() => {
      channel.send({ type: 'broadcast', event: 'sync', payload: { timestamp: currentTime, status: 'playing', mode } });
    }, 2000);
    return () => clearInterval(interval);
  }, [partyId, isHost, currentTime, mode]);

  useEffect(() => {
    if (!partyId) return;
    const supabase = createClient();
    const channel = supabase.channel(`party_sync:${partyId}`);
    channel.send({ type: 'broadcast', event: 'buffering', payload: { username: 'A friend', isBuffering } });
  }, [partyId, isBuffering]);

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
        await updateWatchProgress(tmdbId, mediaType, percent, season ?? null, episode ?? null);
      }
    }
  };

  const handleModeChange = (newMode: PlayerMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setFreeStreamFailed(false);
    if (typeof window !== 'undefined') localStorage.setItem(MODE_STORAGE_KEY, newMode);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', newMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFreeError = (errorCode: number) => {
    console.error('Free stream failed:', errorCode);
    setFreeStreamFailed(true);
    toast({ message: 'This video is restricted or unavailable. Try searching for it on a streaming service.', type: 'info' });
  };


  const handleP2PError = (err: string) => {
    console.error('P2P Error:', err);
    const index = availableModes.indexOf('torrent');
    const next = availableModes[index + 1];
    if (!next || next === mode) return;
    toast({ message: `P2P failed — switching to ${next} mode`, type: 'info' });
    handleModeChange(next);
  };

  if (isPartyEnded) {
    return <EndPartyScreen title={title} tmdbId={tmdbId} mediaType={mediaType} posterPath={posterPath || backdrop} />;
  }

  // Determine what the player area renders
  const renderPlayer = () => {
    if (mode === 'torrent' && P2P_ENABLED && torrents.length > 0) {
      return (
        <TorrentPlayer
          magnetUri={torrents.find(t => t.quality === selectedQuality)?.magnetUri ?? torrents[0].magnetUri}
          title={title}
          quality={selectedQuality}
          startTime={typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('t')) || 0 : 0}
          onProgress={handleProgress}
          onError={handleP2PError}
        />
      );
    }

    if (mode === 'free' && activeFreeId && !freeStreamFailed) {
      return (
        <div className="relative w-full h-full bg-black">
          <YouTubePlayer
            ref={youtubeRef}
            videoId={activeFreeId}
            title={title}
            startTime={typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('t')) || 0 : 0}
            onProgress={handleProgress}
            onBuffering={setIsBuffering}
            onError={handleFreeError}
          />
          <div className="absolute bottom-6 left-6 z-30"><ReportButton videoId={activeFreeId} title={title} /></div>
        </div>
      );
    }

    // Free stream failed — show helpful message
    if (mode === 'free' && freeStreamFailed) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#090514] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-white font-black uppercase tracking-wider">Video Restricted</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              This video is restricted in your region or unavailable for embedding. Find it on a streaming service.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <a
              href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
            >
              <ExternalLink size={14} />
              Find on JustWatch
            </a>
          </div>
        </div>
      );
    }

    if (mode === 'hd') {
      return <NoContentPlaceholder title={title} />;
    }

    // Nothing available at all
    return <NoContentPlaceholder title={title} />;
  };

  return (
    <div className="flex flex-col gap-6">
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

      {P2P_ENABLED && mode === 'torrent' && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-linear-to-r from-[--flx-purple]/10 via-[--flx-cyan]/5 to-[--flx-purple]/10 border border-white/10 text-center sm:text-left">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
            <span className="text-[--flx-cyan] font-black">P2P Demo Mode</span>
            {' '}— Content streamed via BitTorrent network
          </p>
          <span className="shrink-0 px-3 py-1 rounded-lg bg-[--flx-purple]/20 border border-[--flx-purple]/30 text-[--flx-purple] text-[9px] font-black uppercase tracking-[2px] whitespace-nowrap">
            Investor Preview
          </span>
        </div>
      )}

      <div className={cn(
        "relative w-full aspect-video rounded-[32px] overflow-hidden bg-[#090514] shadow-2xl border border-white/5 group transition-all duration-700",
        isCinemaMode ? "z-50 shadow-[0_0_100px_rgba(0,0,0,0.8)] scale-[1.02]" : "z-10"
      )}>

        {renderPlayer()}

        {/* Buffering Overlay */}
        <AnimatePresence>
          {bufferingParticipants.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-[--flx-cyan] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="text-[--flx-cyan] animate-pulse" size={24} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bebas tracking-[4px] text-white">Waiting for Others...</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[2px]">
                  {bufferingParticipants.join(', ')} {bufferingParticipants.length === 1 ? 'is' : 'are'} buffering
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ReactionOverlay tmdbId={tmdbId} currentTime={currentTime} />

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

        {/* Top Navigation Bar — mode selector */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-start justify-between pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <div className="flex p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl w-fit">
              {P2P_ENABLED && imdbId && torrentLoading && (
                <span className="flex items-center gap-2 px-4 py-2 text-white/30 text-[10px] font-bold tracking-widest cursor-wait">
                  <Loader2 size={12} className="animate-spin" />HD STREAM
                </span>
              )}
              {P2P_ENABLED && torrents.length > 0 ? (
                <button
                  onClick={() => handleModeChange('torrent')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                    mode === 'torrent' ? "bg-linear-to-r from-[--flx-cyan] to-[--flx-purple] text-white shadow-lg" : "text-white/60 hover:text-white"
                  )}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  HD STREAM
                </button>
              ) : (!P2P_ENABLED || !torrentLoading) ? (
                <button
                  onClick={() => handleModeChange('hd')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                    mode === 'hd' ? "bg-linear-to-r from-[--flx-cyan] to-[--flx-purple] text-white shadow-lg" : "text-white/60 hover:text-white"
                  )}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  HD STREAM
                </button>
              ) : null}
              {activeFreeId && (
                <button
                  onClick={() => { setFreeStreamFailed(false); handleModeChange('free'); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                    mode === 'free' ? "bg-[--flx-cyan] text-black shadow-lg" : "text-white/60 hover:text-white"
                  )}
                >
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  YOUTUBE
                </button>
              )}
            </div>

            {mode === 'torrent' && torrents.length > 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl w-fit"
              >
                {['2160p', '1080p', '720p'].filter(q => torrents.some(t => t.quality === q)).map(q => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuality(q)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all",
                      selectedQuality === q ? "bg-white/20 text-white" : "text-white/40 hover:text-white"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="pointer-events-auto">
            <button
              onClick={() => setIsCinemaMode(!isCinemaMode)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-bold tracking-widest transition-all",
                isCinemaMode ? "bg-white text-black" : "bg-black/40 text-white hover:bg-black/60"
              )}
            >
              <Monitor size={12} />CINEMA
            </button>
          </div>
        </div>

        <SceneAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} title={title} timestamp={currentTime} plotContext={overview} />
        <SkipPrompt
          currentTime={currentTime}
          segments={skipSegments}
          onSkip={(to) => { if (youtubeRef.current) { youtubeRef.current.seekTo(to); logSkipEvent(tmdbId, 'manual'); } }}
          onAlwaysSkip={async () => { setAutoSkipEnabled(true); await updatePlaybackPreference('auto_skip_intros', true); }}
        />
      </div>

      {/* NOW PLAYING INFO BAR */}
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
            <span>{duration > 0 ? `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')} / ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : 'Live Stream'}</span>
          </div>
          <div className="relative h-1.5 w-full bg-white/5 rounded-full">
            <ReactionHeatmap tmdbId={tmdbId} duration={duration} />
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-purple] bg-size-[200%_100%] animate-shimmer rounded-full transition-all"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '100%' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ReactionToggle />
          <button
            onClick={() => setIsAssistantOpen(prev => !prev)}
            className={cn(
              "p-3 rounded-xl transition-all",
              isAssistantOpen ? "bg-[--flx-purple]/20 text-[--flx-purple]" : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-[--flx-purple]"
            )}
            title="AI Advisor (?)"
          >
            <Sparkles size={18} />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"><Info size={18} /></button>
        </div>
      </div>
    </div>
  );
}