'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, getYear } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { MovieCardTrailer } from './MovieCardTrailer';
import { useSound } from '@/hooks/useSound';
import { TmdbImage } from '../shared/TmdbImage';
import { toggleWatchlist } from '@/lib/supabase/actions/watchlist';

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
  const { playPop } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const saved         = useStore((s) => s.watchlist.includes(id));
  const addToWatchlist  = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  const href  = `/${mediaType === 'tv' ? 'series' : 'movies'}/${id}${isFree ? '?mode=free' : ''}`;

  // Netflix-style match score based on rating
  const matchScore = Math.min(98, Math.floor(rating * 10) + (id % 5));

  return (
    <div 
      className={cn('shrink-0 w-[160px] group cursor-pointer snap-start relative', className)}
      onMouseEnter={() => {
        setIsHovered(true);
        playPop();
        router.prefetch(href);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href}>
        <div className={cn(
          "relative w-[160px] h-[240px] rounded-2xl overflow-hidden mb-3 transition-all duration-500 ease-out",
          "group-hover:-translate-y-2 group-hover:scale-[1.03] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] group-hover:ring-1 group-hover:ring-white/20"
        )}>
          <TmdbImage
            path={posterPath}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="160px"
          />

          {/* Static Bottom Gradient (Rating & Year) */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black via-black/40 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
          <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 transition-opacity duration-500 group-hover:opacity-0 z-10">
            <div className="flex items-center gap-1.5">
               <span className="text-[--flx-gold] text-[11px] font-black">★ {rating.toFixed(1)}</span>
               <span className="text-white/40 text-[9px] font-bold tracking-tighter">{getYear(releaseDate)}</span>
            </div>
          </div>

          {/* Hover Trailer Preview (Fades in) */}
          <div className={cn(
            "absolute inset-0 z-20 transition-opacity duration-700",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <MovieCardTrailer 
              key={`trailer-${id}`}
              id={id} 
              mediaType={mediaType} 
              isVisible={isHovered} 
            />
          </div>

          {/* Rich Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
                <div className="flex flex-col transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                   <span className="text-[--flx-cyan] text-[10px] font-black uppercase tracking-widest">{matchScore}% Match</span>
                   <span className="text-white/60 text-[9px] font-bold">{mediaType === 'movie' ? 'Movie' : 'Series'} • {getYear(releaseDate)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md border border-white/10">Ultra HD</span>
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md border border-white/10">Dolby Atmos</span>
              </div>
            </div>
          </div>

          {/* Rank huge ghost number */}
          {rank && (
            <span className="absolute -bottom-4 -left-2 font-bebas text-[80px] leading-none text-white/10 select-none z-10 drop-shadow-2xl pointer-events-none group-hover:opacity-5 transition-opacity">
              {rank}
            </span>
          )}

          {/* Free Badge (Cyan Pill) */}
          {isFree && (
            <div className="absolute top-3 left-3 z-40">
              <span className="bg-[--flx-cyan] text-[9px] font-black px-3 py-1 rounded-full text-black uppercase tracking-[2px] shadow-2xl">
                Free
              </span>
            </div>
          )}

          {/* Watchlist button (Heart) */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Optimistic local update
              if (saved) {
                removeFromWatchlist(id);
              } else {
                addToWatchlist(id);
              }

              // Persist to Supabase
              await toggleWatchlist(id, mediaType);
            }}
            aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-50 backdrop-blur-md',
              'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0',
              saved
                ? 'bg-[--flx-cyan]/90 text-black scale-110 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                : 'bg-black/40 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
            )}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill={saved ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              strokeWidth="2.5"
              className={cn("transition-transform duration-300", saved && "animate-pulse")}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Title area (Static) */}
        <div className="px-1 space-y-1 group-hover:opacity-0 transition-opacity duration-300">
           <p className="text-[13px] font-bold text-[--flx-text-1] truncate tracking-tight">{title}</p>
        </div>
      </Link>
    </div>
  );
}

