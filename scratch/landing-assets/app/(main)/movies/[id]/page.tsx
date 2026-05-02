import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { formatRuntime, getYear } from '@/lib/utils';
import { CastRow } from '@/components/movie/CastRow';
import { TrailerButton } from '@/components/movie/TrailerButton';
import { WatchlistButton } from '@/components/movie/WatchlistButton';
import { MovieRow } from '@/components/home/MovieRow';
import type { TMDBCredits, TMDBVideo, TMDBCastMember, TMDBCrewMember } from '@/types/tmdb';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await tmdb.movies.detail(Number(id));
    return {
      title: movie.title,
      description: movie.overview?.slice(0, 160),
      openGraph: {
        images: [tmdb.image(movie.backdrop_path, 'w780')],
      },
    };
  } catch {
    return { title: 'Movie' };
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movieId = Number(id);

  const [movie, creditsRaw, videosRaw, similar] = await Promise.all([
    tmdb.movies.detail(movieId).catch(() => null),
    tmdb.movies.credits(movieId).catch(() => null),
    tmdb.movies.videos(movieId).catch(() => null),
    tmdb.movies.similar(movieId).catch(() => ({ results: [] })),
  ]);

  if (!movie) notFound();

  const credits  = creditsRaw as TMDBCredits | null;
  const cast     = (credits?.cast ?? []) as TMDBCastMember[];
  const crew     = (credits?.crew ?? []) as TMDBCrewMember[];
  const director = crew.find((c) => c.job === 'Director');
  const videos   = ((videosRaw as { results?: TMDBVideo[] } | null)?.results ?? []) as TMDBVideo[];
  const trailer  = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ?? videos[0] ?? null;

  const backdropUrl = tmdb.image(movie.backdrop_path, 'original');
  const posterUrl   = tmdb.image(movie.poster_path, 'w500');

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <div className="relative h-[70vh] min-h-[520px] overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0">
          <Image src={backdropUrl} alt={movie.title} fill className="object-cover object-top opacity-35" priority sizes="100vw" />
        </div>
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[--flx-bg]/95 via-[--flx-bg]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[--flx-bg] via-transparent to-[--flx-bg]/30" />

        {/* Aurora */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[350px] -top-28 -left-16 rounded-full bg-[--flx-purple]/25 blur-[90px] animate-aurora" />
          <div className="absolute w-[400px] h-[280px] top-10 right-0 rounded-full bg-[--flx-cyan]/15 blur-[90px] animate-aurora" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-end h-full px-12 pb-12 gap-10">
          {/* Poster */}
          <div className="hidden lg:block flex-shrink-0 relative w-[200px] h-[300px] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.25),0_24px_60px_rgba(0,0,0,0.9)]">
            <Image src={posterUrl} alt={movie.title} fill className="object-cover" sizes="200px" />
          </div>

          {/* Info */}
          <div className="flex-1 max-w-2xl pb-2 animate-fade-up">
            {/* Back */}
            <Link href="/movies" className="inline-flex items-center gap-1.5 text-xs text-[--flx-text-3] hover:text-[--flx-text-2] mb-5 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
              Back to Movies
            </Link>

            <h1 className="font-['Bebas_Neue',sans-serif] text-6xl leading-none tracking-wide mb-3 text-[--flx-text-1]">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-sm text-[--flx-text-3] italic mb-3">"{movie.tagline}"</p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2.5 text-xs text-[--flx-text-2] mb-4 flex-wrap">
              <span className="text-[--flx-gold] font-semibold text-sm">★ {movie.vote_average.toFixed(1)}</span>
              <span className="text-[--flx-text-3]">·</span>
              <span>{getYear(movie.release_date)}</span>
              <span className="text-[--flx-text-3]">·</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span className="text-[--flx-text-3]">·</span>
              <span className="uppercase text-[10px] tracking-widest bg-white/5 border border-white/10 rounded px-2 py-0.5">
                {movie.original_language}
              </span>
            </div>

            {/* Genres */}
            <div className="flex gap-2 flex-wrap mb-5">
              {(movie.genres ?? []).map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full text-[11px] font-medium border border-[--flx-purple]/30 bg-[--flx-purple]/10 text-violet-300">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-sm leading-relaxed text-[--flx-text-1]/60 font-light mb-7 max-w-xl">
              {movie.overview}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/watch/${movie.id}`}
                className="flex items-center gap-2 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-semibold text-sm px-7 py-3 rounded-lg transition-all hover:-translate-y-px"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                Play Now
              </Link>
              <TrailerButton videoKey={trailer?.key ?? null} title={movie.title} />
              <WatchlistButton id={movie.id} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-12 py-10 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left — cast & details */}
          <div className="lg:col-span-2 space-y-10">
            {cast.length > 0 && <CastRow cast={cast} />}

            {/* Director */}
            {director && (
              <div>
                <h2 className="font-['Bebas_Neue',sans-serif] text-lg tracking-[2px] text-[--flx-text-1] mb-3">Director</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[--flx-surface-2] border border-[--flx-border] flex items-center justify-center text-[--flx-text-3]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[--flx-text-1]">{director.name}</p>
                    <p className="text-xs text-[--flx-text-3]">Director</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — info sidebar */}
          <div className="space-y-5">
            <div className="bg-[--flx-surface-1] border border-[--flx-border] rounded-2xl p-5 space-y-4">
              <h2 className="font-['Bebas_Neue',sans-serif] text-base tracking-[2px] text-[--flx-text-1]">Details</h2>

              {[
                { label: 'Status',   value: movie.status },
                { label: 'Released', value: movie.release_date },
                { label: 'Runtime',  value: formatRuntime(movie.runtime) },
                { label: 'Language', value: movie.original_language?.toUpperCase() },
                {
                  label: 'Budget',
                  value: movie.budget ? `$${(movie.budget / 1_000_000).toFixed(1)}M` : 'N/A',
                },
                {
                  label: 'Revenue',
                  value: movie.revenue ? `$${(movie.revenue / 1_000_000).toFixed(1)}M` : 'N/A',
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs border-b border-[--flx-border] pb-3 last:border-0 last:pb-0">
                  <span className="text-[--flx-text-3]">{label}</span>
                  <span className="text-[--flx-text-1] font-medium">{value ?? 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.results.length > 0 && (
          <div>
            <div className="h-px bg-[--flx-border] mb-8" />
            <MovieRow title="More Like This" items={similar.results.slice(0, 10)} />
          </div>
        )}
      </div>
    </div>
  );
}
