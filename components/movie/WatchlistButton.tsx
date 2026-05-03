'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleWatchlist } from '@/lib/supabase/actions/watchlist';

interface WatchlistButtonProps {
  id: number;
  mediaType: 'movie' | 'tv';
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Premium Watchlist toggle button with tactile feedback and state persistence.
 */
export function WatchlistButton({ id, mediaType, className, size = 'md' }: WatchlistButtonProps) {
  const isInWatchlist       = useStore((s) => s.isInWatchlist);
  const addToWatchlist      = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  
  const saved = isInWatchlist(id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic Update
    if (saved) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }

    // Server Persistence
    const result = await toggleWatchlist(id, mediaType);
    if (result.error) {
       console.error('Watchlist Error:', result.error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer select-none active:scale-95 group',
        size === 'md'
          ? 'bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-1] text-sm px-6 py-3 rounded-xl'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-[--flx-text-2] text-[11px] px-3.5 py-1.5 rounded-lg',
        saved && 'bg-[--flx-pink]/10 border-[--flx-pink]/40 text-[--flx-pink] shadow-[0_0_20px_rgba(244,114,182,0.1)]',
        className
      )}
    >
      <div className="relative">
        <motion.svg
          width={size === 'md' ? 16 : 13}
          height={size === 'md' ? 16 : 13}
          viewBox="0 0 24 24"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2.5"
          initial={false}
          animate={{
            scale: saved ? [1, 1.4, 1.1] : 1,
            rotate: saved ? [0, 15, -15, 0] : 0,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </motion.svg>
        
        {/* Particle burst effect on save */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[--flx-pink]/20 rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
      
      <span className="tracking-wide">
        {saved ? 'Saved' : 'My List'}
      </span>
    </button>
  );
}
