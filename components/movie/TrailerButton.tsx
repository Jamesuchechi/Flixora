'use client';

import { useState } from 'react';
import { TrailerModal } from './TrailerModal';
import { cn } from '@/lib/utils';

interface TrailerButtonProps {
  videoKey: string | null;
  title: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

/**
 * Interactive button that handles the opening and state of the TrailerModal.
 */
export function TrailerButton({ videoKey, title, className, variant = 'secondary' }: TrailerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if no video key is provided
  if (!videoKey) return null;

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
          videoKey={videoKey} 
          title={title} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
