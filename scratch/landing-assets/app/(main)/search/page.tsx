import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import type { TMDBSearchResult } from '@/types/tmdb';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `"${q}" — Search` : 'Search' };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const results = q.trim()
    ? await tmdb.search.multi(q).catch(() => ({ results: [] }))
    : { results: [] };

  const items = (results.results as TMDBSearchResult[]).filter(
    (r) => r.media_type !== 'person'
  );

  return (
    <div className="min-h-screen px-10 py-8">
      <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[--flx-text-1] mb-2">
        {q ? `Results for "${q}"` : 'Search'}
      </h1>
      {q && (
        <p className="text-sm text-[--flx-text-3] mb-8">
          {items.length} result{items.length !== 1 ? 's' : ''} found
        </p>
      )}

      {!q && (
        <p className="text-sm text-[--flx-text-3] mt-4">Use the search bar (⌘K) to find movies and series.</p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => {
            const isMovie = item.media_type === 'movie';
            const title   = item.title ?? item.name ?? 'Unknown';
            const date    = item.release_date ?? item.first_air_date;
            const href    = `/${isMovie ? 'movies' : 'series'}/${item.id}`;

            return (
              <Link key={item.id} href={href} className="group">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2.5 bg-[--flx-surface-2]">
                  <Image
                    src={tmdb.image(item.poster_path, 'w342')}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-[--flx-bg]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-[--flx-purple]/90 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 text-[9px] font-semibold tracking-widest uppercase bg-black/60 text-white/70 px-1.5 py-0.5 rounded">
                    {isMovie ? 'Movie' : 'Series'}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-[--flx-text-1] truncate">{title}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-[--flx-text-3] mt-0.5">
                  {item.vote_average && item.vote_average > 0 && (
                    <span className="text-[--flx-gold]">★ {item.vote_average.toFixed(1)}</span>
                  )}
                  {date && <><span>·</span><span>{getYear(date)}</span></>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
