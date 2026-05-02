'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import Image from 'next/image';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { debounce, getYear } from '@/lib/utils';
import type { TMDBSearchResult } from '@/types/tmdb';

export function SearchOverlay() {
  const searchOpen    = useStore((s) => s.searchOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const inputRef      = useRef<HTMLInputElement>(null);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  // Debounced search
  const doSearch = debounce(async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults((data.results ?? []).filter((r: TMDBSearchResult) => r.media_type !== 'person').slice(0, 8));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, 300);

  const handleChange = (q: string) => {
    setQuery(q);
    setLoading(!!q.trim());
    doSearch(q);
  };

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[--flx-bg]/85 backdrop-blur-xl flex items-start justify-center pt-20 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
    >
      <div className="w-full max-w-2xl bg-[--flx-surface-1] border border-[--flx-border-p] rounded-2xl overflow-hidden shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[--flx-border]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#55557a" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search movies, series..."
            className="flex-1 bg-transparent text-[--flx-text-1] text-sm placeholder-[--flx-text-3] outline-none"
          />
          {loading && (
            <svg className="animate-spin w-4 h-4 text-[--flx-text-3]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <button onClick={() => setSearchOpen(false)} className="text-[--flx-text-3] hover:text-[--flx-text-1] transition-colors text-xs border border-white/10 rounded px-1.5 py-0.5 cursor-pointer">
            ESC
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-[420px] overflow-y-auto py-2 scrollbar-hide">
            {results.map((item) => {
              const title     = item.title ?? item.name ?? 'Unknown';
              const isMovie   = item.media_type === 'movie';
              const href      = `/${isMovie ? 'movies' : 'series'}/${item.id}`;
              const year      = getYear(item.release_date ?? item.first_air_date);
              const poster    = tmdb.image(item.poster_path, 'w92');

              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-white/4 transition-colors"
                  >
                    <div className="relative w-9 h-14 rounded-md overflow-hidden flex-shrink-0 bg-[--flx-surface-2]">
                      <Image src={poster} alt={title} fill className="object-cover" sizes="36px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[--flx-text-1] font-medium truncate">{title}</p>
                      <p className="text-xs text-[--flx-text-3] mt-0.5">
                        {isMovie ? 'Movie' : 'Series'} · {year}
                        {item.vote_average ? ` · ★ ${item.vote_average.toFixed(1)}` : ''}
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55557a" strokeWidth="2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Empty */}
        {!loading && query.trim() && results.length === 0 && (
          <div className="py-12 text-center text-sm text-[--flx-text-3]">
            No results for <span className="text-[--flx-text-2]">"{query}"</span>
          </div>
        )}

        {/* Hint when empty */}
        {!query && (
          <div className="py-10 text-center text-xs text-[--flx-text-3]">
            Type to search across all movies and series
          </div>
        )}
      </div>
    </div>
  );
}
