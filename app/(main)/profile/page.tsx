'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Settings, LogOut, Camera, Calendar, User, Clock } from 'lucide-react';
import { getUserProfile, signOut } from '@/lib/supabase/actions/auth';
import { getWatchlist } from '@/lib/supabase/actions/watchlist';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/types/supabase';
import { Sparkles, Trophy, Flame, ChevronRight, Play } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ films: 0, series: 0, lists: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

  useEffect(() => {
    async function loadData() {
      const [profileData, watchlist] = await Promise.all([
        getUserProfile(),
        getWatchlist()
      ]);

      if (profileData) {
        setUser(profileData.user);
        setProfile(profileData.profile);
      }

      // Calculate stats
      const films = watchlist.filter(i => i.media_type === 'movie').length;
      const series = watchlist.filter(i => i.media_type === 'tv').length;
      setStats({ films, series, lists: 0 }); // Lists TBD in future update
      
      setLoading(false);
    }
    loadData();
  }, []);

  const TABS = [
    { id: 'history',   label: 'Cinema Identity',   icon: Clock },
    { id: 'settings',  label: 'Account Access',  icon: Settings },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[--flx-cyan] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[--flx-text-3] uppercase tracking-[4px]">Syncing Identity</p>
      </div>
    );
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      
      {/* ── CINEMATIC BANNER ── */}
      <div className="relative h-[240px] md:h-[340px] w-full overflow-hidden">
        {profile?.cover_url ? (
          <Image 
            src={profile.cover_url} 
            alt="Cover" 
            fill 
            className="object-cover opacity-60" 
            unoptimized 
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-[--flx-purple] via-[--flx-pink] to-[--flx-cyan] animate-banner opacity-40" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0)_0%,var(--flx-bg)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[--flx-bg] to-transparent" />
      </div>

      {/* ── PROFILE HEADER ── */}
      <div className="container mx-auto px-6 md:px-12">
        <div className="relative -mt-20 md:-mt-28 mb-12 flex flex-col md:flex-row md:items-end gap-8">
          
          {/* Avatar with Online Ring */}
          <div className="relative group">
            <div className="relative w-36 h-36 md:w-48 md:h-48 flex items-center justify-center">
              {/* Animated Ring */}
              <div className="absolute inset-0 rounded-[48px] bg-linear-to-tr from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] animate-avatar-rotate opacity-70 blur-[2px]" />
              <div className="absolute inset-[3px] rounded-[45px] bg-[--flx-bg] z-0" />
              
              <div className="w-[calc(100%-12px)] h-[calc(100%-12px)] rounded-[42px] bg-[--flx-surface-1] flex items-center justify-center text-4xl md:text-6xl font-bebas text-white overflow-hidden relative z-10 border border-white/5 shadow-2xl">
                 {profile?.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      unoptimized 
                    />
                  ) : (
                    <span className="group-hover:scale-110 transition-transform duration-500">{initials}</span>
                  )}
                  <Link href="/settings" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-20 backdrop-blur-xs">
                     <Camera className="text-white" size={32} />
                  </Link>
              </div>
            </div>
            {/* Status Indicator */}
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 border-[3px] border-[--flx-bg] z-30 shadow-lg" />
          </div>

          {/* User Info & Stats */}
          <div className="flex-1 space-y-5 pb-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="font-bebas text-5xl md:text-7xl tracking-tighter text-white uppercase">
                  {profile?.username || user?.email?.split('@')[0] || 'Member'}
                </h1>
                <div className="relative overflow-hidden px-3 py-1 bg-linear-to-r from-[--flx-gold]/20 to-transparent border border-[--flx-gold]/30 rounded-lg group">
                   <span className="text-[10px] font-black tracking-widest text-[--flx-gold] uppercase relative z-10">Premium Active</span>
                   <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-badge-shimmer -translate-x-full" />
                </div>
              </div>
              
              {/* Stats Bar */}
              <div className="flex items-center gap-4 py-2">
                 {[
                   { label: 'Films', value: stats.films, color: 'text-[--flx-cyan]' },
                   { label: 'Series', value: stats.series, color: 'text-[--flx-purple]' },
                   { label: 'Lists', value: stats.lists, color: 'text-[--flx-pink]' },
                 ].map((s, i) => (
                   <div key={s.label} className="flex items-center gap-2">
                      <span className={cn("text-lg font-bebas tracking-wider", s.color)}>{s.value}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</span>
                      {i < 2 && <span className="w-1 h-1 rounded-full bg-white/10 ml-2" />}
                   </div>
                 ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-[10px] font-black text-white/40 uppercase tracking-[3px]">
               <div className="flex items-center gap-2 group cursor-default">
                  <User size={14} className="text-[--flx-purple] group-hover:scale-125 transition-transform" />
                  <span className="group-hover:text-white transition-colors">{user?.email}</span>
               </div>
               <div className="flex items-center gap-2 group cursor-default">
                  <Calendar size={14} className="text-[--flx-cyan] group-hover:scale-125 transition-transform" />
                  <span className="group-hover:text-white transition-colors">Joined {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
               </div>
            </div>
            
            <Link href="/wrapped">
              <button className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[--flx-cyan]/30 hover:bg-white/10 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-[--flx-purple]/10 to-[--flx-cyan]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles size={14} className="text-[--flx-gold] group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[3px] text-white/60 group-hover:text-white transition-colors">
                  {new Date().getFullYear()} Wrapped
                </span>
                <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-3 pb-4">
             <Link 
                href="/settings"
                className="px-8 py-4 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[2px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
             >
                Settings
             </Link>
             <button 
                onClick={() => signOut()}
                className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-red-500/20"
             >
                <LogOut size={22} />
             </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-10 border-b border-white/5 mb-16 overflow-x-auto scrollbar-hide">
           {TABS.map(({ id, label, icon: Icon }) => (
             <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative pb-6 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[3px] transition-all cursor-pointer",
                  activeTab === id ? "text-[--flx-cyan]" : "text-white/30 hover:text-white"
                )}
             >
                <Icon size={16} />
                {label}
                {activeTab === id && (
                  <motion.div 
                    layoutId="activeTabProfile"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[--flx-cyan] shadow-[0_0_20px_rgba(34,211,238,0.5)] rounded-t-full" 
                  />
                )}
             </button>
           ))}
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="min-h-[400px]">
          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
               {/* Cinema DNA Teaser (Improved Empty State) */}
               <div className="max-w-4xl mx-auto space-y-12">
                  <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-[--flx-surface-1] p-12 group">
                     <div className="absolute inset-0 bg-linear-to-br from-[--flx-purple]/10 via-transparent to-[--flx-cyan]/10 opacity-50" />
                     <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                        <Sparkles size={120} className="text-[--flx-cyan]" />
                     </div>

                     <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2 space-y-6">
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-[--flx-purple]/20 border border-[--flx-purple]/30 rounded-full text-[9px] font-black uppercase tracking-widest text-[--flx-purple]">
                              <Trophy size={12} />
                              Unlock your profile
                           </div>
                           <h2 className="font-bebas text-5xl md:text-6xl text-white tracking-tight uppercase leading-none">Your Cinema DNA</h2>
                           <p className="text-sm text-white/40 leading-relaxed max-w-sm">
                              Start watching to unlock your personalized taste graph, deep analytics, and cinematic badges. Your viewing habits define your identity.
                           </p>
                           <Link href="/home" className="inline-flex items-center gap-3 bg-[--flx-cyan] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[--flx-cyan]/20">
                              <Play size={16} fill="black" />
                              Start Your Journey
                           </Link>
                        </div>

                        {/* Blurred DNA Preview */}
                        <div className="w-full md:w-1/2 relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-black/40 backdrop-blur-3xl p-6 group-hover:border-[--flx-cyan]/30 transition-all">
                           <div className="absolute inset-0 bg-linear-to-br from-[--flx-purple]/20 to-[--flx-cyan]/20 blur-3xl" />
                           <div className="relative h-full flex flex-col justify-between filter blur-md grayscale select-none opacity-40">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-2">
                                    <div className="w-24 h-4 bg-white/20 rounded-full" />
                                    <div className="w-40 h-8 bg-white/20 rounded-full" />
                                 </div>
                                 <div className="w-16 h-16 rounded-full bg-white/20" />
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                 {[1,2,3,4].map(i => <div key={i} className="aspect-2/3 bg-white/10 rounded-lg" />)}
                              </div>
                           </div>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-4">
                                 <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-xl">
                                    <Clock size={32} className="text-white/40" />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Locked Content</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Recently Rated Section Teaser */}
                  <div className="space-y-8 pt-8">
                     <div className="flex items-center gap-4">
                        <Flame className="text-[--flx-pink]" size={20} />
                        <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Recently Rated</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none">
                        {[1,2,3].map(i => (
                          <div key={i} className="p-6 rounded-3xl bg-white/3 border border-white/5 flex items-center gap-4">
                             <div className="w-12 h-16 bg-white/5 rounded-lg shrink-0" />
                             <div className="space-y-2">
                                <div className="w-24 h-3 bg-white/10 rounded-full" />
                                <div className="flex gap-1 text-[--flx-gold]">★★★★★</div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 mx-auto">
               <div className="space-y-12">
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/40 ml-4">Quick Preferences</h3>
                     <div className="bg-[--flx-surface-1] rounded-[40px] p-10 border border-white/10 space-y-8 shadow-2xl">
                        <div className="flex justify-between items-center group cursor-pointer">
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-white group-hover:text-[--flx-cyan] transition-colors">Email Notifications</p>
                              <p className="text-[11px] text-white/30 font-medium leading-relaxed">Receive personalized weekly movie picks.</p>
                           </div>
                           <div className="w-12 h-6 bg-white/10 rounded-full relative p-1 transition-all border border-white/5">
                              <div className="w-4 h-4 bg-white/20 rounded-full" />
                           </div>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between items-center group cursor-pointer">
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-white group-hover:text-[--flx-cyan] transition-colors">Autoplay Next Episode</p>
                              <p className="text-[11px] text-white/30 font-medium leading-relaxed">Seamlessly transition between series episodes.</p>
                           </div>
                           <div className="w-12 h-6 bg-[--flx-cyan] rounded-full relative p-1 transition-all border border-[--flx-cyan]/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                              <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="p-10 rounded-[40px] border border-red-500/20 bg-red-500/5 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Security Warning</h3>
                      <p className="text-[11px] text-white/30 leading-relaxed uppercase tracking-widest font-bold">Once you delete your account, your cinematic identity will be lost forever.</p>
                    </div>
                    <Link href="/settings" className="inline-flex px-8 py-4 rounded-2xl border border-red-500/30 text-[10px] font-black text-red-400 uppercase tracking-[2px] hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                      Enter Danger Zone
                    </Link>
                  </div>

                  <div className="py-8 text-center">
                     <Link href="/settings" className="text-[10px] font-black uppercase tracking-[4px] text-[--flx-cyan] hover:opacity-70 transition-all inline-flex items-center gap-2">
                        View Full Settings
                        <ChevronRight size={14} />
                     </Link>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
