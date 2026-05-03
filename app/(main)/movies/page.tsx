import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { BrowseGrid } from '@/components/browse/BrowseGrid';
import { MoodFilters } from '@/components/browse/MoodFilters';

export const metadata: Metadata = { title: 'Explore Movies | Flixora' };
export const revalidate = 3600;

export default async function MoviesPage() {
  // Parallel fetching for high performance
  const [popular, topRated, nowPlaying, upcoming, genres] = await Promise.all([
    tmdb.movies.popular(),
    tmdb.movies.topRated(),
    tmdb.movies.nowPlaying(),
    tmdb.movies.upcoming(),
    tmdb.genres.movies(),
  ]);

  const featured = popular.results[0];

  return (
    <div className="min-h-screen pb-20">
      {/* ── Page Header ── */}
      <div className="px-6 md:px-10 pt-10 pb-8 flex items-end justify-between border-b border-white/5 bg-linear-to-b from-white/5 to-transparent">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="font-bebas text-5xl tracking-[4px] text-[--flx-text-1]">Movies</h1>
             <Badge variant="cyan" className="mt-1">Library</Badge>
          </div>
          <p className="text-xs tracking-widest text-[--flx-text-3] uppercase font-bold">
            {popular.total_results.toLocaleString()} titles available for streaming
          </p>
        </div>
      </div>

      {/* ── Featured Banner ── */}
      <div className="px-6 md:px-10 py-10">
        <Link href={`/movies/${featured.id}`} className="group relative block h-[450px] rounded-3xl overflow-hidden bg-[--flx-surface-1] border border-white/5">
          <Image
            src={tmdb.image(featured.backdrop_path, 'w1280')}
            alt={featured.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-100"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent p-8 md:p-12 flex flex-col justify-end">
            <div className="max-w-2xl space-y-4 animate-fade-up">
              <Badge variant="purple" className="self-start">Featured Today</Badge>
              <h2 className="font-bebas text-6xl md:text-7xl leading-tight text-white drop-shadow-2xl">
                {featured.title}
              </h2>
              <p className="text-sm text-white/60 line-clamp-2 md:line-clamp-3 font-medium max-w-xl">
                {featured.overview}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <button className="bg-white text-black px-8 py-3 rounded-xl font-bold text-sm hover:bg-[--flx-purple] hover:text-white transition-all hover:scale-105 active:scale-95">
                  Watch Now
                </button>
                <div className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest">
                  <span className="text-[--flx-gold]">★ {featured.vote_average.toFixed(1)}</span>
                  <span>•</span>
                  <span>{getYear(featured.release_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Browse & Discovery Section ── */}
      <div className="px-6 md:px-10 space-y-16">
        <MoodFilters />
        
        <BrowseGrid 
          initialItems={popular.results.slice(1)} 
          genres={genres.genres} 
          type="movie" 
        />

        {/* ── Now Playing Section ── */}
        <div className="space-y-6 pt-10 border-t border-white/5">
           <div className="flex items-center gap-4">
              <h3 className="font-bebas text-2xl tracking-[2px] text-[--flx-text-1] uppercase">In Theatres Now</h3>
              <Badge variant="live" className="animate-pulse">Active</Badge>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {nowPlaying.results.slice(0, 6).map((movie, i) => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="relative aspect-2/3 rounded-xl overflow-hidden mb-2 bg-[--flx-surface-2] border border-white/5 group-hover:border-[--flx-purple]/30 transition-all">
                    <Image src={tmdb.image(movie.poster_path, 'w185')} alt={movie.title} fill className="object-cover" sizes="180px" />
                  </div>
                  <p className="text-[11px] font-medium text-[--flx-text-2] truncate">{movie.title}</p>
                </Link>
              ))}
           </div>
        </div>

        {/* ── Top Rated Section ── */}
        <div className="space-y-6 pt-10 border-t border-white/5">
           <h3 className="font-bebas text-2xl tracking-[2px] text-[--flx-text-1] uppercase">Top Rated All Time</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {topRated.results.slice(0, 6).map((movie, i) => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="relative aspect-2/3 rounded-xl overflow-hidden mb-2 bg-[--flx-surface-2] border border-white/5 group-hover:border-[--flx-gold]/30 transition-all">
                    <Image src={tmdb.image(movie.poster_path, 'w185')} alt={movie.title} fill className="object-cover" sizes="180px" />
                  </div>
                  <p className="text-[11px] font-medium text-[--flx-text-2] truncate">{movie.title}</p>
                </Link>
              ))}
           </div>
        </div>

        {/* ── Upcoming Section ── */}
        <div className="space-y-6 pt-10 border-t border-white/5">
           <h3 className="font-bebas text-2xl tracking-[2px] text-[--flx-text-1] uppercase">Coming Soon</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {upcoming.results.slice(0, 6).map((movie, i) => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="relative aspect-2/3 rounded-xl overflow-hidden mb-2 bg-[--flx-surface-2] border border-white/5 group-hover:border-[--flx-cyan]/30 transition-all">
                    <Image src={tmdb.image(movie.poster_path, 'w185')} alt={movie.title} fill className="object-cover" sizes="180px" />
                  </div>
                  <p className="text-[11px] font-medium text-[--flx-text-2] truncate">{movie.title}</p>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
