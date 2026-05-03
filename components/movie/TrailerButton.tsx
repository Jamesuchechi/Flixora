'use client';

import { useState, useMemo } from 'react';
import { TrailerModal } from './TrailerModal';
import { cn } from '@/lib/utils';
import { TMDBVideo } from '@/types/tmdb';
import { getBestTrailer } from '@/lib/video';

interface TrailerButtonProps {
  videos: TMDBVideo[];
  title: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

/**
 * Interactive button that handles the opening and state of the TrailerModal.
 * Now selects the best trailer automatically.
 */
export function TrailerButton({ videos, title, className, variant = 'secondary' }: TrailerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const bestTrailer = useMemo(() => getBestTrailer(videos), [videos]);

  // Don't render if no trailer is found
  if (!bestTrailer) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer active:scale-95',
          variant === 'primary'
            ? 'bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white px-8 py-3 rounded-xl shadow-lg shadow-[--flx-purple]/20'
            : 'bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-1] px-6 py-3 rounded-xl',
          className
        )}
      >
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="currentColor" 
          className="transition-transform group-hover:scale-110"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span className="tracking-wide">Watch Trailer</span>
      </button>

      {isOpen && (
        <TrailerModal 
          videos={videos} 
          title={title} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
