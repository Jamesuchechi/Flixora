import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear, BLUR_DATA_URL } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Play, TrendingUp, Flame } from 'lucide-react';
import type { TMDBSearchResult } from '@/types/tmdb';

export const metadata: Metadata = {
  title: 'Trending Movies & Series | Flixora',
  description: 'See what everyone is watching. Explore the top trending movies and TV shows this week.',
};

export default async function TrendingPage() {
  const trending = await tmdb.trending.all('week').catch(() => ({ results: [] }));
  const items = (trending.results as TMDBSearchResult[]).slice(0, 30);

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-32">
      {/* ── HERO BANNER ── */}
      <div className="relative h-[40vh] w-full overflow-hidden flex items-center px-10">
        <div className="absolute inset-0 bg-linear-to-b from-[--flx-purple]/20 via-transparent to-[--flx-bg]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.15),transparent_70%)]" />
        
        <div className="relative z-10 max-w-4xl space-y-4 pt-12">
          <div className="flex items-center gap-3 text-[--flx-cyan]">
            <Flame size={24} fill="currentColor" className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[6px]">Global Rankings</span>
          </div>
          <h1 className="font-bebas text-7xl md:text-8xl tracking-tight text-[--flx-text-1] leading-none">
            TRENDING <span className="text-transparent bg-clip-text bg-linear-to-r from-[--flx-cyan] to-[--flx-purple]">NOW</span>
          </h1>
          <p className="text-[--flx-text-3] font-bold text-sm uppercase tracking-[3px] max-w-xl">
            The most watched movies and series across the globe this week.
          </p>
        </div>
      </div>

      {/* ── TRENDING GRID ── */}
      <div className="px-10 -mt-12 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {items.map((item, i) => {
            const isMovie = item.media_type === 'movie';
            const title = item.title || item.name || 'Unknown Title';
            const date = item.release_date || item.first_air_date;

            return (
              <Link 
                key={item.id} 
                href={`/${isMovie ? 'movies' : 'series'}/${item.id}`}
                className="group relative"
              >
                {/* Rank Number */}
                <div className="absolute -top-4 -left-4 z-30 font-bebas text-6xl text-white/10 group-hover:text-[--flx-cyan]/40 transition-colors pointer-events-none">
                  {i + 1}
                </div>

                <div className="relative aspect-2/3 rounded-3xl overflow-hidden bg-[--flx-surface-2] border border-white/5 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] group-hover:border-[--flx-cyan]/30">
                  <Image 
                    src={tmdb.image(item.poster_path, 'w500')} 
                    alt={title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 300px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="purple" className="px-2 py-0.5 text-[9px]">
                      {isMovie ? 'Movie' : 'Series'}
                    </Badge>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="w-12 h-12 rounded-full bg-[--flx-cyan] flex items-center justify-center mb-4 shadow-xl shadow-[--flx-cyan]/20">
                      <Play size={18} fill="black" className="ml-1" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-[2px]">Trending #{i + 1}</p>
                       <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{title}</h4>
                    </div>
                  </div>
                </div>

                <div className="mt-4 px-1">
                  <h4 className="text-[14px] font-bold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors">{title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp size={12} className="text-[--flx-cyan]" />
                    <span className="text-[11px] text-[--flx-gold] font-black">★ {item.vote_average?.toFixed(1)}</span>
                    <span className="text-[11px] text-[--flx-text-3] font-bold tracking-tighter">{getYear(date)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
