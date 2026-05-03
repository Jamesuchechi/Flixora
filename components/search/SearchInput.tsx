'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isTyping, setIsTyping] = useState(false);

  const [prevSearchParam, setPrevSearchParam] = useState(searchParams.get('q'));

  // Sync state with URL params during render (optimized pattern)
  if (searchParams.get('q') !== prevSearchParam) {
    setQuery(searchParams.get('q') || '');
    setPrevSearchParam(searchParams.get('q'));
  }

  useEffect(() => {
    if (!isTyping) return;

    const timer = setTimeout(() => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      } else if (query === '') {
        router.push('/search');
      }
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, router, isTyping]);

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-16 group">
      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[--flx-text-3] group-focus-within:text-[--flx-cyan] transition-colors">
        <Search size={20} />
      </div>
      
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsTyping(true);
        }}
        placeholder="Movies, series, actors..."
        className="w-full bg-white/5 border border-white/10 rounded-[32px] pl-16 pr-14 py-5 text-lg text-[--flx-text-1] placeholder:text-[--flx-text-3] outline-none focus:bg-white/8 focus:border-[--flx-cyan]/50 focus:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all"
      />

      {query && (
        <button
          onClick={() => {
            setQuery('');
            router.push('/search');
          }}
          className="absolute inset-y-0 right-6 flex items-center text-[--flx-text-3] hover:text-[--flx-text-1] transition-colors cursor-pointer"
        >
          {isTyping ? <Loader2 size={18} className="animate-spin" /> : <X size={20} />}
        </button>
      )}

      {/* Aurora glow effect under the input */}
      <div className="absolute -inset-1 bg-linear-to-r from-[--flx-purple] to-[--flx-cyan] rounded-[33px] opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity -z-10" />
    </div>
  );
}
