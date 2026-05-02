'use client';

import { useEffect } from 'react';

interface TrailerModalProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

/**
 * Premium Trailer Modal with backdrop blur and escape-key handling.
 */
export function TrailerModal({ videoKey, title, onClose }: TrailerModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-200 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <p className="text-[10px] uppercase tracking-[2px] font-bold text-[--flx-cyan] mb-0.5">Now Playing</p>
            <h3 className="text-sm text-[--flx-text-1] font-medium truncate max-w-md">{title} — Official Trailer</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[--flx-text-2] hover:text-white transition-all cursor-pointer group"
            aria-label="Close trailer"
          >
            <svg 
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              strokeWidth="2.5" className="group-hover:rotate-90 transition-transform duration-300"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Embed Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5),0_0_50px_rgba(139,92,246,0.1)] bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&color=white`}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        
        {/* Footer Hint */}
        <p className="mt-4 text-center text-[10px] text-[--flx-text-3] uppercase tracking-[1px]">
          Press <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mx-1">ESC</kbd> to close
        </p>
      </div>
    </div>
  );
}
