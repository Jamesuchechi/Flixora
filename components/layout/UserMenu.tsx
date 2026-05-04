'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserProfile, signOut } from '@/lib/supabase/actions/auth';
import type { Profile } from '@/types/supabase';
import type { User } from '@supabase/supabase-js';

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const data = await getUserProfile();
      if (data) {
        setUser(data.user);
        setProfile(data.profile);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  if (loading) {
    return <div className="w-[34px] h-[34px] rounded-full bg-white/5 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link 
        href="/login" 
        className="relative group overflow-hidden"
      >
        <span className="text-xs font-black uppercase tracking-[2px] text-[--flx-cyan] transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
          Sign In
        </span>
        <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[--flx-cyan] transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
      </Link>
    );
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="group relative">
      <div className="w-[34px] h-[34px] rounded-full bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center text-xs font-semibold text-white cursor-pointer select-none transition-transform active:scale-90">
        {initials}
      </div>

      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-3 w-48 bg-[--flx-surface-1] border border-white/5 rounded-xl py-2 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
        <div className="px-4 py-2 border-b border-white/5 mb-2">
           <p className="text-xs font-bold text-[--flx-text-1] truncate">{profile?.username || 'User'}</p>
           <p className="text-[10px] text-[--flx-text-3] truncate">{user.email}</p>
        </div>
        
        <Link href="/profile" className="block px-4 py-2 text-xs text-[--flx-text-2] hover:bg-white/5 hover:text-[--flx-cyan] transition-colors">
          My Watchlist
        </Link>
        <Link href="/settings" className="block px-4 py-2 text-xs text-[--flx-text-2] hover:bg-white/5 hover:text-[--flx-cyan] transition-colors">
          Settings
        </Link>
        
        <button 
          onClick={() => signOut()}
          className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
