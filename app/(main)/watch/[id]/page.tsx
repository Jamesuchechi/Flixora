import Link from 'next/link';
import type { TMDBVideo } from '@/types/tmdb';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { WatchlistButton } from '@/components/movie/WatchlistButton';
import { MovieRow } from '@/components/home/MovieRow';
import { ExternalRatings } from '@/components/movie/ExternalRatings';
import { StreamingAvailability } from '@/components/movie/StreamingAvailability';
import { TVAiringStatus } from '@/components/movie/TVAiringStatus';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/watch/VideoPlayer').then(mod => mod.VideoPlayer), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-white/5 animate-pulse rounded-2xl border border-white/10" />
});

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string; e?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await tmdb.movies.detail(Number(id), { silent: true }).catch(() => null);
    const show  = movie ? null : await tmdb.tv.detail(Number(id), { silent: true }).catch(() => null);
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

  // Parallel fetch for movie/show data, recommendations, and initial progress
  const [movie, show, similar, externalIds, videos] = await Promise.all([
    tmdb.movies.detail(mediaId, { silent: true }).catch(() => null),
    tmdb.tv.detail(mediaId, { silent: true }).catch(() => null),
    tmdb.movies.similar(mediaId, { silent: true }).catch(() => ({ results: [] })),
    tmdb.movies.externalIds(mediaId, { silent: true }).catch(() => null),
    tmdb.movies.videos(mediaId, { silent: true }).catch(() => ({ results: [] })),
  ]);

  const isMovie = !!movie && !show?.name;
  // Identify the best trailer key
  const trailerResults = videos.results as TMDBVideo[];
  const trailer = trailerResults.find(v => v.type === 'Trailer' && v.site === 'YouTube') || trailerResults[0];
  
  let imdbId = movie?.imdb_id ?? externalIds?.imdb_id;
  if (!isMovie && show && !imdbId) {
    const tvExt = await tmdb.tv.externalIds(mediaId, { silent: true }).catch(() => null);
    imdbId = tvExt?.imdb_id;
  }

  const title   = movie?.title ?? show?.name ?? 'Unknown Title';
  const backdrop = tmdb.image(movie?.backdrop_path ?? show?.backdrop_path, 'original');
  const rating  = movie?.vote_average ?? show?.vote_average ?? 0;
  const backHref = isMovie ? `/movies/${mediaId}` : `/series/${mediaId}`;

  // Next episode logic (Simplified: assume there's a next episode if it's a TV show)
  const nextEpisodeUrl = !isMovie ? `/watch/${mediaId}?s=${s}&e=${Number(e) + 1}` : undefined;

  return (
    <div className="min-h-screen pb-20 bg-[--flx-bg]">
      
      {/* ── CINEMATIC PLAYER AREA ── */}
      <section className="w-full bg-black/40 border-b border-white/5 py-12">
        <div className="container mx-auto px-6">
          <VideoPlayer 
            tmdbId={mediaId}
            mediaType={isMovie ? 'movie' : 'tv'}
            title={title}
            backdrop={backdrop}
            season={Number(s)}
            episode={Number(e)}
            youtubeId={trailer?.key}
            nextEpisodeUrl={nextEpisodeUrl}
          />
        </div>
      </section>

      {/* ── METADATA & ACTIONS ── */}
      <section className="container mx-auto px-6 pt-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
          
          <div className="flex-1 space-y-8">
            <div className="flex flex-col gap-6">
              <Link href={backHref} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[3px] font-bold text-[--flx-text-3] hover:text-[--flx-cyan] transition-colors group w-fit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Details
              </Link>

              <div className="space-y-4">
                <h1 className="font-bebas text-5xl md:text-6xl tracking-tight text-[--flx-text-1] uppercase">{title}</h1>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-[--flx-gold]">
                      <span className="text-lg">★</span>
                      <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <ExternalRatings imdbId={imdbId} />
                    <div className="h-4 w-px bg-white/10" />
                    <WatchlistButton id={mediaId} mediaType={isMovie ? 'movie' : 'tv'} size="sm" className="bg-transparent border-white/5 hover:bg-white/5" />
                  </div>
                </div>
              </div>
            </div>

            <StreamingAvailability imdbId={imdbId} />
          </div>

          <div className="w-full lg:w-80 space-y-8">
            <TVAiringStatus imdbId={imdbId} />
          </div>
        </div>

        {/* Similar Titles */}
        {similar.results.length > 0 && (
          <div className="mt-20 pt-16 border-t border-white/5">
            <MovieRow title="More Like This" items={similar.results.slice(0, 10)} />
          </div>
        )}
      </section>
    </div>
  );
}
