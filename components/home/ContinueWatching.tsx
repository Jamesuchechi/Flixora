import Image from 'next/image';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { getAllWatchProgress } from '@/lib/supabase/actions/progress';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface ContinueWatchingItem {
  id: number;
  title: string;
  image: string;
  progress: number;
  type: 'movie' | 'tv';
  episodeInfo?: string;
}

export async function ContinueWatching() {
  const progressData = await getAllWatchProgress();

  if (progressData.length === 0) return null;

  // Fetch TMDB details for each item in parallel
  const items: (ContinueWatchingItem | null)[] = await Promise.all(
    progressData.map(async (p) => {
      try {
        if (p.media_type === 'movie') {
          const movie = await tmdb.movies.detail(p.tmdb_id, { silent: true }) as TMDBMovie;
          return {
            id: p.tmdb_id,
            title: movie.title || 'Unknown',
            image: movie.backdrop_path || movie.poster_path || '',
            progress: p.progress,
            type: 'movie',
          };
        } else {
          const show = await tmdb.tv.detail(p.tmdb_id, { silent: true }) as TMDBTVShow;
          return {
            id: p.tmdb_id,
            title: show.name || 'Unknown',
            image: show.backdrop_path || show.poster_path || '',
            progress: p.progress,
            type: 'tv',
            episodeInfo: `S${p.season}:E${p.episode}`,
          };
        }
      } catch {
        return null;
      }
    })
  );

  const validItems = items.filter((item): item is ContinueWatchingItem => item !== null);

  if (validItems.length === 0) return null;

  return (
    <section className="px-10 py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-bebas text-2xl tracking-[2px] text-[--flx-text-1] uppercase">Continue Watching</h2>
        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-linear-to-r from-[--flx-purple] to-[--flx-cyan]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {validItems.map((item) => (
          <Link 
            key={item.id} 
            href={`/watch/${item.id}${item.type === 'tv' ? '?season=1&ep=1' : ''}`}
            className="group relative flex flex-col gap-3"
          >
            {/* Thumbnail Wrapper */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[--flx-surface-2] border border-white/5 shadow-lg transition-all duration-500 group-hover:scale-[1.02] group-hover:border-[--flx-purple]/40 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <Image 
                src={tmdb.image(item.image, 'w780')} 
                alt={item.title} 
                fill 
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                 <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                 </div>
              </div>

              {/* Episode Badge */}
              {item.episodeInfo && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                  {item.episodeInfo}
                </div>
              )}

              {/* Progress Bar Container */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                <div 
                  className="h-full bg-linear-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] transition-all duration-1000" 
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="px-1 flex justify-between items-start">
               <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors">{item.title}</h4>
                  <p className="text-[10px] text-[--flx-text-3] uppercase tracking-widest font-bold mt-0.5">
                    {item.progress}% Watched
                  </p>
               </div>
               <button className="p-1.5 rounded-lg text-[--flx-text-3] hover:text-white hover:bg-white/5 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
               </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
