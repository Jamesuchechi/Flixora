import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { WatchlistButton } from '@/components/movie/WatchlistButton';
import { MovieRow } from '@/components/home/MovieRow';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; ep?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await tmdb.movies.detail(Number(id)).catch(() => null);
    const show  = movie ? null : await tmdb.tv.detail(Number(id)).catch(() => null);
    const title = movie?.title ?? show?.name ?? 'Watch';
    return { title: `Watch ${title}` };
  } catch {
    return { title: 'Watch' };
  }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id }                  = await params;
  const { season = '1', ep = '1' } = await searchParams;
  const mediaId = Number(id);

  // Try movie first, fallback to TV
  const [movie, show, similar] = await Promise.all([
    tmdb.movies.detail(mediaId).catch(() => null),
    tmdb.tv.detail(mediaId).catch(() => null),
    tmdb.movies.similar(mediaId).catch(() => ({ results: [] })),
  ]);

  const isMovie = !!movie && !show?.name;
  const title   = movie?.title ?? show?.name ?? 'Unknown';
  const poster  = tmdb.image(movie?.poster_path ?? show?.poster_path, 'w342');
  const overview = movie?.overview ?? show?.overview ?? '';
  const rating  = movie?.vote_average ?? show?.vote_average ?? 0;
  const backHref = isMovie ? `/movies/${mediaId}` : `/series/${mediaId}`;

  return (
    <div className="min-h-screen bg-[--flx-bg]">
      {/* ── Player area ── */}
      <div className="w-full bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Fake player — replace with real player in Phase 6 */}
          <div className="relative w-full aspect-video bg-[#0a0a0f] flex items-center justify-center group">
            {/* Backdrop as preview */}
            <Image
              src={tmdb.image(movie?.backdrop_path ?? show?.backdrop_path, 'original')}
              alt={title}
              fill
              className="object-cover opacity-20"
              sizes="100vw"
              priority
            />

            {/* Big play button */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <button className="w-20 h-20 rounded-full bg-[--flx-purple]/90 hover:bg-[--flx-purple] flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:scale-110 cursor-pointer">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </button>
              <p className="text-sm text-white/60">Click to play</p>
            </div>

            {/* Player controls bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-1 bg-white/20 rounded-full mb-3">
                <div className="h-full w-[35%] bg-[--flx-purple] rounded-full" />
              </div>
              <div className="flex items-center gap-3 text-white">
                <button className="hover:text-[--flx-purple] transition-colors cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </button>
                <button className="hover:text-[--flx-purple] transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
                </button>
                <span className="text-xs text-white/60 ml-1">0:00 / {isMovie ? '2:22:00' : `S${season} E${ep}`}</span>
                <div className="flex-1" />
                <button className="hover:text-[--flx-purple] transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                </button>
                <button className="hover:text-[--flx-purple] transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info below player ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4 mb-6">
              <Link href={backHref} className="text-[--flx-text-3] hover:text-[--flx-text-2] transition-colors mt-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
              </Link>
              <div className="flex-1">
                <h1 className="font-['Bebas_Neue',sans-serif] text-3xl tracking-wide text-[--flx-text-1] mb-1">{title}</h1>
                {!isMovie && (
                  <p className="text-sm text-[--flx-text-3] mb-2">Season {season} · Episode {ep}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-[--flx-text-2]">
                  <span className="text-[--flx-gold]">★ {rating.toFixed(1)}</span>
                  <WatchlistButton id={mediaId} size="sm" />
                </div>
              </div>
            </div>

            <p className="text-sm text-[--flx-text-2] leading-relaxed mb-6 max-w-2xl">{overview}</p>

            {/* Notice */}
            <div className="flex items-start gap-3 bg-[--flx-surface-1] border border-[--flx-border] rounded-xl p-4 text-xs text-[--flx-text-3]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Video player integration (Plyr + HLS) is set up in Phase 6. This is the watch page layout shell.</span>
            </div>
          </div>

          {/* Sidebar poster */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="relative w-[140px] h-[210px] rounded-xl overflow-hidden shadow-lg">
              <Image src={poster} alt={title} fill className="object-cover" sizes="140px" />
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.results.length > 0 && (
          <div className="mt-10">
            <div className="h-px bg-[--flx-border] mb-8" />
            <MovieRow title="You Might Also Like" items={similar.results.slice(0, 10)} />
          </div>
        )}
      </div>
    </div>
  );
}
