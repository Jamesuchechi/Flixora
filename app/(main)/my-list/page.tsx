'use client';

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getYear, BLUR_DATA_URL } from '@/lib/utils';
import { Heart, Play, ChevronLeft } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

import { CustomListsView } from '@/components/social/CustomListsView';

export default function MyListPage() {
  const watchlist = useStore((s) => s.watchlist);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'custom'>('watchlist');

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      {/* Header Area */}
      <div className="relative pt-24 pb-12 px-10 border-b border-white/5 bg-linear-to-b from-white/2 to-transparent">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-[--flx-cyan] mb-2">
                 <Heart size={18} fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-[4px]">Your Collection</span>
              </div>
              <h1 className="font-bebas text-6xl tracking-widest text-[--flx-text-1]">My Library</h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl w-fit">
               <button 
                 onClick={() => setActiveTab('watchlist')}
                 className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'watchlist' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
               >
                 Watchlist ({watchlist.length})
               </button>
               <button 
                 onClick={() => setActiveTab('custom')}
                 className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'custom' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
               >
                 Custom Lists
               </button>
            </div>
          </div>
          
          <Link 
            href="/home" 
            className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[--flx-text-3] hover:text-[--flx-text-1] transition-colors pb-1"
          >
            <ChevronLeft size={14} />
            Back to Browse
          </Link>
        </div>
      </div>

      {/* Grid Area */}
      <div className="max-w-7xl mx-auto px-10 py-12">
        {activeTab === 'watchlist' ? (
          watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
              <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                 <Heart size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bebas tracking-wider text-[--flx-text-1] uppercase">Your watchlist is empty</h3>
                <p className="text-sm text-[--flx-text-3] max-w-xs mx-auto leading-relaxed">
                  Start adding your favorite movies and series to build your perfect library.
                </p>
              </div>
              <Link href="/home" className="px-10 py-4 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all">
                Start Browsing
              </Link>
            </div>
          ) : (
            <WatchlistGrid ids={watchlist} />
          )
        ) : (
          <CustomListsView />
        )}
      </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        {Array.from({ length: Math.max(6, ids.length) }).map((_, i) => <MovieCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 animate-in fade-in duration-700">
      {data.map((item) => {
        const isMovie = 'title' in item;
        const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
        const date = isMovie ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date;

        return (
          <Link 
            key={item.id} 
            href={`/${isMovie ? 'movies' : 'series'}/${item.id}`}
            className="group block"
          >
            <div className="relative aspect-2/3 rounded-3xl overflow-hidden bg-[--flx-surface-2] border border-white/5 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] group-hover:border-[--flx-cyan]/30">
               <Image 
                  src={tmdb.image(item.poster_path, 'w500')} 
                  alt={title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 250px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
               />
               <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <div className="w-10 h-10 rounded-full bg-[--flx-cyan] flex items-center justify-center mb-3 shadow-lg">
                     <Play size={16} fill="black" className="ml-1" />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-[2px]">{isMovie ? 'Movie' : 'Series'}</p>
               </div>
            </div>
            <div className="mt-4 px-1">
              <h4 className="text-[14px] font-bold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors">{title}</h4>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[11px] text-[--flx-gold] font-black">★ {item.vote_average.toFixed(1)}</span>
                 <span className="text-[11px] text-[--flx-text-3] font-bold tracking-tighter">{getYear(date)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
