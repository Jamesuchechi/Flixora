import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { TMDBSearchResult } from '@/types/tmdb';
import { SearchInput } from '@/components/search/SearchInput';
import { DiscoveryUI } from '@/components/search/DiscoveryUI';
import { WatchAdvisor } from '@/components/home/WatchAdvisor';
import { AnimatedNumber } from '@/components/search/AnimatedNumber';
import { Film, Tv, Play, Search } from 'lucide-react';

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Results for "${q}" | Flixora` : 'Discovery | Flixora' };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', type = 'all' } = await searchParams;
  
  const results = q.trim()
    ? await tmdb.search.multi(q).catch(() => ({ results: [] }))
    : { results: [] };

  const items = (results.results as TMDBSearchResult[]).filter(
    (r) => r.media_type !== 'person' && (r.poster_path || r.backdrop_path)
  );

  const movies = items.filter(item => item.media_type === 'movie');
  const series = items.filter(item => item.media_type === 'tv');

  const filteredItems = type === 'movies' ? movies : type === 'series' ? series : items;

  return (
    <div className="min-h-screen px-6 md:px-10 py-24 bg-[--flx-bg]">
      <SearchInput />

      {!q ? (
        <DiscoveryUI />
      ) : (
        <div className="space-y-12">
          {/* Results Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h1 className="font-bebas text-5xl tracking-[4px] text-white uppercase">Results</h1>
                <Badge variant="cyan" className="px-3 py-1 font-black text-[10px] tracking-widest uppercase">&quot;{q}&quot;</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-[--flx-purple]/10 rounded-full border border-[--flx-purple]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--flx-purple] animate-pulse" />
                  <span className="text-[10px] font-black text-[--flx-purple] uppercase tracking-widest flex items-center gap-1">
                    Found <AnimatedNumber value={filteredItems.length} /> Title{filteredItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {[
                { id: 'all', label: 'All Results', count: items.length },
                { id: 'movies', label: 'Movies', count: movies.length },
                { id: 'series', label: 'TV Series', count: series.length },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  href={`/search?q=${encodeURIComponent(q)}&type=${tab.id}`}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all whitespace-nowrap ${
                    type === tab.id 
                      ? "bg-white text-black shadow-xl" 
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded ${type === tab.id ? "bg-black/10 text-black/40" : "bg-white/10 text-white/40"}`}>{tab.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-16">
              {/* Grouped Results */}
              {(type === 'all' || type === 'movies') && movies.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[--flx-cyan]">
                      <Film size={20} />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Movies ({movies.length})</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
                    {movies.map((item, i) => <ResultCard key={item.id} item={item} i={i} />)}
                  </div>
                </section>
              )}

              {(type === 'all' || type === 'series') && series.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[--flx-purple]">
                      <Tv size={20} />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">TV Series ({series.length})</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
                    {series.map((item, i) => <ResultCard key={item.id} item={item} i={i} />)}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="space-y-20">
              <div className="py-20 text-center space-y-6 max-w-xl mx-auto">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-4xl">🏜️</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bebas tracking-widest text-white uppercase">No matches found for &quot;{q}&quot;</h3>
                  <p className="text-sm text-white/40 leading-relaxed uppercase tracking-widest text-[10px] font-bold">Try adjusting your keywords or browse our AI-powered suggestions below.</p>
                </div>
              </div>

              {/* AI Suggested Alternatives */}
              <div className="space-y-8 pt-12 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Search className="text-[--flx-purple]" size={20} />
                  <h2 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">AI Recommended For You</h2>
                </div>
                <WatchAdvisor />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({ item, i }: { item: TMDBSearchResult; i: number }) {
  const isMovie = item.media_type === 'movie';
  const title   = item.title ?? item.name ?? 'Unknown Title';
  const date    = item.release_date ?? item.first_air_date;
  const href    = `/${isMovie ? 'movies' : 'series'}/${item.id}`;
  const watchHref = `/watch/${item.id}${!isMovie ? '?type=tv&s=1&e=1' : ''}`;

  return (
    <Link 
      href={href} 
      className="group animate-fade-up"
      style={{ animationDelay: `${i * 30}ms` }}
    >
      <div className="relative aspect-2/3 rounded-3xl overflow-hidden mb-4 bg-[--flx-surface-2] border border-white/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] group-hover:border-[--flx-cyan]/30">
        <Image
          src={tmdb.image(item.poster_path, 'w500')}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-1000"
          sizes="(max-width: 640px) 50vw, 180px"
        />
        
        {/* Floating Media Type Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="text-[8px] font-black tracking-[2px] uppercase bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg border border-white/10 shadow-lg">
            {isMovie ? 'Movie' : 'Series'}
          </span>
        </div>

        {/* Rating Overlay */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
            <span className="text-[--flx-gold] text-[10px]">★</span>
            <span className="text-[10px] font-bold text-white">{(item.vote_average ?? 0).toFixed(1)}</span>
          </div>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-xs">
          <Link 
            href={watchHref}
            className="w-14 h-14 rounded-full bg-[--flx-cyan] flex items-center justify-center shadow-xl shadow-[--flx-cyan]/20 scale-50 group-hover:scale-100 transition-all duration-500 hover:scale-110 active:scale-95"
          >
            <Play size={20} fill="black" className="ml-1" />
          </Link>
          <span className="text-[9px] font-black uppercase tracking-[2px] text-white translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">Watch Now</span>
        </div>
      </div>

      <div className="space-y-1 px-1">
        <h4 className="text-[14px] font-bold text-white truncate group-hover:text-[--flx-cyan] transition-colors leading-tight tracking-wide">
          {title}
        </h4>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
          <span>{date ? getYear(date) : 'N/A'}</span>
          <span>•</span>
          <span className="text-[--flx-text-3] group-hover:text-white transition-colors">{isMovie ? 'Feature' : 'Series'}</span>
        </div>
      </div>
    </Link>
  );
}

