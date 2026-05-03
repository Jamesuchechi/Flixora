'use client';

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, getYear, BLUR_DATA_URL } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Settings, LogOut, Camera, Calendar, User, Heart, Clock, Play } from 'lucide-react';
import { getUserProfile, signOut } from '@/lib/supabase/actions/auth';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/types/supabase';
import { tmdb } from '@/lib/tmdb';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history' | 'settings'>('watchlist');
  
  const watchlist = useStore((s) => s.watchlist);

  useEffect(() => {
    async function loadData() {
      const data = await getUserProfile();
      if (data) {
        setUser(data.user);
        setProfile(data.profile);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const TABS = [
    { id: 'watchlist', label: 'Watchlist', icon: Heart },
    { id: 'history',   label: 'History',   icon: Clock },
    { id: 'settings',  label: 'Settings',  icon: Settings },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[--flx-cyan] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[--flx-text-3] uppercase tracking-[4px]">Loading Profile</p>
      </div>
    );
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      
      {/* ── BANNER AREA (X Inspired) ── */}
      <div className="relative h-[200px] md:h-[300px] w-full overflow-hidden bg-linear-to-br from-[#1a1333] to-[#090514]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(34,211,238,0.1),transparent_70%)]" />
        <div className="absolute inset-0 opacity-40">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center" 
            style={{ 
              backgroundImage: profile?.cover_url 
                ? `url(${profile.cover_url})` 
                : "url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')" 
            }} 
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[--flx-bg] to-transparent" />
      </div>

      {/* ── PROFILE HEADER ── */}
      <div className="container mx-auto px-6 md:px-12">
        <div className="relative -mt-16 md:-mt-24 mb-12 flex flex-col md:flex-row md:items-end gap-6">
          
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] p-1 shadow-2xl">
              <div className="w-full h-full rounded-[38px] bg-[--flx-bg] flex items-center justify-center text-4xl md:text-6xl font-bebas text-white overflow-hidden relative">
                 {profile?.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  ) : (
                    initials
                  )}
                  <Link href="/settings" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10">
                     <Camera className="text-white" size={32} />
                  </Link>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[--flx-cyan] border-4 border-[--flx-bg] flex items-center justify-center shadow-lg">
               <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-3 pb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="font-bebas text-5xl md:text-6xl tracking-tight text-[--flx-text-1] uppercase">
                {profile?.username || user?.email?.split('@')[0] || 'Member'}
              </h1>
              <Badge variant="cyan" className="self-start px-3 py-1 text-[10px]">PREMIUM ACTIVE</Badge>
            </div>

            {profile?.bio && (
              <p className="text-sm text-[--flx-text-2] max-w-xl leading-relaxed italic">
                &quot;{profile.bio}&quot;
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-[--flx-text-3] uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <User size={14} className="text-[--flx-purple]" />
                  <span>{user?.email}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[--flx-purple]" />
                  <span>Joined {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-2">
             <Link 
                href="/settings"
                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer"
             >
                Edit Profile
             </Link>
             <button 
                onClick={() => signOut()}
                className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
             >
                <LogOut size={20} />
             </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-8 border-b border-white/5 mb-12 overflow-x-auto scrollbar-hide">
           {TABS.map(({ id, label, icon: Icon }) => (
             <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative pb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] transition-all cursor-pointer",
                  activeTab === id ? "text-[--flx-cyan]" : "text-[--flx-text-3] hover:text-[--flx-text-2]"
                )}
             >
                <Icon size={14} />
                {label}
                {activeTab === id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--flx-cyan] shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                  />
                )}
             </button>
           ))}
        </div>

        {/* ── CONTENT (Netflix Inspired) ── */}
        <div className="space-y-16">
          {activeTab === 'watchlist' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               {watchlist.length === 0 ? (
                 <EmptyState 
                    title="Your list is waiting" 
                    desc="Start adding your favorite movies and series to keep track of them."
                    icon={Heart}
                 />
               ) : (
                 <WatchlistGrid ids={watchlist} />
               )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <EmptyState 
                  title="No viewing history" 
                  desc="Movies and series you watch will appear here so you can pick up where you left off."
                  icon={Clock}
               />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-lg font-bebas tracking-wider text-[--flx-text-1]">Account Settings</h3>
                     <div className="bg-white/5 rounded-3xl p-8 border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                           <div>
                              <p className="text-sm font-bold text-[--flx-text-2]">Email Notifications</p>
                              <p className="text-[11px] text-[--flx-text-3]">Get updates about new releases and suggestions.</p>
                           </div>
                           <div className="w-12 h-6 bg-[--flx-purple]/40 rounded-full relative p-1 cursor-pointer">
                              <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                           </div>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between items-center">
                           <div>
                              <p className="text-sm font-bold text-[--flx-text-2]">Autoplay Next Episode</p>
                              <p className="text-[11px] text-[--flx-text-3]">Automatically play the next episode in a series.</p>
                           </div>
                           <div className="w-12 h-6 bg-[--flx-cyan] rounded-full relative p-1 cursor-pointer">
                              <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-red-500/5 rounded-3xl p-8 border border-red-500/10 space-y-4">
                    <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
                    <p className="text-[11px] text-[--flx-text-3]">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="px-6 py-3 rounded-xl border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                      Delete Account
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, desc, icon: Icon }: { title: string; desc: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center max-w-sm mx-auto space-y-6">
      <div className="w-20 h-20 rounded-[30px] bg-white/5 border border-white/10 flex items-center justify-center text-[--flx-text-3] relative overflow-hidden group">
         <Icon size={32} className="relative z-10 group-hover:scale-110 transition-transform" />
         <div className="absolute inset-0 bg-linear-to-br from-[--flx-purple]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bebas tracking-wider text-[--flx-text-1] uppercase">{title}</h3>
        <p className="text-sm text-[--flx-text-3] leading-relaxed">{desc}</p>
      </div>
      <Link href="/movies" className="flex items-center gap-2.5 bg-white text-black font-bold text-[11px] uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
        Explore Content
      </Link>
    </div>
  );
}

function WatchlistGrid({ ids }: { ids: number[] }) {
  const [data, setData] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const results = await Promise.all(
          ids.map(id => tmdb.movies.detail(id, { silent: true }).catch(() => tmdb.tv.detail(id, { silent: true }).catch(() => null)))
        );
        setData(results.filter((item): item is (TMDBMovie | TMDBTVShow) => item !== null));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [ids]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: ids.length }).map((_, i) => <MovieCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {data.map((item, i) => {
        const isMovie = 'title' in item;
        const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
        const date = isMovie ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date;

        return (
          <Link 
            key={item.id} 
            href={`/${isMovie ? 'movies' : 'series'}/${item.id}`}
            className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="relative aspect-2/3 rounded-2xl overflow-hidden bg-[--flx-surface-2] border border-white/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] group-hover:border-[--flx-purple]/40">
               <Image 
                  src={tmdb.image(item.poster_path, 'w342')} 
                  alt={title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 200px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
               />
               <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mb-2">
                     <Play size={14} fill="black" className="ml-0.5" />
                  </div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">{isMovie ? 'Movie' : 'Series'}</p>
               </div>
            </div>
            <div className="mt-3 px-1">
              <h4 className="text-[12px] font-bold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors">{title}</h4>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] text-[--flx-gold] font-bold">★ {item.vote_average.toFixed(1)}</span>
                 <span className="text-[10px] text-[--flx-text-3] font-bold tracking-tighter">{getYear(date)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
