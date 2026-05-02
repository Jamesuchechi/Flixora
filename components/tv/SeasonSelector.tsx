'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { tmdb } from '@/lib/tmdb';
import { formatRuntime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TMDBSeason, TMDBEpisode } from '@/types/tmdb';

interface SeasonSelectorProps {
  seriesId: number;
  seasons: TMDBSeason[];
}

/**
 * Premium Episode List and Season Navigator.
 */
export function SeasonSelector({ seriesId, seasons }: SeasonSelectorProps) {
  const validSeasons  = seasons.filter((s) => s.season_number > 0);
  const [selected, setSelected]   = useState(validSeasons[0]?.season_number ?? 1);
  const [episodes, setEpisodes]   = useState<TMDBEpisode[]>([]);
  const [loading, setLoading]     = useState(false);
  const [loaded, setLoaded]       = useState<number | null>(null);

  const loadSeason = async (num: number) => {
    if (loaded === num && !loading) return;
    setSelected(num);
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/tv/${seriesId}/season/${num}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEpisodes(data.episodes ?? []);
      setLoaded(num);
    } catch (err) {
      console.error('Season fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load the first season on mount
  useEffect(() => {
    if (validSeasons.length > 0) {
      loadSeason(validSeasons[0].season_number);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Season Selection Tabs */}
      <div className="flex gap-2.5 flex-wrap">
        {validSeasons.map((s) => (
          <button
            key={s.season_number}
            onClick={() => loadSeason(s.season_number)}
            className={`px-5 py-2 rounded-xl text-xs font-medium tracking-wide border transition-all duration-300 cursor-pointer ${
              selected === s.season_number
                ? 'bg-[--flx-purple]/18 border-[--flx-purple]/45 text-violet-200 shadow-lg shadow-[--flx-purple]/5'
                : 'bg-white/5 border-white/5 text-[--flx-text-3] hover:border-white/20 hover:text-[--flx-text-2]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Episodes List / Skeletons */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-2 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <Skeleton className="w-[180px] h-[101px] shrink-0" rounded="lg" />
              <div className="flex-1 space-y-3 pt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2 opacity-50" />
              </div>
            </div>
          ))
        ) : (
          episodes.map((ep, i) => (
            <Link
              key={ep.id}
              href={`/watch/${seriesId}?s=${ep.season_number}&e=${ep.episode_number}`}
              className="flex gap-4 group p-2 -mx-2 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Thumbnail Container */}
              <div className="relative w-[180px] h-[101px] shrink-0 rounded-xl overflow-hidden bg-[--flx-surface-2] border border-white/5">
                {ep.still_path ? (
                  <Image
                    src={tmdb.image(ep.still_path, 'w300')}
                    alt={ep.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="180px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[--flx-surface-3] text-[--flx-text-3] text-xs font-bebas uppercase tracking-widest">
                    No Preview
                  </div>
                )}
                
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-10 h-10 rounded-full bg-[--flx-purple] flex items-center justify-center shadow-xl shadow-[--flx-purple]/40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </div>
                
                {/* Number Badge */}
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-tighter">
                  EP {ep.episode_number}
                </span>
              </div>

              {/* Episode Info */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h4 className="text-sm font-semibold text-[--flx-text-1] group-hover:text-white transition-colors truncate">
                    {ep.name}
                  </h4>
                  {ep.vote_average > 0 && (
                    <span className="text-[10px] font-bold text-[--flx-gold] shrink-0">
                      ★ {ep.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2.5 text-[10px] text-[--flx-text-3] mb-2 font-medium">
                  {ep.runtime > 0 && <span>{formatRuntime(ep.runtime)}</span>}
                  {ep.air_date && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span>{ep.air_date}</span>
                    </>
                  )}
                </div>
                
                <p className="text-[12px] text-[--flx-text-3] line-clamp-2 leading-relaxed font-light group-hover:text-[--flx-text-2] transition-colors">
                  {ep.overview || "No overview available for this episode."}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
