'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { tmdb } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getYear, cn } from '@/lib/utils';
import type { TMDBSearchResult } from '@/types/tmdb';

export function SearchOverlay() {
  const isOpen = useStore((s) => s.searchOpen);
  const setIsOpen = useStore((s) => s.setSearchOpen);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flx_recent_searches');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    setIsOpen(false);
  }, [setIsOpen]);

  const addToRecent = useCallback((term: string) => {
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(t => t !== term)].slice(0, 5);
      localStorage.setItem('flx_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
      }

      if (e.key === 'Enter') {
        if (selectedIndex === -1) {
          if (query.trim()) {
            addToRecent(query.trim());
            window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
            handleClose();
          }
        } else {
          const item = results[selectedIndex];
          if (item) {
            addToRecent(query.trim());
            window.location.href = `/${item.media_type === 'movie' ? 'movies' : 'series'}/${item.id}`;
            handleClose();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, addToRecent, handleClose, setIsOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tmdb.search.multi(query);
        const items = (data.results as TMDBSearchResult[]).filter((r) => r.media_type !== 'person').slice(0, 10);
        setResults(items);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={handleClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-3xl h-full md:h-auto bg-[#0d0915]/95 md:border md:border-white/10 md:rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 fade-in duration-500">
        
        {/* Aurora Background Effect */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[--flx-purple]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[--flx-cyan]/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Search Input */}
        <div className="relative flex items-center px-8 py-7 border-b border-white/5 gap-4 z-10">
          <Search size={24} className="text-[--flx-cyan]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim()) {
                setResults([]);
                setSelectedIndex(-1);
              }
            }}
            placeholder="Search movies, series..."
            className="flex-1 bg-transparent border-none outline-none text-2xl font-bebas tracking-widest text-white placeholder-white/10"
          />
          <button 
            onClick={handleClose}
            className="text-white/20 hover:text-white transition-colors"
          >
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 shadow-xl">Esc</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="relative max-h-[60vh] overflow-y-auto custom-scrollbar z-10">
          {!query && (
            <div className="p-10 space-y-10">
               {recentSearches.length > 0 && (
                 <section className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[3px] font-black text-white/20">Recent Searches</h3>
                    <div className="flex flex-wrap gap-2">
                       {recentSearches.map(term => (
                         <button 
                           key={term}
                           onClick={() => setQuery(term)}
                           className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-[--flx-purple]/30 hover:bg-[--flx-purple]/5 transition-all text-xs font-bold text-white/40 hover:text-white"
                         >
                           {term}
                         </button>
                       ))}
                    </div>
                 </section>
               )}

               <section className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[3px] font-black text-white/20">Popular Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     {['Action', 'Comedy', 'Horror', 'Drama'].map(cat => (
                       <button 
                         key={cat}
                         onClick={() => setQuery(cat)}
                         className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[--flx-cyan]/30 hover:bg-[--flx-cyan]/5 transition-all text-sm font-bold text-white/60 hover:text-white text-center"
                       >
                         {cat}
                       </button>
                     ))}
                  </div>
               </section>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="p-4 space-y-2">
              {results.map((item, idx) => (
                <SearchItem 
                  key={item.id} 
                  item={item} 
                  query={query} 
                  highlightMatch={highlightMatch} 
                  isSelected={selectedIndex === idx}
                  onSelect={() => {
                    addToRecent(query.trim());
                    handleClose();
                  }} 
                />
              ))}
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-2xl">🔍</div>
              <p className="text-[10px] font-black uppercase tracking-[4px] text-white/20">No matches found for &quot;{query}&quot;</p>
            </div>
          )}
          
          {loading && (
            <div className="p-20 flex justify-center">
               <div className="w-10 h-10 border-2 border-[--flx-cyan] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative px-8 py-5 bg-black/20 border-t border-white/5 flex justify-between items-center text-[9px] uppercase font-black tracking-[2px] text-white/10 z-10">
           <div className="flex gap-6">
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40">↑↓</span>
                Navigate
              </span>
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40">Enter</span>
                Select
              </span>
           </div>
           <span className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
             Discovery Engine Active
           </span>
        </div>
      </div>
    </div>
  );
}

function SearchItem({ item, query, highlightMatch, isSelected, onSelect }: { 
  item: TMDBSearchResult; 
  query: string; 
  highlightMatch: (t: string, q: string) => React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isMovie = item.media_type === 'movie';
  const title = isMovie ? item.title : item.name;
  const date = isMovie ? item.release_date : item.first_air_date;
  const itemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isSelected) {
      itemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <Link 
      ref={itemRef}
      href={`/${isMovie ? 'movies' : 'series'}/${item.id}`}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-4 p-3 rounded-2xl transition-all group border",
        isSelected 
          ? "bg-white/10 border-white/10 shadow-lg scale-[1.01]" 
          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
      )}
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
        <h4 className={cn(
          "text-sm font-semibold truncate transition-colors",
          isSelected ? "text-[--flx-cyan]" : "text-[--flx-text-1] group-hover:text-white"
        )}>
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
      {isSelected && (
        <div className="px-2 py-1 rounded bg-[--flx-cyan]/10 border border-[--flx-cyan]/20 text-[--flx-cyan] text-[8px] font-black uppercase tracking-widest">
          Enter to view
        </div>
      )}
    </Link>
  );
}
