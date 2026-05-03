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
import { Badge } from '@/components/ui/Badge';
import { getWatchProgress } from '@/lib/supabase/actions/progress';
import { HeroTrailer } from '@/components/movie/HeroTrailer';
import { TrailerInsights } from '@/components/movie/TrailerInsights';
import type { TMDBCredits, TMDBVideo, TMDBCastMember, TMDBCrewMember } from '@/types/tmdb';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
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
    return { title: 'Movie Detail' };
  }
}

export default async function MovieDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { mode } = await searchParams;
  const movieId = Number(id);

  // Parallel fetch for movie data, credits, videos, and watch progress
  const [movie, creditsRaw, videosRaw, similar, progress] = await Promise.all([
    tmdb.movies.detail(movieId).catch(() => null),
    tmdb.movies.credits(movieId).catch(() => null),
    tmdb.movies.videos(movieId).catch(() => null),
    tmdb.movies.similar(movieId).catch(() => ({ results: [] })),
    getWatchProgress(movieId),
  ]);

  if (!movie) notFound();

  const credits  = creditsRaw as TMDBCredits | null;
  const cast     = (credits?.cast ?? []) as TMDBCastMember[];
  const crew     = (credits?.crew ?? []) as TMDBCrewMember[];
  const director = crew.find((c) => c.job === 'Director');
  const videos   = ((videosRaw as { results?: TMDBVideo[] } | null)?.results ?? []) as TMDBVideo[];

  const backdropUrl = tmdb.image(movie.backdrop_path, 'original');
  const posterUrl   = tmdb.image(movie.poster_path, 'w500');

  return (
    <div className="min-h-screen pb-20">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": movie.title,
            "image": posterUrl,
            "description": movie.overview,
            "datePublished": movie.release_date,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": movie.vote_average,
              "bestRating": "10",
              "ratingCount": movie.vote_count
            }
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative h-[75vh] min-h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={backdropUrl} alt={movie.title} fill className="object-cover object-top opacity-40 scale-105 animate-aurora" priority sizes="100vw" />
          <HeroTrailer videos={videos} title={movie.title} />
          <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg] via-[--flx-bg]/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-[--flx-bg]/40" />
        </div>

        <div className="relative z-10 container mx-auto h-full flex items-end px-6 md:px-12 pb-16">
          <div className="flex flex-col lg:flex-row items-end gap-10 w-full animate-fade-up">
            <div className="hidden lg:block shrink-0 relative w-[240px] h-[360px] rounded-[24px] overflow-hidden shadow-2xl border border-white/10 group">
              <Image src={posterUrl} alt={movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="240px" />
            </div>

            <div className="flex-1 space-y-6 max-w-3xl">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[3px] font-bold text-[--flx-text-3] hover:text-[--flx-cyan] transition-colors group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Explore Movies
              </Link>

              <div className="space-y-3">
                <h1 className="font-bebas text-6xl md:text-8xl leading-[0.9] tracking-tight text-[--flx-text-1] drop-shadow-2xl">{movie.title}</h1>
                {movie.tagline && <p className="text-lg text-[--flx-cyan]/70 font-outfit italic font-light">&quot;{movie.tagline}&quot;</p>}
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-[--flx-text-2] flex-wrap">
                <div className="flex items-center gap-1.5 text-[--flx-gold]">
                  <span className="text-sm">★</span>
                  <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>{getYear(movie.release_date)}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>{formatRuntime(movie.runtime)}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <Badge variant="muted" className="border-white/5 bg-white/5 uppercase tracking-widest px-2 py-0.5">{movie.original_language}</Badge>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                {(movie.genres ?? []).map((g) => (
                  <Badge key={g.id} variant="purple" className="px-4 py-1.5 rounded-xl border-[--flx-purple]/20 bg-[--flx-purple]/10 text-violet-200">{g.name}</Badge>
                ))}
              </div>

              <p className="text-[15px] leading-relaxed text-[--flx-text-1]/70 font-light max-w-2xl">{movie.overview}</p>

              <div className="flex items-center gap-4 flex-wrap pt-4">
                <Link href={`/watch/${movie.id}${mode === 'free' ? '?mode=free' : ''}`} className="flex items-center gap-3 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-bold text-sm px-10 py-4 rounded-2xl transition-all hover:-translate-y-1 shadow-xl shadow-[--flx-purple]/20 active:scale-95">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  {progress && progress.progress > 0 ? `Resume at ${progress.progress}%` : 'Play Now'}
                </Link>
                <TrailerButton videos={videos} title={movie.title} />
                <WatchlistButton id={movie.id} mediaType="movie" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {cast.length > 0 && <CastRow cast={cast} />}
            <TrailerInsights 
              tmdbId={movie.id} 
              title={movie.title} 
              overview={movie.overview || ''} 
              genres={(movie.genres || []).map(g => g.name)} 
            />
            {director && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="font-bebas text-2xl tracking-[3px] text-[--flx-text-1] uppercase">Director</h2>
                <div className="flex items-center gap-5 group cursor-default">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-[--flx-surface-2] to-[--flx-surface-3] border border-white/5 flex items-center justify-center text-[--flx-text-3] group-hover:border-[--flx-cyan]/30 transition-all duration-500 shadow-xl">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[--flx-text-1] group-hover:text-[--flx-cyan] transition-colors">{director.name}</p>
                    <p className="text-xs uppercase tracking-widest text-[--flx-text-3] font-bold">Director</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <aside className="bg-linear-to-b from-[--flx-surface-1] to-[--flx-surface-2] border border-white/5 rounded-[24px] p-8 space-y-6 shadow-2xl backdrop-blur-sm">
              <h2 className="font-bebas text-xl tracking-[3px] text-[--flx-text-1] uppercase border-b border-white/5 pb-4">Details</h2>
              <div className="space-y-5">
                {[
                  { label: 'Status', value: movie.status },
                  { label: 'Released', value: movie.release_date },
                  { label: 'Runtime', value: formatRuntime(movie.runtime) },
                  { label: 'Language', value: movie.original_language?.toUpperCase() },
                  { label: 'Budget', value: movie.budget ? `$${(movie.budget / 1_000_000).toFixed(1)}M` : 'N/A' },
                  { label: 'Revenue', value: movie.revenue ? `$${(movie.revenue / 1_000_000).toFixed(1)}M` : 'N/A' },
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

        {similar.results.length > 0 && (
          <div className="pt-20">
            <div className="h-px bg-linear-to-r from-transparent via-white/5 to-transparent mb-12" />
            <MovieRow title="More Like This" items={similar.results.slice(0, 10)} />
          </div>
        )}
      </main>
    </div>
  );
}
