'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { tmdb } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { getYear } from '@/lib/utils';
import type { TMDBSearchResult } from '@/types/tmdb';

export function SearchOverlay() {
  const isOpen = useStore((s) => s.searchOpen);
  const setIsOpen = useStore((s) => s.setSearchOpen);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, [setIsOpen]);

  // Handle keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Real-time search with debounce
  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tmdb.search.multi(query);
        // Filter out people, keep movies/tv
        const items = (data.results as TMDBSearchResult[]).filter((r) => r.media_type !== 'person').slice(0, 12);
        setResults(items);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const movies = results.filter(r => r.media_type === 'movie');
    const series = results.filter(r => r.media_type === 'tv');
    return { movies, series };
  }, [results]);

  // Helper to highlight matching text
  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() ? (
            <span key={i} className="text-[--flx-cyan] font-bold">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-24 px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[--flx-bg]/95 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-3xl bg-[--flx-surface-1] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Search Input */}
        <div className="flex items-center px-8 py-6 border-b border-white/5 gap-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[--flx-purple]">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim()) setResults([]);
            }}
            placeholder="Search for movies, series..."
            className="flex-1 bg-transparent border-none outline-none text-2xl font-medium text-[--flx-text-1] placeholder-white/20"
          />
          <button 
            onClick={handleClose}
            className="text-[--flx-text-3] hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10">Esc</span>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {!query && (
            <div className="p-12 text-center space-y-2">
               <p className="text-[--flx-text-3] text-sm uppercase tracking-[4px] font-bold">Try searching for</p>
               <div className="flex flex-wrap justify-center gap-3 pt-4">
                  {['Inception', 'Breaking Bad', 'The Dark Knight', 'Stranger Things'].map(term => (
                    <button 
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-[--flx-cyan]/50 hover:bg-[--flx-cyan]/5 transition-all text-sm text-[--flx-text-2]"
                    >
                      {term}
                    </button>
                  ))}
               </div>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="p-6 space-y-8">
              {/* Movies Section */}
              {groupedResults.movies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-[3px] font-bold text-white/20 ml-3">Movies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupedResults.movies.map((item) => (
                      <SearchItem 
                        key={item.id} 
                        item={item} 
                        query={query} 
                        highlightMatch={highlightMatch} 
                        onSelect={handleClose} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Series Section */}
              {groupedResults.series.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-[3px] font-bold text-white/20 ml-3">TV Series</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupedResults.series.map((item) => (
                      <SearchItem 
                        key={item.id} 
                        item={item} 
                        query={query} 
                        highlightMatch={highlightMatch} 
                        onSelect={handleClose} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="p-16 text-center text-[--flx-text-3]">
              No results found for &quot;{query}&quot;
            </div>
          )}
          
          {loading && (
            <div className="p-16 flex justify-center">
               <div className="w-8 h-8 border-2 border-[--flx-purple] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-black/20 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/20">
           <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[--flx-text-3]">↑↓</span> Navigate</span>
              <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[--flx-text-3]">Enter</span> Select</span>
           </div>
           <span>Powered by TMDB</span>
        </div>
      </div>
    </div>
  );
}

function SearchItem({ item, query, highlightMatch, onSelect }: { 
  item: TMDBSearchResult; 
  query: string; 
  highlightMatch: (t: string, q: string) => React.ReactNode;
  onSelect: () => void;
}) {
  const isMovie = item.media_type === 'movie';
  const title = isMovie ? item.title : item.name;
  const date = isMovie ? item.release_date : item.first_air_date;

  return (
    <Link 
      href={`/${isMovie ? 'movies' : 'series'}/${item.id}`}
      onClick={onSelect}
      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
    >
      <div className="relative w-12 aspect-2/3 rounded-lg overflow-hidden shrink-0 border border-white/5 shadow-lg">
        <Image 
          src={tmdb.image(item.poster_path, 'w185')} 
          alt={title || 'Media'} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="50px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[--flx-text-1] text-sm font-semibold truncate group-hover:text-white transition-colors">
          {highlightMatch(title || 'Unknown', query)}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-[--flx-text-3] font-bold uppercase tracking-tighter">
          <span>{getYear(date)}</span>
          {(item.vote_average ?? 0) > 0 && (
            <>
              <span>•</span>
              <span className="text-[--flx-gold]">★ {item.vote_average!.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
