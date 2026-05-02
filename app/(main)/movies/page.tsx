import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Explore Movies | Flixora' };
export const revalidate = 3600;

export default async function MoviesPage() {
  // Parallel fetching for high performance
  const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
    tmdb.movies.popular(),
    tmdb.movies.topRated(),
    tmdb.movies.nowPlaying(),
    tmdb.movies.upcoming(),
  ]);

  const featured = popular.results[0];
  const gridItems = popular.results.slice(1, 19);

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

      <div className="px-6 md:px-10 py-10 space-y-12">
        {/* ── Featured Focus Banner ── */}
        {featured && (
          <Link 
            href={`/movies/${featured.id}`} 
            className="block relative h-[320px] rounded-[32px] overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]"
          >
            <Image
              src={tmdb.image(featured.backdrop_path, 'w1280')}
              alt={featured.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              sizes="100vw"
              priority
            />
            
            {/* Layered Overlays */}
            <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg]/90 via-[--flx-bg]/40 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg]/60 via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-10 left-10 max-w-lg space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[--flx-cyan] animate-pulse" />
                <p className="text-[10px] text-[--flx-cyan] tracking-[3px] uppercase font-bold">Recommended Featured</p>
              </div>
              
              <h2 className="font-bebas text-5xl tracking-wide text-white leading-none">
                {featured.title}
              </h2>
              
              <div className="flex items-center gap-4 text-[11px] font-bold text-[--flx-text-2] uppercase tracking-widest">
                <span className="text-[--flx-gold]">★ {featured.vote_average.toFixed(1)}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{getYear(featured.release_date)}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-white/40">Movie</span>
              </div>
            </div>
          </Link>
        )}

        {/* ── Movie Grid ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bebas text-2xl tracking-[2px] text-[--flx-text-1] uppercase">Popular This Week</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {gridItems.map((movie, i) => (
              <Link 
                key={movie.id} 
                href={`/movies/${movie.id}`} 
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="relative aspect-2/3 rounded-2xl overflow-hidden mb-3 bg-[--flx-surface-2] border border-white/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:border-[--flx-purple]/30">
                  <Image
                    src={tmdb.image(movie.poster_path, 'w342')}
                    alt={movie.title}
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
                  <p className="text-[13px] font-semibold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors">
                    {movie.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[--flx-text-3] uppercase tracking-tighter">
                    <span className="text-[--flx-gold]">★ {movie.vote_average.toFixed(1)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{getYear(movie.release_date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Now Playing Section ── */}
        <div className="space-y-6 pt-10">
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
        <div className="space-y-6 pt-10">
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
        <div className="space-y-6 pt-10">
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
