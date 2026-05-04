'use client';

import React, { useEffect, useState } from 'react';
import { getReactions } from '@/lib/supabase/actions/social';
import { useStore } from '@/store/useStore';

interface ReactionHeatmapProps {
  tmdbId: number;
  duration: number;
}

export const ReactionHeatmap: React.FC<ReactionHeatmapProps> = ({ tmdbId, duration }) => {
  const [density, setDensity] = useState<number[]>(new Array(60).fill(0));
  const visibility = useStore(s => s.preferences.reactionVisibility);

  useEffect(() => {
    const fetch = async () => {
       if (visibility === 'hide') {
         setDensity(new Array(60).fill(0));
         return;
       }
       
       const reactions = await getReactions(tmdbId, visibility === 'all' ? 'all' : 'friends');
       if (!reactions || !duration || duration === 0) return;
       
       const bins = new Array(60).fill(0);
       reactions.forEach(r => {
          const binIndex = Math.floor((r.timestamp_seconds / duration) * 60);
          if (binIndex >= 0 && binIndex < 60) bins[binIndex]++;
       });
       
       const max = Math.max(...bins, 1);
       setDensity(bins.map(b => b / max));
    };
    fetch();
  }, [tmdbId, duration, visibility]);

  if (!duration || duration === 0) return null;

  return (
    <div className="absolute inset-x-0 -top-4 h-4 flex items-end gap-px pointer-events-none opacity-40">
       {density.map((d, i) => (
         <div 
           key={i} 
           className="flex-1 bg-white/20 rounded-t-sm transition-all duration-1000" 
           style={{ height: d > 0 ? `${Math.max(d * 100, 10)}%` : '2px' }} 
         />
       ))}
    </div>
  );
};
