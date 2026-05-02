'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStore } from '@/store/useStore';
import { tmdb } from '@/lib/tmdb';
import { signOut } from '@/lib/supabase/actions';

interface WatchlistItem {
  id:          number;
  title:       string;
  poster_path: string | null;
  media_type:  'movie' | 'tv';
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const watchlistIds  = useStore((s) => s.watchlist);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [fetching, setFetching] = useState(false);

  // Fetch poster data for watchlist IDs
  useEffect(() => {
    if (watchlistIds.length === 0) { setItems([]); return; }
    setFetching(true);
    Promise.all(
      watchlistIds.slice(0, 18).map(async (id) => {
        // Try movie first, then TV
        try {
          const m = await tmdb.movies.detail(id);
          return { id: m.id, title: m.title, poster_path: m.poster_path, media_type: 'movie' as const };
        } catch {
          try {
            const t = await tmdb.tv.detail(id);
            return { id: t.id, title: t.name, poster_path: t.poster_path, media_type: 'tv' as const };
          } catch {
            return null;
          }
        }
      })
    ).then((results) => {
      setItems(results.filter(Boolean) as WatchlistItem[]);
      setFetching(false);
    });
  }, [watchlistIds]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[--flx-purple] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[--flx-text-2]">Sign in to view your profile</p>
        <Link href="/login" className="bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  const displayName  = (user.user_metadata?.full_name as string | undefined) ?? 'Flixora User';
  const avatarUrl    = user.user_metadata?.avatar_url as string | undefined;
  const initials     = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const memberSince  = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen px-10 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <h1 className="font-['Bebas_Neue',sans-serif] text-3xl tracking-[2px] text-[--flx-text-1]">{displayName}</h1>
            <p className="text-sm text-[--flx-text-3]">{user.email}</p>
            <p className="text-xs text-[--flx-text-3] mt-1">Member since {memberSince}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg px-4 py-2 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-sm mb-10">
        {[
          { label: 'Watchlist', value: watchlistIds.length },
          { label: 'Watched',   value: 0 },
          { label: 'Hours',     value: 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[--flx-surface-1] border border-[--flx-border] rounded-2xl p-4 text-center">
            <p className="font-['Bebas_Neue',sans-serif] text-3xl text-[--flx-text-1]">{value}</p>
            <p className="text-xs text-[--flx-text-3] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Watchlist grid */}
      <div>
        <h2 className="font-['Bebas_Neue',sans-serif] text-xl tracking-[2px] text-[--flx-text-1] mb-5">My Watchlist</h2>

        {watchlistIds.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[--flx-border] rounded-2xl">
            <p className="text-2xl mb-3">🎬</p>
            <p className="text-[--flx-text-2] text-sm mb-4">Your watchlist is empty</p>
            <p className="text-[--flx-text-3] text-xs mb-6">Browse movies and series and click the heart icon to save them</p>
            <Link href="/movies" className="text-sm text-[--flx-cyan] font-medium hover:opacity-70 transition-opacity">
              Browse Movies →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {fetching
              ? watchlistIds.slice(0, 12).map((id) => (
                  <div key={id} className="aspect-[2/3] rounded-xl bg-[--flx-surface-1] animate-pulse" />
                ))
              : items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.media_type === 'tv' ? 'series' : 'movies'}/${item.id}`}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-[--flx-surface-2]">
                      <Image
                        src={tmdb.image(item.poster_path, 'w342')}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 33vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-[--flx-bg]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[--flx-purple]/90 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-[--flx-text-1] truncate">{item.title}</p>
                  </Link>
                ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
