'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { tmdb } from '@/lib/tmdb';
import { formatRuntime } from '@/lib/utils';
import type { TMDBSeason, TMDBEpisode } from '@/types/tmdb';

interface SeasonSelectorProps {
  seriesId: number;
  seasons: TMDBSeason[];
}

export function SeasonSelector({ seriesId, seasons }: SeasonSelectorProps) {
  const validSeasons  = seasons.filter((s) => s.season_number > 0);
  const [selected, setSelected]   = useState(validSeasons[0]?.season_number ?? 1);
  const [episodes, setEpisodes]   = useState<TMDBEpisode[]>([]);
  const [loading, setLoading]     = useState(false);
  const [loaded, setLoaded]       = useState<number | null>(null);

  const loadSeason = async (num: number) => {
    if (loaded === num) return;
    setSelected(num);
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/tv/${seriesId}/season/${num}`);
      const data = await res.json();
      setEpisodes(data.episodes ?? []);
      setLoaded(num);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Season tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {validSeasons.map((s) => (
          <button
            key={s.season_number}
            onClick={() => loadSeason(s.season_number)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              selected === s.season_number
                ? 'bg-[--flx-purple]/18 border-[--flx-purple]/45 text-violet-300'
                : 'border-white/8 text-[--flx-text-3] hover:border-white/20 hover:text-[--flx-text-2]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Episodes */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-[160px] h-[90px] rounded-lg bg-white/5 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {episodes.length > 0 && !loading && (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/${seriesId}?season=${ep.season_number}&ep=${ep.episode_number}`}
              className="flex gap-3 group hover:bg-white/3 rounded-xl p-2 -mx-2 transition-colors"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 relative w-[160px] h-[90px] rounded-lg overflow-hidden bg-[--flx-surface-2]">
                <Image
                  src={tmdb.image(ep.still_path, 'w300')}
                  alt={ep.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="160px"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <div className="w-9 h-9 rounded-full bg-[--flx-purple]/90 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </div>
                {/* Episode number */}
                <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white/70 bg-black/60 px-1.5 py-0.5 rounded">
                  E{ep.episode_number}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-medium text-[--flx-text-1] mb-1 group-hover:text-white transition-colors truncate">{ep.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-[--flx-text-3] mb-1.5">
                  {ep.runtime > 0 && <span>{formatRuntime(ep.runtime)}</span>}
                  {ep.air_date && <><span>·</span><span>{ep.air_date}</span></>}
                  {ep.vote_average > 0 && <><span>·</span><span className="text-[--flx-gold]">★ {ep.vote_average.toFixed(1)}</span></>}
                </div>
                <p className="text-xs text-[--flx-text-3] line-clamp-2 leading-relaxed">{ep.overview}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && loaded === null && (
        <button
          onClick={() => loadSeason(selected)}
          className="text-sm text-[--flx-cyan] hover:opacity-70 transition-opacity cursor-pointer"
        >
          Load episodes →
        </button>
      )}
    </div>
  );
}
