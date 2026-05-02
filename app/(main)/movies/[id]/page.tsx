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
import type { TMDBCredits, TMDBVideo, TMDBCastMember, TMDBCrewMember } from '@/types/tmdb';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Generate dynamic SEO metadata for the movie.
 */
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

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movieId = Number(id);

  // Parallel fetch for optimal performance
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
    <div className="min-h-screen pb-20">
      {/* ── IMMERSIVE HERO SECTION ── */}
      <section className="relative h-[75vh] min-h-[600px] w-full overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={backdropUrl} 
            alt={movie.title} 
            fill 
            className="object-cover object-top opacity-40 scale-105 animate-aurora" 
            priority 
            sizes="100vw" 
          />
          {/* Complex Overlays for depth */}
          <div className="absolute inset-0 bg-linear-to-r from-[--flx-bg] via-[--flx-bg]/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-[--flx-bg]/40" />
          
          {/* Aurora Ambient Glows */}
          <div className="absolute w-[600px] h-[400px] -top-40 -left-20 rounded-full bg-[--flx-purple]/20 blur-[120px] mix-blend-screen animate-aurora" />
          <div className="absolute w-[500px] h-[300px] top-1/4 -right-20 rounded-full bg-[--flx-cyan]/10 blur-[100px] mix-blend-screen animate-aurora" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Hero Content Wrapper */}
        <div className="relative z-10 container mx-auto h-full flex items-end px-6 md:px-12 pb-16">
          <div className="flex flex-col lg:flex-row items-end gap-10 w-full animate-fade-up">
            
            {/* High-Fidelity Poster Image */}
            <div className="hidden lg:block shrink-0 relative w-[240px] h-[360px] rounded-[24px] overflow-hidden shadow-[0_0_80px_rgba(139,92,246,0.3),0_40px_80px_rgba(0,0,0,0.9)] border border-white/10 group">
              <Image 
                src={posterUrl} 
                alt={movie.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                sizes="240px" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-[--flx-purple]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Movie Information Pane */}
            <div className="flex-1 space-y-6 max-w-3xl">
              {/* Breadcrumb Navigation */}
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[3px] font-bold text-[--flx-text-3] hover:text-[--flx-cyan] transition-colors group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Explore Movies
              </Link>

              <div className="space-y-3">
                <h1 className="font-bebas text-6xl md:text-8xl leading-[0.9] tracking-tight text-[--flx-text-1] drop-shadow-2xl">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-lg text-[--flx-cyan]/70 font-outfit italic font-light">
                    &quot;{movie.tagline}&quot;
                  </p>
                )}
              </div>

              {/* Comprehensive Metadata Meta-row */}
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
                <Badge variant="muted" className="border-white/5 bg-white/5 uppercase tracking-widest px-2 py-0.5">
                  {movie.original_language}
                </Badge>
              </div>

              {/* Genre Chips */}
              <div className="flex gap-2.5 flex-wrap">
                {(movie.genres ?? []).map((g) => (
                  <Badge key={g.id} variant="purple" className="px-4 py-1.5 rounded-xl border-[--flx-purple]/20 bg-[--flx-purple]/10 text-violet-200">
                    {g.name}
                  </Badge>
                ))}
              </div>

              {/* Plot Synopsis */}
              <p className="text-[15px] leading-relaxed text-[--flx-text-1]/70 font-light max-w-2xl">
                {movie.overview}
              </p>

              {/* Primary Call to Actions */}
              <div className="flex items-center gap-4 flex-wrap pt-4">
                <Link
                  href={`/watch/${movie.id}`}
                  className="flex items-center gap-3 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-bold text-sm px-10 py-4 rounded-2xl transition-all hover:-translate-y-1 shadow-xl shadow-[--flx-purple]/20 active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Play Now
                </Link>
                <TrailerButton videoKey={trailer?.key ?? null} title={movie.title} />
                <WatchlistButton id={movie.id} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── DETAILED CONTENT BODY ── */}
      <main className="container mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Primary Column — Cast & Credits */}
          <div className="lg:col-span-8 space-y-16">
            {cast.length > 0 && (
              <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <CastRow cast={cast} />
              </div>
            )}

            {/* Director Section */}
            {director && (
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
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

          {/* Sidebar Column — Production Details */}
          <div className="lg:col-span-4 space-y-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <aside className="bg-linear-to-b from-[--flx-surface-1] to-[--flx-surface-2] border border-white/5 rounded-[24px] p-8 space-y-6 shadow-2xl backdrop-blur-sm">
              <h2 className="font-bebas text-xl tracking-[3px] text-[--flx-text-1] uppercase border-b border-white/5 pb-4">Details</h2>

              <div className="space-y-5">
                {[
                  { label: 'Status',   value: movie.status },
                  { label: 'Released', value: movie.release_date },
                  { label: 'Runtime',  value: formatRuntime(movie.runtime) },
                  { label: 'Language', value: movie.original_language?.toUpperCase() },
                  {
                    label: 'Budget',
                    value: movie.budget ? `$${(movie.budget / 1_000_000).toFixed(1)}M` : 'Not Disclosed',
                  },
                  {
                    label: 'Revenue',
                    value: movie.revenue ? `$${(movie.revenue / 1_000_000).toFixed(1)}M` : 'Not Disclosed',
                  },
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

        {/* ── SIMILAR TITLES SECTION ── */}
        {similar.results.length > 0 && (
          <div className="pt-20 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="h-px bg-linear-to-r from-transparent via-white/5 to-transparent mb-12" />
            <MovieRow title="More Like This" items={similar.results.slice(0, 10)} />
          </div>
        )}
      </main>
    </div>
  );
}
