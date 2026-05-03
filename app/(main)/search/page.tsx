import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { TMDBSearchResult } from '@/types/tmdb';

import { SearchInput } from '@/components/search/SearchInput';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

/**
 * Dynamic metadata for search results.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Results for "${q}" | Flixora` : 'Search | Flixora' };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  
  // Perform multi-search (Movies + TV)
  const results = q.trim()
    ? await tmdb.search.multi(q).catch(() => ({ results: [] }))
    : { results: [] };

  // Filter out people (actors/directors) for this specific results grid
  const items = (results.results as TMDBSearchResult[]).filter(
    (r) => r.media_type !== 'person' && (r.poster_path || r.backdrop_path)
  );

  return (
    <div className="min-h-screen px-6 md:px-10 py-24">
      {/* ── Search Input Section ── */}
      <SearchInput />

      {/* ── Search Header ── */}
      {q && (
        <div className="mb-12 space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="font-bebas text-5xl tracking-[4px] text-[--flx-text-1] uppercase">
              Results
            </h1>
            <Badge variant="cyan" className="mt-1.5 px-3 py-1">
              &quot;{q}&quot;
            </Badge>
          </div>
          <p className="text-[11px] font-bold text-[--flx-text-3] uppercase tracking-[2px]">
            Found {items.length} matching title{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* ── Results Grid ── */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
          {items.map((item, i) => {
            const isMovie = item.media_type === 'movie';
            const title   = item.title ?? item.name ?? 'Unknown Title';
            const date    = item.release_date ?? item.first_air_date;
            const href    = `/${isMovie ? 'movies' : 'series'}/${item.id}`;

            return (
              <Link 
                key={item.id} 
                href={href} 
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="relative aspect-2/3 rounded-2xl overflow-hidden mb-4 bg-[--flx-surface-2] border border-white/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:border-[--flx-cyan]/30">
                  <Image
                    src={tmdb.image(item.poster_path, 'w342')}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, 16vw"
                  />
                  
                  {/* Floating Media Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold tracking-[2px] uppercase bg-black/60 backdrop-blur-md text-white/90 px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                      {isMovie ? 'Movie' : 'Series'}
                    </span>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-[--flx-purple] flex items-center justify-center shadow-xl shadow-[--flx-purple]/40 active:scale-90 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[14px] font-semibold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors leading-tight">
                    {title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[--flx-text-3] uppercase tracking-tighter">
                    {item.vote_average && item.vote_average > 0 && (
                      <span className="text-[--flx-gold]">★ {item.vote_average.toFixed(1)}</span>
                    )}
                    {date && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>{getYear(date)}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : q ? (
        <div className="py-20 text-center space-y-4">
           <p className="text-3xl">🏜️</p>
           <h3 className="text-lg font-medium text-[--flx-text-2]">No matches found for &quot;{q}&quot;</h3>
           <p className="text-sm text-[--flx-text-3]">Try adjusting your keywords or searching for a broader term.</p>
        </div>
      ) : null}
    </div>
  );
}
