import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { CastRow } from '@/components/movie/CastRow';
import { TrailerButton } from '@/components/movie/TrailerButton';
import { WatchlistButton } from '@/components/movie/WatchlistButton';
import { SeasonSelector } from '@/components/tv/SeasonSelector';
import { MovieRow } from '@/components/home/MovieRow';
import type { TMDBCredits, TMDBVideo, TMDBCastMember, TMDBSeason } from '@/types/tmdb';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await tmdb.tv.detail(Number(id));
    return {
      title: show.name,
      description: show.overview?.slice(0, 160),
      openGraph: { images: [tmdb.image(show.backdrop_path, 'w780')] },
    };
  } catch {
    return { title: 'Series' };
  }
}

export default async function SeriesDetailPage({ params }: Props) {
  const { id } = await params;
  const showId = Number(id);

  const [show, creditsRaw, videosRaw, similar] = await Promise.all([
    tmdb.tv.detail(showId).catch(() => null),
    tmdb.tv.credits(showId).catch(() => null),
    tmdb.tv.videos(showId).catch(() => null),
    tmdb.tv.similar(showId).catch(() => ({ results: [] })),
  ]);

  if (!show) notFound();

  const credits  = creditsRaw as TMDBCredits | null;
  const cast     = (credits?.cast ?? []) as TMDBCastMember[];
  const videos   = ((videosRaw as { results?: TMDBVideo[] } | null)?.results ?? []) as TMDBVideo[];
  const trailer  = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ?? videos[0] ?? null;
  const seasons  = (show.seasons ?? []) as TMDBSeason[];
  const runtime  = show.episode_run_time?.[0];

  const backdropUrl = tmdb.image(show.backdrop_path, 'original');
  const posterUrl   = tmdb.image(show.poster_path, 'w500');

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <div className="relative h-[70vh] min-h-[520px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={backdropUrl} alt={show.name} fill className="object-cover object-top opacity-35" priority sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[--flx-bg]/95 via-[--flx-bg]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[--flx-bg] via-transparent to-[--flx-bg]/30" />

        {/* Aurora */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[350px] -top-28 -left-16 rounded-full bg-[--flx-cyan]/20 blur-[90px] animate-aurora" />
          <div className="absolute w-[400px] h-[280px] top-10 right-0 rounded-full bg-[--flx-purple]/20 blur-[90px] animate-aurora" style={{ animationDelay: '-4s' }} />
        </div>

        <div className="relative z-10 flex items-end h-full px-12 pb-12 gap-10">
          {/* Poster */}
          <div className="hidden lg:block flex-shrink-0 relative w-[200px] h-[300px] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.2),0_24px_60px_rgba(0,0,0,0.9)]">
            <Image src={posterUrl} alt={show.name} fill className="object-cover" sizes="200px" />
          </div>

          {/* Info */}
          <div className="flex-1 max-w-2xl pb-2 animate-fade-up">
            <Link href="/series" className="inline-flex items-center gap-1.5 text-xs text-[--flx-text-3] hover:text-[--flx-text-2] mb-5 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
              Back to Series
            </Link>

            <h1 className="font-['Bebas_Neue',sans-serif] text-6xl leading-none tracking-wide mb-3 text-[--flx-text-1]">
              {show.name}
            </h1>

            {show.tagline && (
              <p className="text-sm text-[--flx-text-3] italic mb-3">"{show.tagline}"</p>
            )}

            <div className="flex items-center gap-2.5 text-xs text-[--flx-text-2] mb-4 flex-wrap">
              <span className="text-[--flx-gold] font-semibold text-sm">★ {show.vote_average.toFixed(1)}</span>
              <span className="text-[--flx-text-3]">·</span>
              <span>{getYear(show.first_air_date)}</span>
              <span className="text-[--flx-text-3]">·</span>
              <span>{show.number_of_seasons ?? '?'} Seasons</span>
              {runtime && (
                <>
                  <span className="text-[--flx-text-3]">·</span>
                  <span>~{runtime}m / ep</span>
                </>
              )}
              <span className="text-[--flx-text-3]">·</span>
              <span className="uppercase text-[10px] tracking-widest bg-white/5 border border-white/10 rounded px-2 py-0.5">
                {show.status}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
              {(show.genres ?? []).map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full text-[11px] font-medium border border-[--flx-cyan]/30 bg-[--flx-cyan]/10 text-cyan-300">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-sm leading-relaxed text-[--flx-text-1]/60 font-light mb-7 max-w-xl">
              {show.overview}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/watch/${show.id}?season=1&ep=1`}
                className="flex items-center gap-2 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-semibold text-sm px-7 py-3 rounded-lg transition-all hover:-translate-y-px"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                Play S1 E1
              </Link>
              <TrailerButton videoKey={trailer?.key ?? null} title={show.name} />
              <WatchlistButton id={show.id} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-12 py-10 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left — episodes & cast */}
          <div className="lg:col-span-2 space-y-10">
            {/* Episodes */}
            {seasons.length > 0 && (
              <div>
                <h2 className="font-['Bebas_Neue',sans-serif] text-lg tracking-[2px] text-[--flx-text-1] mb-5">Episodes</h2>
                <SeasonSelector seriesId={show.id} seasons={seasons} />
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && <CastRow cast={cast} />}
          </div>

          {/* Right — sidebar */}
          <div>
            <div className="bg-[--flx-surface-1] border border-[--flx-border] rounded-2xl p-5 space-y-4">
              <h2 className="font-['Bebas_Neue',sans-serif] text-base tracking-[2px] text-[--flx-text-1]">Details</h2>

              {[
                { label: 'Status',    value: show.status },
                { label: 'First Air', value: show.first_air_date },
                { label: 'Seasons',   value: show.number_of_seasons?.toString() },
                { label: 'Episodes',  value: show.number_of_episodes?.toString() },
                { label: 'Language',  value: show.original_language?.toUpperCase() },
                { label: 'Networks',  value: (show.networks ?? []).map((n) => n.name).join(', ') || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs border-b border-[--flx-border] pb-3 last:border-0 last:pb-0">
                  <span className="text-[--flx-text-3]">{label}</span>
                  <span className="text-[--flx-text-1] font-medium text-right max-w-[60%]">{value ?? 'N/A'}</span>
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
