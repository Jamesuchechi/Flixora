'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  id: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function WatchlistButton({ id, className, size = 'md' }: WatchlistButtonProps) {
  const isInWatchlist       = useStore((s) => s.isInWatchlist);
  const addToWatchlist      = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  const saved = isInWatchlist(id);

  return (
    <button
      onClick={() => saved ? removeFromWatchlist(id) : addToWatchlist(id)}
      className={cn(
        'flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer',
        size === 'md'
          ? 'bg-white/7 hover:bg-white/12 border border-white/12 text-[--flx-text-1] text-sm px-5 py-3 rounded-lg'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-[--flx-text-2] text-xs px-3 py-1.5 rounded-md',
        saved && 'border-[--flx-pink]/40 text-[--flx-pink]',
        className
      )}
    >
      <svg
        width={size === 'md' ? 15 : 12}
        height={size === 'md' ? 15 : 12}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {saved ? 'Saved' : 'My List'}
    </button>
  );
}
