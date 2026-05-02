import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { WatchlistButton } from '@/components/movie/WatchlistButton';
import { MovieRow } from '@/components/home/MovieRow';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string; e?: string }>;
}

/**
 * Generate metadata for the specific title being watched.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await tmdb.movies.detail(Number(id)).catch(() => null);
    const show  = movie ? null : await tmdb.tv.detail(Number(id)).catch(() => null);
    const title = movie?.title ?? show?.name ?? 'Watch';
    return { title: `Watching ${title} | Flixora` };
  } catch {
    return { title: 'Watch' };
  }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s = '1', e = '1' } = await searchParams;
  const mediaId = Number(id);

  // Parallel fetch for movie/show data and similar recommendations
  const [movie, show, similar] = await Promise.all([
    tmdb.movies.detail(mediaId).catch(() => null),
    tmdb.tv.detail(mediaId).catch(() => null),
    tmdb.movies.similar(mediaId).catch(() => ({ results: [] })),
  ]);

  const isMovie = !!movie && !show?.name;
  const title   = movie?.title ?? show?.name ?? 'Unknown Title';
  const poster  = tmdb.image(movie?.poster_path ?? show?.poster_path, 'w500');
  const backdrop = tmdb.image(movie?.backdrop_path ?? show?.backdrop_path, 'original');
  const overview = movie?.overview ?? show?.overview ?? '';
  const rating  = movie?.vote_average ?? show?.vote_average ?? 0;
  const backHref = isMovie ? `/movies/${mediaId}` : `/series/${mediaId}`;

  return (
    <div className="min-h-screen pb-20 bg-[--flx-bg]">
      
      {/* ── CINEMATIC PLAYER AREA ── */}
      <section className="w-full bg-black/40 border-b border-white/5">
        <div className="container mx-auto">
          {/* Main Player Container */}
          <div className="relative w-full aspect-video bg-[#050507] flex items-center justify-center group overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
            
            {/* Background Atmosphere */}
            <Image
              src={backdrop}
              alt={title}
              fill
              className="object-cover opacity-20 blur-sm scale-110"
              sizes="100vw"
              priority
            />

            {/* Central Play Interaction */}
            <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-up">
              <button className="w-24 h-24 rounded-full bg-[--flx-purple] flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all hover:scale-110 active:scale-90 cursor-pointer group/play">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="group-hover/play:scale-110 transition-transform">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
              <div className="text-center space-y-1">
                <p className="text-sm font-bebas tracking-[3px] text-white/80 uppercase">Click to Initialize Stream</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Premium 4K Ultra HD</p>
              </div>
            </div>

            {/* Premium Player Control Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/95 via-black/40 to-transparent px-8 py-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
              
              {/* Progress Bar */}
              <div className="relative h-1.5 w-full bg-white/10 rounded-full mb-6 group/progress cursor-pointer">
                <div className="absolute inset-0 w-[42%] bg-linear-to-r from-[--flx-purple] to-[--flx-cyan] rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                <div className="absolute left-[42%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity border-2 border-[--flx-cyan]" />
              </div>

              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-5">
                  <button className="hover:text-[--flx-cyan] transition-colors cursor-pointer"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg></button>
                  <button className="hover:text-[--flx-cyan] transition-colors cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 4h4v16H5zM15 4h4v16h-4z" /></svg></button>
                  <span className="text-[11px] font-bold tracking-widest text-white/40 ml-2">00:42:15 / {isMovie ? '02:14:00' : `S${s}:E${e}`}</span>
                </div>
                
                <div className="flex-1" />

                <div className="flex items-center gap-5">
                  <button className="hover:text-[--flx-cyan] transition-colors cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg></button>
                  <button className="hover:text-[--flx-cyan] transition-colors cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                  <button className="hover:text-[--flx-cyan] transition-colors cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO METADATA & INFO ── */}
      <main className="container mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Info Column */}
          <div className="flex-1 min-w-0 space-y-8">
            <div className="flex items-start gap-6 animate-fade-up">
              <Link 
                href={backHref} 
                className="shrink-0 mt-1 w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-[--flx-text-3] hover:text-[--flx-cyan] hover:border-[--flx-cyan]/20 transition-all group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-0.5 transition-transform">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Link>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h1 className="font-bebas text-4xl tracking-wide text-[--flx-text-1] uppercase">{title}</h1>
                  {!isMovie && (
                    <p className="text-sm font-medium text-[--flx-cyan]/80 tracking-widest uppercase">
                      Season {s} <span className="text-white/20 mx-1">/</span> Episode {e}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-[--flx-gold]">
                      <span className="text-sm">★</span>
                      <span className="text-xs font-bold">{rating.toFixed(1)}</span>
                   </div>
                   <div className="h-4 w-px bg-white/10" />
                   <WatchlistButton id={mediaId} size="sm" className="bg-transparent border-white/5 hover:bg-white/5" />
                </div>
              </div>
            </div>

            <p className="text-[15px] leading-relaxed text-[--flx-text-2]/80 font-light max-w-3xl border-l-2 border-[--flx-purple]/30 pl-6">
              {overview}
            </p>

            {/* Technical Notice / Dev Info */}
            <div className="flex items-center gap-4 bg-linear-to-r from-[--flx-purple]/10 to-transparent border border-[--flx-purple]/20 rounded-2xl p-5 group">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[--flx-purple]/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[--flx-cyan]">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-[--flx-text-3] uppercase tracking-wider leading-relaxed">
                <span className="text-[--flx-cyan]">System Note:</span> Video playback engine (HLS + Plyr) integration is scheduled for Phase 6. This layout provides the cinematic viewing shell.
              </p>
            </div>
          </div>

          {/* Sidebar Focus */}
          <div className="hidden lg:block shrink-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-[180px] h-[270px] rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
              <Image src={poster} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="180px" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </div>
          </div>
        </div>

        {/* ── RECOMMENDATIONS ── */}
        {similar.results.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <MovieRow title="More Titles Like This" items={similar.results.slice(0, 10)} />
          </div>
        )}
      </main>
    </div>
  );
}
