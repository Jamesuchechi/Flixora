import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

type MediaItem = (TMDBMovie | TMDBTVShow) & { media_type?: 'movie' | 'tv' };

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  pill?: { label: string; variant: 'live' | 'new' | 'hot' };
  seeAllHref?: string;
  showRank?: boolean;
  loading?: boolean;
  className?: string;
}

export function MovieRow({
  title, items, pill, seeAllHref, showRank, loading, className,
}: MovieRowProps) {
  return (
    <section className={cn('px-10 py-7', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bebas text-xl tracking-[2px] text-[--flx-text-1] flex items-center gap-2.5">
          {title}
          {pill && <Badge variant={pill.variant}>{pill.label}</Badge>}
        </h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-xs text-[--flx-cyan] font-medium hover:opacity-70 transition-opacity">
            View all →
          </Link>
        )}
      </div>

      {/* Scroll row */}
      <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : items.map((item, i) => {
              const isMovie  = 'title' in item;
              const id       = item.id;
              const title_   = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
              const poster   = item.poster_path;
              const rating   = item.vote_average;
              const date     = isMovie
                ? (item as TMDBMovie).release_date
                : (item as TMDBTVShow).first_air_date;
              const mtype    = item.media_type ?? (isMovie ? 'movie' : 'tv');

              return (
                <MovieCard
                  key={id}
                  id={id}
                  title={title_}
                  posterPath={poster}
                  rating={rating}
                  releaseDate={date}
                  mediaType={mtype}
                  rank={showRank ? i + 1 : undefined}
                />
              );
            })}
      </div>
    </section>
  );
}
