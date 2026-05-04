'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ExpandableOverviewProps {
  text: string;
  /** Number of lines to clamp before "Show more" appears. Default: 3 */
  clampLines?: number;
}

export function ExpandableOverview({ text, clampLines = 3 }: ExpandableOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <div className="space-y-2">
      <p
        className={cn(
          'text-sm leading-relaxed text-white/60 font-medium transition-all',
          !expanded && `line-clamp-${clampLines}`
        )}
      >
        {text}
      </p>
      {text.length > 200 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] font-black uppercase tracking-[3px] text-[--flx-cyan] hover:text-white transition-colors"
        >
          {expanded ? 'Show less ↑' : 'Show more ↓'}
        </button>
      )}
    </div>
  );
}
