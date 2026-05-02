'use client';

import { useState } from 'react';
import { TrailerModal } from './TrailerModal';

interface TrailerButtonProps {
  videoKey: string | null;
  title: string;
}

export function TrailerButton({ videoKey, title }: TrailerButtonProps) {
  const [open, setOpen] = useState(false);

  if (!videoKey) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-1] text-sm font-medium px-5 py-3 rounded-lg transition-all cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Watch Trailer
      </button>

      {open && (
        <TrailerModal videoKey={videoKey} title={title} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
