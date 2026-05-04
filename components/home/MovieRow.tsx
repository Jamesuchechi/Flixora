'use client';

import { useState, useRef } from 'react';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { motion } from 'framer-motion';

type MediaItem = (TMDBMovie | TMDBTVShow) & { media_type?: 'movie' | 'tv' };

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  pill?: { label: string; variant: 'live' | 'new' | 'hot' };
  seeAllHref?: string;
  showRank?: boolean;
  loading?: boolean;
  className?: string;
}

export function MovieRow({
  title, items, pill, seeAllHref, showRank, loading, className,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn('px-10 py-7 relative group', className)}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="font-bebas text-2xl md:text-3xl tracking-[3px] text-[--flx-text-1] flex items-center gap-3">
            {title}
            {pill && <Badge variant={pill.variant}>{pill.label}</Badge>}
          </h2>
          {/* Underline accent for featured rows */}
          {(showRank || pill?.variant === 'hot') && (
            <div className="h-[2px] w-12 bg-[--flx-cyan] rounded-full" />
          )}
        </div>
        
        {seeAllHref && (
          <Link 
            href={seeAllHref} 
            className="group/link flex items-center gap-1.5 text-xs text-[--flx-cyan] font-black uppercase tracking-[2px] hover:text-white transition-colors"
          >
            View all 
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              className="transition-transform duration-300 group-hover/link:translate-x-1"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        )}
      </div>

      {/* Scroll row wrapper */}
      <div className="relative group/row">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-[-40px] top-1/2 -translate-y-1/2 z-50 w-12 h-24 bg-black/40 backdrop-blur-md border-r border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex items-center justify-center hover:bg-black/60",
            !showArrows && "pointer-events-none"
          )}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-[-40px] top-1/2 -translate-y-1/2 z-50 w-12 h-24 bg-black/40 backdrop-blur-md border-l border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex items-center justify-center hover:bg-black/60",
            !showArrows && "pointer-events-none"
          )}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6 6-6"/></svg>
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth -mx-10 px-10"
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : items.map((item, i) => {
                const isMovie  = 'title' in item;
                const id       = item.id;
                const title_   = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
                const poster   = item.poster_path;
                const rating   = item.vote_average;
                const date     = isMovie
                  ? (item as TMDBMovie).release_date
                  : (item as TMDBTVShow).first_air_date;
                const mtype    = item.media_type ?? (isMovie ? 'movie' : 'tv');
                type MovieRowItem = (TMDBMovie | TMDBTVShow) & { is_free?: boolean };
                const isFree   = (item as MovieRowItem).is_free;

                return (
                  <MovieCard
                    key={id}
                    id={id}
                    title={title_}
                    posterPath={poster}
                    rating={rating}
                    releaseDate={date}
                    mediaType={mtype}
                    isFree={isFree}
                    rank={showRank ? i + 1 : undefined}
                  />
                );
              })}
        </div>
      </div>
    </motion.section>
  );
}

