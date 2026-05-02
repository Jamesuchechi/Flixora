import Image from 'next/image';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { Badge } from '@/components/ui/Badge';
import { formatRuntime, getYear } from '@/lib/utils';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export async function HeroBanner() {
  const data = await tmdb.trending.all();
  const hero = data.results[0] as unknown as (TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' };

  const isMovie   = hero.media_type === 'movie';
  const title     = isMovie ? (hero as TMDBMovie).title : (hero as TMDBTVShow).name;
  const releaseDate = isMovie ? (hero as TMDBMovie).release_date : (hero as TMDBTVShow).first_air_date;
  const runtime   = isMovie ? (hero as TMDBMovie).runtime : undefined;
  const backdrop  = tmdb.image(hero.backdrop_path, 'original');
  const poster    = tmdb.image(hero.poster_path, 'w500');
  const href      = `/${isMovie ? 'movies' : 'series'}/${hero.id}`;
  const watchHref = `/watch/${hero.id}`;
  const sideItems = data.results.slice(1, 4);

  return (
    <div className="relative h-[560px] overflow-hidden">
      {/* Backdrop image */}
      <div className="absolute inset-0">
        <Image src={backdrop} alt={title} fill className="object-cover object-top opacity-30" priority sizes="100vw" />
      </div>

      {/* Aurora orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[400px] -top-36 -left-20 rounded-full bg-[--flx-purple]/30 blur-[80px] animate-aurora" style={{ animationDelay: '0s' }} />
        <div className="absolute w-[500px] h-[350px] -top-12 -right-24 rounded-full bg-[--flx-cyan]/20 blur-[80px] animate-aurora" style={{ animationDelay: '-3s' }} />
        <div className="absolute w-[400px] h-[300px] -bottom-24 left-1/3 rounded-full bg-[--flx-pink]/18 blur-[80px] animate-aurora" style={{ animationDelay: '-6s' }} />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg]/95 via-[--flx-bg]/65 to-[--flx-bg]/10" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[--flx-bg] to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full px-12">
        {/* Left — text */}
        <div className="flex flex-col justify-center max-w-[520px] pt-4 animate-fade-up">
          <Badge variant="purple" className="mb-5 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse-dot" />
            Flixora Original · Featured
          </Badge>

          <h1 className="font-bebas text-[82px] leading-[.9] tracking-[2px] mb-4 text-[--flx-text-1]">
            {title.split(' ').map((word, i) => (
              <span key={i} className={i === Math.floor(title.split(' ').length / 2) ? 'bg-linear-to-r from-[--flx-cyan] to-[--flx-purple] bg-clip-text text-transparent' : ''}>{word} </span>
            ))}
          </h1>

          <div className="flex items-center gap-2.5 text-xs text-[--flx-text-2] mb-4 flex-wrap">
            <span className="text-[--flx-gold] font-semibold text-sm">★ {hero.vote_average.toFixed(1)}</span>
            <span className="text-[--flx-text-3]">·</span>
            <span>{getYear(releaseDate)}</span>
            {runtime && (
              <>
                <span className="text-[--flx-text-3]">·</span>
                <span>{formatRuntime(runtime)}</span>
              </>
            )}
            <span className="text-[--flx-text-3]">·</span>
            <span className="bg-white/6 border border-white/10 rounded px-2 py-0.5 text-[10px] tracking-wide uppercase">
              {isMovie ? 'Movie' : 'Series'}
            </span>
          </div>

          <p className="text-[13px] leading-relaxed text-[--flx-text-1]/55 mb-7 font-light">
            {hero.overview?.slice(0, 180)}…
          </p>

          <div className="flex gap-2.5">
            <Link
              href={watchHref}
              className="flex items-center gap-2 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-semibold text-sm px-7 py-3 rounded-lg transition-all hover:-translate-y-px"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Play Now
            </Link>
            <Link
              href={href}
              className="flex items-center gap-2 bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-1] text-sm font-medium px-5 py-3 rounded-lg transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              More Info
            </Link>
            <button className="w-12 h-12 flex items-center justify-center bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-2] hover:text-[--flx-text-1] rounded-lg transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
        </div>

        {/* Right — posters */}
        <div className="absolute right-12 top-10 flex gap-3 items-start">
          {/* Main poster */}
          <div className="relative w-[200px] h-[300px] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(139,92,246,0.3),0_30px_80px_rgba(0,0,0,0.9)]">
            <Image src={poster} alt={title} fill className="object-cover" sizes="200px" />
            <div className="absolute inset-0 bg-linear-to-t from-[--flx-purple]/30 to-transparent" />
          </div>

          {/* Side posters */}
          <div className="flex flex-col gap-2.5 mt-5">
            {sideItems.map((item) => {
              const t  = 'title' in item ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
              const mt = (item as { media_type?: string }).media_type;
              return (
                <Link
                  key={item.id}
                  href={`/${mt === 'tv' ? 'series' : 'movies'}/${item.id}`}
                  className="relative w-[100px] h-[140px] rounded-lg overflow-hidden opacity-55 hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Image src={tmdb.image(item.poster_path, 'w185')} alt={t} fill className="object-cover" sizes="100px" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
