'use client';

import { useState } from 'react';
import { Sparkles, Search, X, Loader2 } from 'lucide-react';
import { getVibeResults } from '@/lib/supabase/actions/search';
import { MovieCard } from '@/components/movie/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';

interface VibeResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export function MoodFilters() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VibeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await getVibeResults(query);
      setResults(data.results || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/2 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
        <div className="space-y-2 max-w-md">
          <div className="flex items-center gap-2 text-[--flx-cyan]">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">AI Vibe Discovery</span>
          </div>
          <h3 className="text-xl font-bebas tracking-wide text-white">How do you want to feel?</h3>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium">
            Describe a mood, a setting, or a pace. Our AI will translate your vibe into the perfect cinematic match.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'a dark mind-bending thriller with visual poetry'"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-purple]/50 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[--flx-purple] text-white flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 shadow-lg shadow-[--flx-purple]/20"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {hasSearched && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-white/60">
                  AI Matches for: <span className="text-[--flx-cyan]">&quot;{query}&quot;</span>
                </h4>
                <span className="text-[10px] font-bold text-white/20">{results.length} titles found</span>
              </div>
              <button 
                onClick={clearSearch}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                Clear Results <X size={14} />
              </button>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {results.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    id={movie.id}
                    title={movie.title || movie.name || 'Untitled'}
                    posterPath={movie.poster_path}
                    rating={movie.vote_average || 0}
                    releaseDate={movie.release_date || movie.first_air_date}
                    mediaType={movie.title ? 'movie' : 'tv'}
                  />
                ))}
              </div>
            ) : !isLoading && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                   <Search size={32} className="text-white/10" />
                </div>
                <p className="text-sm text-white/40 font-medium">No titles matched that specific vibe. Try something else?</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
