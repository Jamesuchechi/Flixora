import Image from 'next/image';
import { tmdb } from '@/lib/tmdb';
import type { TMDBMovie } from '@/types/tmdb';

interface PosterStripProps {
  movies?: TMDBMovie[];
}

export function PosterStrip({ movies = [] }: PosterStripProps) {
  // If no movies provided, return null or a skeleton
  if (movies.length === 0) return null;

  // Duplicate the movies to create a seamless loop for the marquee effect if needed
  // For now, we'll just show the ones we have in a smooth row
  return (
    <div className="relative px-6 lg:px-12 pb-24 overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-[9px] lg:text-[11px] tracking-[3px] uppercase text-[--flx-text-3] font-bold whitespace-nowrap">Trending across the globe</h3>
        <div className="h-px flex-1 bg-white/5 mx-4 lg:mx-6" />
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 lg:w-32 bg-linear-to-r from-[--flx-bg] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 lg:w-32 bg-linear-to-l from-[--flx-bg] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="shrink-0 w-[160px] rounded-2xl overflow-hidden relative cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)] group"
          >
            <div className="aspect-2/3 relative bg-[--flx-surface-1]">
              <Image
                src={tmdb.image(movie.poster_path, 'w342')}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="160px"
              />
              {/* Rating badge */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-[--flx-gold] opacity-0 group-hover:opacity-100 transition-opacity">
                ★ {movie.vote_average.toFixed(1)}
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-[11px] font-bold text-white truncate w-full">{movie.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
