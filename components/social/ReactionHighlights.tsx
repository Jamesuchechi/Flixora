'use client';

import { useEffect, useState } from 'react';
import { Zap, Timer } from 'lucide-react';
import { getTopReactions } from '@/lib/supabase/actions/social';

interface ReactionHighlightsProps {
  tmdbId: number;
}

export function ReactionHighlights({ tmdbId }: ReactionHighlightsProps) {
  const [highlights, setHighlights] = useState<{ minute: number, count: number }[]>([]);

  useEffect(() => {
    getTopReactions(tmdbId).then(setHighlights);
  }, [tmdbId]);

  if (highlights.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[--flx-gold]/20 rounded-xl text-[--flx-gold]">
          <Zap size={18} className="fill-current" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Crowd Highlights</h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[2px]">Most reacted moments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {highlights.map((h, i) => (
          <div 
            key={i}
            className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-[--flx-gold]/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[--flx-gold] group-hover:scale-110 transition-transform">
                <Timer size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Around {h.minute}m</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Intense activity</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-[--flx-gold]/10 rounded-full border border-[--flx-gold]/20">
               <span className="text-[10px] font-black text-[--flx-gold]">{h.count} reactions</span>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-[10px] text-white/20 italic text-center">
        Aggregated from global viewer reactions.
      </p>
    </div>
  );
}
