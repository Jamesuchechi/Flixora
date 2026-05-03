'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';
import { cn, getYear, BLUR_DATA_URL } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { MovieCardTrailer } from './MovieCardTrailer';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  rating: number;
  releaseDate?: string;
  mediaType?: 'movie' | 'tv';
  rank?: number;
  isFree?: boolean;
  className?: string;
}

export function MovieCard({
  id, title, posterPath, rating, releaseDate,
  mediaType = 'movie', rank, isFree, className,
}: MovieCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const isInWatchlist   = useStore((s) => s.isInWatchlist);
  const addToWatchlist  = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  const saved = isInWatchlist(id);
  const href  = `/${mediaType === 'tv' ? 'series' : 'movies'}/${id}${isFree ? '?mode=free' : ''}`;

  return (
    <div 
      className={cn('shrink-0 w-[140px] group cursor-pointer snap-start', className)}
      onMouseEnter={() => {
        setIsHovered(true);
        router.prefetch(href);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href}>
        <div className="relative w-[140px] h-[210px] rounded-xl overflow-hidden mb-2.5 transition-transform duration-200 group-hover:-translate-y-1">
          <Image
            src={tmdb.image(posterPath, 'w342')}
            alt={title}
            fill
            className="object-cover"
            sizes="140px"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />

          {/* Hover Trailer Preview */}
          <MovieCardTrailer 
            key={`trailer-${id}-${isHovered}`}
            id={id} 
            mediaType={mediaType} 
            isVisible={isHovered} 
          />

          {/* Rank ghost number */}
          {rank && (
            <span className="absolute top-2 left-2.5 font-bebas text-3xl leading-none text-white/10 select-none z-20">
              {rank}
            </span>
          )}

          {/* Free Badge */}
          {isFree && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-[--flx-purple] text-[8px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-tighter shadow-lg">
                Free
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[--flx-bg]/75 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl z-20">
            <div className="w-11 h-11 rounded-full bg-[--flx-purple]/90 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <span className="text-[10px] text-white/70 tracking-wide">Play</span>
          </div>

          {/* Watchlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (saved) {
                removeFromWatchlist(id);
              } else {
                addToWatchlist(id);
              }
            }}
            aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
            className={cn(
              'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-30',
              'opacity-0 group-hover:opacity-100',
              saved
                ? 'bg-[--flx-pink]/90 text-white'
                : 'bg-black/60 text-white/70 hover:text-white'
            )}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <p className="text-[12px] font-medium text-[--flx-text-1] truncate mb-0.5">{title}</p>
        <div className="flex items-center gap-1.5 text-[10px] text-[--flx-text-3]">
          <span className="text-[--flx-gold] font-semibold">★ {rating.toFixed(1)}</span>
          {releaseDate && <span>{getYear(releaseDate)}</span>}
        </div>
      </Link>
    </div>
  );
}
