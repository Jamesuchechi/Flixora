'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, SkipForward, Tv, Server, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { YouTubePlayer } from './YouTubePlayer';

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
}
const SERVERS = [
  { id: 'vidsrc_to', name: 'Server 1 (Clean)', url: 'https://vidsrc.to/embed/' },
  { id: 'embed_su', name: 'Server 2 (Multi)', url: 'https://embed.su/embed/' },
  { id: 'vidsrc', name: 'Server 3 (Legacy)', url: 'https://vidsrc.xyz/embed/' },
];

export function VideoPlayer({
  tmdbId,
  mediaType,
  title,
  season,
  episode,
  youtubeId,
  fullFilmYoutubeId,
  nextEpisodeUrl
}: VideoPlayerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'player' | 'trailer' | 'free'>(
    fullFilmYoutubeId ? 'free' : 'player'
  );
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [showServerList, setShowServerList] = useState(false);

  // Generate the professional embed URL using TMDB ID and selected Server
  const getStreamUrl = () => {
    const base = activeServer.url;
    const type = mediaType === 'tv' ? 'tv' : 'movie';
    
    if (mediaType === 'tv') {
      return `${base}${type}/${tmdbId}/${season}/${episode}`;
    }
    return `${base}${type}/${tmdbId}`;
  };

  return (
    <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-[#090514] shadow-2xl border border-white/5 group">
      
      {/* Player Modes */}
      {mode === 'player' ? (
        <div className="w-full h-full relative">
          <iframe
            key={`${activeServer.id}-${tmdbId}-${season}-${episode}`}
            src={getStreamUrl()}
            title={`Video player for ${title}`}
            className="w-full h-full border-none z-10 relative"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
          
          {/* AdGuard Overlay (Temporary) */}
          <div className="absolute inset-0 z-11 pointer-events-none flex items-center justify-center animate-out fade-out fill-mode-forwards duration-1000 delay-3000">
             <div className="bg-black/80 backdrop-blur-md px-8 py-5 rounded-[24px] border border-white/10 text-center space-y-2 pointer-events-auto">
                <div className="flex justify-center gap-2 mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse delay-100" />
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-200" />
                </div>
                <h5 className="text-[10px] font-black uppercase tracking-[4px] text-[--flx-cyan]">Cinematic Guard Active</h5>
                <p className="text-[11px] text-white/70 max-w-[280px]">Third-party server loading. If a pop-up appears, close it once to resume your cinematic experience.</p>
             </div>
          </div>
        </div>
      ) : mode === 'free' && fullFilmYoutubeId ? (
        <div className="relative w-full h-full bg-black">
          <YouTubePlayer 
            videoId={fullFilmYoutubeId} 
            title={title} 
          />
        </div>
      ) : (
        /* Trailer Mode (YouTube) */
        <div className="relative w-full h-full bg-black">
          {youtubeId ? (
            <YouTubePlayer 
              videoId={youtubeId} 
              title={title} 
              onEnd={() => setMode('player')} 
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
            {fullFilmYoutubeId && (
              <button 
                onClick={() => setMode('free')}
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
              onClick={() => setMode('player')}
              aria-label="Switch to movie stream"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                mode === 'player' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <Play size={12} fill={mode === 'player' ? "black" : "none"} />
              STREAM
            </button>
            <button 
              onClick={() => setMode('trailer')}
              aria-label="Switch to trailer"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                mode === 'trailer' ? "bg-[--flx-purple] text-white shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              <Tv size={12} />
              TRAILER
            </button>
          </div>

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
                      onClick={() => {
                        setActiveServer(server);
                        setShowServerList(false);
                      }}
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
          className="absolute bottom-8 right-8 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-95 group/next shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-500"
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
    </div>
  );
}
