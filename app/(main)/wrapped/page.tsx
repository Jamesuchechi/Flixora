'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Trophy, Clock, Play, Tv, Clapperboard, Share2, Download, ChevronRight, Hash, Star, User, LucideIcon } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import { Button } from '@/components/ui/Button';
import { getAllWatchProgress } from '@/lib/supabase/actions/progress';
import { getWatchlist } from '@/lib/supabase/actions/watchlist';
import { getUserProfile } from '@/lib/supabase/actions/auth';
import type { Profile, WatchProgress } from '@/types/supabase';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

interface WrappedTitle extends Partial<WatchProgress> {
  title: string;
  backdrop?: string;
}

type Personality = {
  type: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

const PERSONALITIES: Personality[] = [
  { 
    type: 'The Cinephile', 
    description: 'You live and breathe the silver screen. Your taste is as vast as the cinematic universe itself.',
    icon: Clapperboard, 
    color: 'from-purple-500 to-indigo-600'
  },
  { 
    type: 'The Serial Binger', 
    description: 'Season after season, you never look back. "One more episode" is your personal mantra.',
    icon: Tv, 
    color: 'from-cyan-500 to-blue-600'
  },
  { 
    type: 'The Compleatist', 
    description: 'If you start it, you finish it. Your watch history is a graveyard of completed masterpieces.',
    icon: Trophy, 
    color: 'from-amber-400 to-orange-600'
  },
  { 
    type: 'The Visionary', 
    description: 'You plan more than you watch. Your watchlist is a roadmap to future adventures.',
    icon: Sparkles, 
    color: 'from-pink-500 to-rose-600'
  },
  { 
    type: 'The Explorer', 
    description: 'Always looking for the next hidden gem. You go where the algorithm fears to tread.',
    icon: Hash, 
    color: 'from-emerald-500 to-teal-600'
  },
  { 
    type: 'The Midnight Streamer', 
    description: 'The world sleeps, you watch. Your best cinematic moments happen under the stars.',
    icon: Clock, 
    color: 'from-violet-600 to-fuchsia-700'
  },
  { 
    type: 'The Critic', 
    description: 'Only the best for you. Your taste is refined, selective, and uncompromisingly premium.',
    icon: Star, 
    color: 'from-yellow-400 to-amber-500'
  },
  { 
    type: 'The Main Character', 
    description: 'You watch what the world watches, and you do it with unmatched style.',
    icon: User, 
    color: 'from-blue-400 to-indigo-500'
  }
];

export default function WrappedPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalHours: 0,
    movieCount: 0,
    tvCount: 0,
    topMovies: [] as WrappedTitle[],
    personality: PERSONALITIES[0]
  });
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadStats() {
      const [profileData, progress, watchlist] = await Promise.all([
        getUserProfile(),
        getAllWatchProgress(),
        getWatchlist()
      ]);

      if (profileData) setProfile(profileData.profile);

      const movieCount = progress.filter(p => p.media_type === 'movie').length;
      const tvCount = progress.filter(p => p.media_type === 'tv').length;
      
      // Calculate Personality
      let personality = PERSONALITIES[0];
      if (tvCount > movieCount * 1.5) personality = PERSONALITIES[1];
      if (progress.every(p => p.progress === 100) && progress.length > 3) personality = PERSONALITIES[2];
      if (watchlist.length > progress.length * 2) personality = PERSONALITIES[3];

      // Fetch Top 3 Titles
      const top3 = progress.slice(0, 3);
      const enrichedTop3 = await Promise.all(
        top3.map(async (p) => {
          try {
            if (p.media_type === 'movie') {
              const detail = await tmdb.movies.detail(p.tmdb_id);
              return { 
                ...p, 
                title: detail.title, 
                backdrop: detail.backdrop_path ?? undefined 
              };
            } else {
              const detail = await tmdb.tv.detail(p.tmdb_id);
              return { 
                ...p, 
                title: detail.name, 
                backdrop: detail.backdrop_path ?? undefined 
              };
            }
          } catch {
            return { ...p, title: 'Unknown Title' };
          }
        })
      );

      setStats({
        totalTitles: progress.length,
        totalHours: Math.floor(progress.length * 2.1), // Estimated
        movieCount,
        tvCount,
        topMovies: enrichedTop3,
        personality
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#06070d',
        scale: 2,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `flixora-wrapped-${new Date().getFullYear()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download Error:', err);
    } finally {
      setSharing(false);
    }
  };

  const shareTwitter = () => {
    const text = `My ${new Date().getFullYear()} Cinematic Year on Flixora: I am ${stats.personality.type}! 🍿✨\n\n${stats.totalTitles} titles watched | ${stats.totalHours} hours of magic.\n\n#FlixoraWrapped #CinemaIdentity`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center p-10">
        <div className="w-20 h-20 border-t-2 border-[--flx-cyan] rounded-full animate-spin mb-6" />
        <p className="font-bebas text-2xl text-white tracking-[5px] animate-pulse">Compiling Your Cinematic DNA...</p>
      </div>
    );
  }

  if (stats.totalTitles < 1) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 mb-10">
           <Play size={64} />
        </div>
        <h1 className="font-bebas text-6xl text-white mb-4 uppercase tracking-tighter">Identity <span className="text-[--flx-cyan]">Incomplete</span></h1>
        <p className="text-white/40 max-w-md mx-auto mb-10 uppercase text-[11px] font-black tracking-[3px]">
           Start watching to unlock your Flixora Wrapped. Your cinema personality is waiting to be discovered.
        </p>
        <Button onClick={() => window.location.href = '/'}>
           Discover Content
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--flx-bg] py-20 px-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[500px] mb-12"
      >
        {/* ── THE CARD ── */}
        <div 
          ref={cardRef}
          className="relative aspect-9/16 w-full bg-[#06070d] rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10"
        >
          {/* Background Aurora */}
          <div className={cn("absolute inset-0 bg-linear-to-br opacity-40 blur-[80px] animate-banner", stats.personality.color)} />
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black" />

          {/* Content Wrapper */}
          <div className="relative h-full flex flex-col p-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                 <p className="font-bebas text-4xl text-white tracking-widest leading-none">FLIXORA</p>
                 <p className="text-[9px] font-black tracking-[4px] text-[--flx-cyan] uppercase opacity-70">Wrapped {new Date().getFullYear()}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                 <stats.personality.icon className="text-white" size={24} />
              </div>
            </div>

            {/* Personality Section */}
            <div className="mb-14">
               <p className="text-[10px] font-black uppercase tracking-[5px] text-white/40 mb-3">Your Identity</p>
               <h2 className={cn("font-bebas text-6xl leading-none tracking-tighter mb-4 text-transparent bg-clip-text bg-linear-to-r", stats.personality.color)}>
                  {stats.personality.type}
               </h2>
               <p className="text-sm font-medium text-white/60 leading-relaxed pr-10">
                  {stats.personality.description}
               </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-14">
               <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md">
                  <p className="text-[28px] font-bebas text-white leading-none mb-1">{stats.totalTitles}</p>
                  <p className="text-[9px] font-black uppercase tracking-[2px] text-white/30">Titles Streamed</p>
               </div>
               <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md">
                  <p className="text-[28px] font-bebas text-white leading-none mb-1">{stats.totalHours}H</p>
                  <p className="text-[9px] font-black uppercase tracking-[2px] text-white/30">Total Immersion</p>
               </div>
            </div>

            {/* Top 3 */}
            <div className="flex-1">
               <p className="text-[10px] font-black uppercase tracking-[5px] text-white/40 mb-6">Your Top Echoes</p>
               <div className="space-y-4">
                  {stats.topMovies.map((m, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bebas text-xl text-white/40 shrink-0">
                          {i + 1}
                       </div>
                       <div className="flex-1 h-12 rounded-2xl bg-white/3 border border-white/5 px-4 flex items-center">
                          <p className="text-xs font-black text-white truncate uppercase tracking-widest">{m.title}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] p-0.5">
                     <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                        {profile?.avatar_url ? (
                          <Image src={profile.avatar_url} alt="User" fill className="object-cover" unoptimized />
                        ) : (
                          <User size={14} className="text-white/40" />
                        )}
                     </div>
                  </div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">
                     {profile?.username || 'CINEMA CITIZEN'}
                  </p>
               </div>
               <p className="text-[9px] font-black text-white/20 tracking-[2px] uppercase">Flixora.io</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── CONTROLS ── */}
      <div className="flex flex-col gap-4 w-full max-w-[400px]">
        <Button 
          size="lg" 
          className="w-full h-16 group" 
          onClick={downloadCard}
          loading={sharing}
        >
          <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
          Download Wrapped Card
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" size="lg" className="h-16 group" onClick={shareTwitter}>
            <Share2 size={20} />
            Share on X
          </Button>
          <Button variant="ghost" size="lg" className="h-16 group" onClick={() => window.location.href = '/'}>
            Home
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
