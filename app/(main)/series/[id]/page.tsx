import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { CastRow } from '@/components/movie/CastRow';
import { TrailerButton } from '@/components/movie/TrailerButton';
import { WatchlistButton } from '@/components/movie/WatchlistButton';
import { ShareButton } from '@/components/movie/ShareButton';
import { HeroTrailer } from '@/components/movie/HeroTrailer';
import { SeasonSelector } from '@/components/tv/SeasonSelector';
import { TrailerInsights } from '@/components/movie/TrailerInsights';
import { MovieRow } from '@/components/home/MovieRow';
import { LandscapeCard } from '@/components/movie/LandscapeCard';
import type { TMDBCredits, TMDBVideo, TMDBCastMember, TMDBSeason, TMDBExternalIds } from '@/types/tmdb';

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
    const ogImage = tmdb.image(show.backdrop_path, 'original');
    
    return {
      title: show.name,
      description: show.overview?.slice(0, 160),
      openGraph: {
        title: show.name,
        description: show.overview?.slice(0, 160),
        images: [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: show.name,
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title: show.name,
        description: show.overview?.slice(0, 160),
        images: [ogImage],
      },
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
  const [show, creditsRaw, videosRaw, similar, externalIds] = await Promise.all([
    tmdb.tv.detail(showId).catch(() => null),
    tmdb.tv.credits(showId).catch(() => null),
    tmdb.tv.videos(showId).catch(() => null),
    tmdb.tv.similar(showId).catch(() => ({ results: [] })),
    tmdb.tv.externalIds(showId).catch(() => null as TMDBExternalIds | null),
  ]);

  if (!show) notFound();

  const credits  = creditsRaw as TMDBCredits | null;
  const cast     = (credits?.cast ?? []) as TMDBCastMember[];
  const videos   = ((videosRaw as { results?: TMDBVideo[] } | null)?.results ?? []) as TMDBVideo[];
  const seasons  = (show.seasons ?? []) as TMDBSeason[];
  const runtime  = show.episode_run_time?.[0];

  const backdropUrl = tmdb.image(show.backdrop_path, 'original');
  const posterUrl   = tmdb.image(show.poster_path, 'w500');

  // Ambient glow color approximation
  const isAction = show.genres?.some(g => g.name === 'Action' || g.name === 'Action & Adventure');
  const isHorror = show.genres?.some(g => g.name === 'Horror' || g.name === 'Mystery');
  const glowColor = show.vote_average > 7.5 ? 'bg-purple-500' : isAction ? 'bg-orange-500' : isHorror ? 'bg-red-500' : 'bg-cyan-500';

  const formattedRatings = new Intl.NumberFormat('en-US', { notation: 'compact' }).format(show.vote_count);

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
      <section className="relative h-[80vh] min-h-[700px] w-full overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={backdropUrl} 
            alt={show.name} 
            fill 
            className="object-cover object-top opacity-50 scale-105 animate-aurora" 
            priority 
            sizes="100vw" 
          />
          <HeroTrailer videos={videos} title={show.name} />
          <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg] via-[--flx-bg]/65 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-[--flx-bg]/40" />
        </div>

        {/* Hero Content Wrapper */}
        <div className="relative z-10 container mx-auto h-full flex items-end px-6 md:px-12 pb-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 w-full animate-fade-up">
            
            {/* Poster with Glow & Reflection */}
            <div className="hidden lg:block shrink-0 relative group">
              {/* Ambient Glow */}
              <div className={`absolute -inset-10 ${glowColor} opacity-20 blur-[100px] rounded-full pointer-events-none group-hover:opacity-30 transition-opacity duration-1000`} />
              
              <div className="relative w-[280px] h-[420px] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 group z-10">
                <Image src={posterUrl} alt={show.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="280px" />
              </div>

              {/* Reflection */}
              <div className="absolute top-[420px] left-0 w-[280px] h-[200px] pointer-events-none select-none opacity-20 scale-y-[-1] blur-[2px]">
                <Image src={posterUrl} alt="" fill className="object-cover" sizes="280px" />
                <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] to-transparent" />
              </div>
            </div>

            {/* Series Information */}
            <div className="flex-1 space-y-8 max-w-4xl text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="font-bebas text-7xl md:text-9xl leading-[0.85] tracking-tight text-[--flx-text-1] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {show.name}
                </h1>
                {show.tagline && (
                  <p className="text-xl text-[--flx-purple]/80 font-outfit italic font-light tracking-wide">
                    &quot;{show.tagline}&quot;
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                  <span className="text-[--flx-gold] text-3xl font-black drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">★ {show.vote_average.toFixed(1)}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[2px] font-black text-[--flx-text-3]">Rating</span>
                    <span className="text-[11px] font-bold text-white/60">{formattedRatings} ratings</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-start">
                   <div className="flex items-center gap-3 text-sm font-black text-white/40 uppercase tracking-widest">
                    <span>{getYear(show.first_air_date)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{show.number_of_seasons} Seasons</span>
                    {runtime && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>~{runtime}m</span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[--flx-cyan]">{show.status}</span>
                   </div>
                   <div className="flex gap-2.5 pt-1">
                    {(show.genres ?? []).slice(0, 3).map((g) => (
                      <span key={g.id} className="text-[10px] font-black uppercase tracking-[2px] text-white/30">{g.name}</span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-[--flx-text-1]/80 font-medium max-w-2xl line-clamp-3 lg:line-clamp-none">
                {show.overview}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-center lg:justify-start gap-5 flex-wrap pt-4">
                <Link
                  href={`/watch/${show.id}?type=tv&s=1&e=1${mode === 'free' ? '&mode=free' : ''}`}
                  className="group flex items-center gap-4 bg-linear-to-br from-[--flx-purple] to-[--flx-purple-d] text-white font-black text-sm uppercase tracking-[2px] px-12 py-5 rounded-[20px] transition-all hover:-translate-y-1 shadow-2xl shadow-[--flx-purple]/30 active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform"><polygon points="5 3 19 12 5 21 5 3" /></svg>
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
      <main className="container mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Primary Column — Episodes & Cast */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* Episode Navigator */}
            {seasons.length > 0 && (
              <div className="space-y-8 animate-fade-up">
                <div className="flex items-center gap-4">
                  <h2 className="font-bebas text-3xl tracking-[4px] text-[--flx-text-1] uppercase">Episodes</h2>
                  <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
                </div>
                <SeasonSelector seriesId={show.id} seasons={seasons} />
              </div>
            )}

            {/* Cast Row */}
            {cast.length > 0 && (
              <div className="animate-fade-up">
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
          <div className="lg:col-span-4">
            <aside className="sticky top-24 bg-linear-to-b from-[--flx-surface-1] to-[--flx-surface-2] border border-white/5 rounded-[32px] p-10 space-y-8 shadow-[inset_0_0_40px_rgba(139,92,246,0.05)] backdrop-blur-xl">
              <h2 className="font-bebas text-2xl tracking-[4px] text-[--flx-text-1] uppercase border-b border-white/5 pb-6">Series Info</h2>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: 'Status',    value: show.status },
                  { label: 'Seasons',   value: show.number_of_seasons?.toString() },
                  { label: 'Episodes',  value: show.number_of_episodes?.toString() },
                  { label: 'Language',  value: show.original_language?.toUpperCase() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-black text-[--flx-text-3]">{label}</span>
                    <span className="text-sm font-bold text-[--flx-text-1]">{value || 'N/A'}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <ShareButton />
                {externalIds?.imdb_id && (
                  <Link 
                    href={`https://www.imdb.com/title/${externalIds.imdb_id}`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-white/10 bg-black/20 text-[--flx-gold] font-black text-[10px] uppercase tracking-[2px] hover:bg-[--flx-gold] hover:text-black transition-all"
                  >
                    View on IMDb
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* Similar Shows */}
        {similar.results.length > 0 && (
          <div className="pt-24 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-4xl tracking-[4px] text-[--flx-text-1]">More Like This</h2>
              <div className="h-1 flex-1 mx-10 bg-white/5 rounded-full" />
            </div>

            {/* Hybrid Layout: First 6 as Grid, rest as Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similar.results.slice(0, 6).map((item) => (
                <LandscapeCard 
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  backdropPath={item.backdrop_path}
                  rating={item.vote_average}
                  releaseDate={item.first_air_date}
                  mediaType="tv"
                />
              ))}
            </div>

            {similar.results.length > 6 && (
              <div className="pt-12">
                <MovieRow 
                  title="Even More Suggestions" 
                  items={similar.results.slice(6, 16).map(s => ({ ...s, media_type: 'tv' }))} 
                  className="px-0!"
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
