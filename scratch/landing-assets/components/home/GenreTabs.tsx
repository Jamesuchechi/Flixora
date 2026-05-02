'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Horror', 'Comedy', 'Anime', 'Documentary'];

export function GenreTabs() {
  const activeGenre  = useStore((s) => s.activeGenre);
  const setGenre     = useStore((s) => s.setActiveGenre);

  return (
    <div className="flex gap-2 flex-wrap mb-5">
      {GENRES.map((g) => (
        <button
          key={g}
          onClick={() => setGenre(g)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide border transition-all duration-150 cursor-pointer',
            activeGenre === g
              ? 'bg-[--flx-purple]/18 border-[--flx-purple]/45 text-violet-300'
              : 'bg-transparent border-white/8 text-[--flx-text-3] hover:border-white/15 hover:text-[--flx-text-2]'
          )}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
