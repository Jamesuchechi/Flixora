import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { CastRow } from '@/components/movie/CastRow';
import { TrailerButton } from '@/components/movie/TrailerButton';
import { WatchlistButton } from '@/components/movie/WatchlistButton';
import { HeroTrailer } from '@/components/movie/HeroTrailer';
import { SeasonSelector } from '@/components/tv/SeasonSelector';
import { TrailerInsights } from '@/components/movie/TrailerInsights';
import { MovieRow } from '@/components/home/MovieRow';
import { Badge } from '@/components/ui/Badge';
import type { TMDBCredits, TMDBVideo, TMDBCastMember, TMDBSeason } from '@/types/tmdb';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

/**
 * Generate dynamic SEO metadata for the TV show.
 */
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
    return { title: 'Series Detail' };
  }
}

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { mode } = await searchParams;
  const showId = Number(id);

  // Parallel fetch for optimal performance
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
  const seasons  = (show.seasons ?? []) as TMDBSeason[];
  const runtime  = show.episode_run_time?.[0];

  const backdropUrl = tmdb.image(show.backdrop_path, 'original');
  const posterUrl   = tmdb.image(show.poster_path, 'w500');

  return (
    <div className="min-h-screen pb-20">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVSeries",
            "name": show.name,
            "image": posterUrl,
            "description": show.overview,
            "datePublished": show.first_air_date,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": show.vote_average,
              "bestRating": "10",
              "ratingCount": show.vote_count
            }
          })
        }}
      />

      {/* ── IMMERSIVE HERO SECTION ── */}
      <section className="relative h-[75vh] min-h-[600px] w-full overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={backdropUrl} 
            alt={show.name} 
            fill 
            className="object-cover object-top opacity-40 scale-105 animate-aurora" 
            priority 
            sizes="100vw" 
          />
          <HeroTrailer videos={videos} title={show.name} />
          <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg] via-[--flx-bg]/65 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-[--flx-bg]/40" />
          
          {/* Aurora Ambient Glows */}
          <div className="absolute w-[600px] h-[400px] -top-40 -left-20 rounded-full bg-[--flx-cyan]/15 blur-[120px] mix-blend-screen animate-aurora" />
          <div className="absolute w-[500px] h-[300px] top-1/4 -right-20 rounded-full bg-[--flx-purple]/10 blur-[100px] mix-blend-screen animate-aurora" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Hero Content Wrapper */}
        <div className="relative z-10 container mx-auto h-full flex items-end px-6 md:px-12 pb-16">
          <div className="flex flex-col lg:flex-row items-end gap-10 w-full animate-fade-up">
            
            {/* Poster Shadow Stack */}
            <div className="hidden lg:block shrink-0 relative w-[240px] h-[360px] rounded-[24px] overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.2),0_40px_80px_rgba(0,0,0,0.9)] border border-white/10 group">
              <Image 
                src={posterUrl} 
                alt={show.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                sizes="240px" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-[--flx-cyan]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Series Information */}
            <div className="flex-1 space-y-6 max-w-3xl">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[3px] font-bold text-[--flx-text-3] hover:text-[--flx-cyan] transition-colors group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Explore
              </Link>

              <div className="space-y-3">
                <h1 className="font-bebas text-6xl md:text-8xl leading-[0.9] tracking-tight text-[--flx-text-1] drop-shadow-2xl">
                  {show.name}
                </h1>
                {show.tagline && (
                  <p className="text-lg text-[--flx-purple]/70 font-outfit italic font-light">
                    &quot;{show.tagline}&quot;
                  </p>
                )}
              </div>

              {/* Series Metadata */}
              <div className="flex items-center gap-4 text-xs font-medium text-[--flx-text-2] flex-wrap">
                <div className="flex items-center gap-1.5 text-[--flx-gold]">
                  <span className="text-sm">★</span>
                  <span className="font-bold">{show.vote_average.toFixed(1)}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>{getYear(show.first_air_date)}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>{show.number_of_seasons} Seasons</span>
                {runtime && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>~{runtime}m / ep</span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <Badge variant="new" className="px-2 py-0.5 tracking-widest">
                  {show.status}
                </Badge>
              </div>

              {/* Genre Chips */}
              <div className="flex gap-2.5 flex-wrap">
                {(show.genres ?? []).map((g) => (
                  <Badge key={g.id} variant="cyan" className="px-4 py-1.5 rounded-xl border-[--flx-cyan]/20 bg-[--flx-cyan]/10 text-cyan-200">
                    {g.name}
                  </Badge>
                ))}
              </div>

              <p className="text-[15px] leading-relaxed text-[--flx-text-1]/70 font-light max-w-2xl">
                {show.overview}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 flex-wrap pt-4">
                <Link
                  href={`/watch/${show.id}?s=1&e=1${mode === 'free' ? '&mode=free' : ''}`}
                  className="flex items-center gap-3 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-bold text-sm px-10 py-4 rounded-2xl transition-all hover:-translate-y-1 shadow-xl shadow-[--flx-purple]/20 active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Play S1 E1
                </Link>
                <TrailerButton videos={videos} title={show.name} />
                <WatchlistButton id={show.id} mediaType="tv" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── DETAILED CONTENT BODY ── */}
      <main className="container mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Primary Column — Episodes & Cast */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* Episode Navigator */}
            {seasons.length > 0 && (
              <div className="space-y-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4">
                  <h2 className="font-bebas text-3xl tracking-[4px] text-[--flx-text-1] uppercase">Episodes</h2>
                  <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
                </div>
                <SeasonSelector seriesId={show.id} seasons={seasons} />
              </div>
            )}

            {/* Cast Row */}
            {cast.length > 0 && (
              <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <CastRow cast={cast} />
                <TrailerInsights 
                  tmdbId={show.id} 
                  title={show.name} 
                  overview={show.overview || ''} 
                  genres={(show.genres || []).map(g => g.name)} 
                />
              </div>
            )}
          </div>

          {/* Sidebar Column — Info */}
          <div className="lg:col-span-4 space-y-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <aside className="bg-linear-to-b from-[--flx-surface-1] to-[--flx-surface-2] border border-white/5 rounded-[24px] p-8 space-y-6 shadow-2xl backdrop-blur-sm sticky top-24">
              <h2 className="font-bebas text-xl tracking-[3px] text-[--flx-text-1] uppercase border-b border-white/5 pb-4">Series Info</h2>

              <div className="space-y-5">
                {[
                  { label: 'Status',    value: show.status },
                  { label: 'First Air', value: show.first_air_date },
                  { label: 'Seasons',   value: show.number_of_seasons?.toString() },
                  { label: 'Episodes',  value: show.number_of_episodes?.toString() },
                  { label: 'Language',  value: show.original_language?.toUpperCase() },
                  { label: 'Networks',  value: (show.networks ?? []).map((n) => n.name).join(', ') || 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1.5 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[--flx-text-3]">{label}</span>
                    <span className="text-sm font-medium text-[--flx-text-2]">{value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>

        {/* Similar Shows */}
        {similar.results.length > 0 && (
          <div className="pt-20 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="h-px bg-linear-to-r from-transparent via-white/5 to-transparent mb-12" />
            <MovieRow title="Recommended for You" items={similar.results.slice(0, 10)} />
          </div>
        )}
      </main>
    </div>
  );
}
