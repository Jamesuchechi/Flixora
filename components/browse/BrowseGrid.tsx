'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface BrowseGridProps {
  initialItems: (TMDBMovie | TMDBTVShow)[];
  genres: { id: number; name: string }[];
  type: 'movie' | 'tv';
}

export function BrowseGrid({ initialItems, genres, type }: BrowseGridProps) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFirstMount = useRef(true);

  // Filter items by genre
  useEffect(() => {
    // Skip the very first run since we have initialItems
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const fetchFiltered = async () => {
      setLoading(true);
      setPage(1);
      try {
        const data = activeGenre 
          ? (type === 'movie' 
              ? await tmdb.movies.byGenre(activeGenre.toString(), '1')
              : await tmdb.movies.byGenre(activeGenre.toString(), '1'))
          : (type === 'movie' ? await tmdb.movies.popular('1') : await tmdb.tv.popular('1'));
        
        setItems(data.results);
        setHasMore(data.page < data.total_pages);
      } catch (err) {
        console.error('Filter failed:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiltered();
  }, [activeGenre, type]);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      let data;
      if (activeGenre) {
        data = type === 'movie' 
          ? await tmdb.movies.byGenre(activeGenre.toString(), nextPage.toString())
          : await tmdb.movies.byGenre(activeGenre.toString(), nextPage.toString()); // TMDB discover works similarly
      } else {
        data = type === 'movie' ? await tmdb.movies.popular(nextPage.toString()) : await tmdb.tv.popular(nextPage.toString());
      }
      
      setItems(prev => [...prev, ...data.results]);
      setPage(nextPage);
      setHasMore(data.page < data.total_pages);
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Genre Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
        <button
          onClick={() => setActiveGenre(null)}
          className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all shrink-0 border ${
            activeGenre === null 
              ? 'bg-[--flx-purple] border-[--flx-purple] text-white shadow-[0_10px_20px_rgba(139,92,246,0.3)]' 
              : 'bg-white/5 border-white/5 text-[--flx-text-3] hover:border-white/20'
          }`}
        >
          All Genres
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.id)}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all shrink-0 border ${
              activeGenre === genre.id 
                ? 'bg-[--flx-purple] border-[--flx-purple] text-white shadow-[0_10px_20px_rgba(139,92,246,0.3)]' 
                : 'bg-white/5 border-white/5 text-[--flx-text-3] hover:border-white/20'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {items.map((item, i) => {
          const title = type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
          const date = type === 'movie' ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date;
          
          return (
            <Link 
              key={`${item.id}-${i}`} 
              href={`/${type === 'movie' ? 'movies' : 'series'}/${item.id}`} 
              className="group animate-fade-up"
              style={{ animationDelay: `${(i % 12) * 50}ms` }}
            >
              <div className="relative aspect-2/3 rounded-2xl overflow-hidden mb-3 bg-[--flx-surface-2] border border-white/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:border-[--flx-purple]/30">
                <Image
                  src={tmdb.image(item.poster_path, 'w342')}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <div className="w-12 h-12 rounded-full bg-[--flx-purple] flex items-center justify-center shadow-xl shadow-[--flx-purple]/40 active:scale-90 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                   </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[13px] font-semibold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors">{title}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[--flx-text-3] uppercase tracking-tighter">
                  <span className="text-[--flx-gold]">★ {item.vote_average.toFixed(1)}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span>{getYear(date)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Loading & Load More */}
      <div className="pt-10 pb-20 flex flex-col items-center gap-6">
        {loading && <Spinner size="lg" />}
        
        {!loading && hasMore && (
          <button 
            onClick={loadMore}
            className="px-10 py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-[3px] text-[--flx-text-2] hover:text-white hover:bg-white/10 hover:border-[--flx-purple]/40 hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
            Load More Titles
          </button>
        )}

        {!hasMore && (
          <p className="text-xs font-bold uppercase tracking-widest text-[--flx-text-3]">
            You&apos;ve reached the end of the collection
          </p>
        )}
      </div>
    </div>
  );
}
