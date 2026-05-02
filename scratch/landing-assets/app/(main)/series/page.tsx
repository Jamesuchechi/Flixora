import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';

export const metadata: Metadata = { title: 'Series' };
export const revalidate = 3600;

export default async function SeriesPage() {
  const [popular, topRated, onAir] = await Promise.all([
    tmdb.tv.popular(),
    tmdb.tv.topRated(),
    tmdb.tv.onAir(),
  ]);

  const featured = onAir.results[0];
  const grid     = popular.results.slice(0, 18);

  return (
    <div className="min-h-screen px-10 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[--flx-text-1]">Series</h1>
          <p className="text-sm text-[--flx-text-3] mt-1">{popular.total_results.toLocaleString()} series available</p>
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <Link href={`/series/${featured.id}`} className="block relative h-[280px] rounded-2xl overflow-hidden mb-10 group">
          <Image
            src={tmdb.image(featured.backdrop_path, 'w1280')}
            alt={featured.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[--flx-bg]/90 via-[--flx-bg]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[--flx-bg]/80 to-transparent" />
          <div className="absolute top-4 left-8">
            <span className="text-[10px] text-[--flx-pink] tracking-widest uppercase font-semibold bg-[--flx-pink]/10 border border-[--flx-pink]/30 px-3 py-1 rounded-full">
              🔴 On Air Now
            </span>
          </div>
          <div className="absolute bottom-8 left-8">
            <h2 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-wide mb-2">{featured.name}</h2>
            <div className="flex items-center gap-2 text-xs text-[--flx-text-2]">
              <span className="text-[--flx-gold]">★ {featured.vote_average.toFixed(1)}</span>
              <span>·</span>
              <span>{getYear(featured.first_air_date)}</span>
            </div>
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {grid.map((show) => (
          <Link key={show.id} href={`/series/${show.id}`} className="group">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2.5 bg-[--flx-surface-2]">
              <Image
                src={tmdb.image(show.poster_path, 'w342')}
                alt={show.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
              <div className="absolute inset-0 bg-[--flx-bg]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-[--flx-purple]/90 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              </div>
            </div>
            <p className="text-[12px] font-medium text-[--flx-text-1] truncate">{show.name}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-[--flx-text-3] mt-0.5">
              <span className="text-[--flx-gold]">★ {show.vote_average.toFixed(1)}</span>
              <span>·</span>
              <span>{getYear(show.first_air_date)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
