'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { getAIInsights } from '@/lib/supabase/actions/ai-metadata';

interface AIInsights {
  expectations: string;
  pitch: string;
  vibes: string[];
}

interface TrailerInsightsProps {
  tmdbId: number;
  title: string;
  overview: string;
  genres: string[];
}

export function TrailerInsights({ tmdbId, title, overview, genres }: TrailerInsightsProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAIInsights(tmdbId, title, overview, genres);
      setInsights(data);
      setLoading(false);
    }
    load();
  }, [tmdbId, title, overview, genres]);

  if (loading) return (
    <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-[24px] animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded mb-4" />
      <div className="h-3 w-full bg-white/5 rounded mb-2" />
      <div className="h-3 w-2/3 bg-white/5 rounded" />
    </div>
  );

  if (!insights) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-8 bg-linear-to-br from-white/5 to-transparent border border-white/10 rounded-[32px] relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <BrainCircuit size={80} className="text-[--flx-cyan]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[--flx-cyan]/20 flex items-center justify-center">
            <Sparkles size={16} className="text-[--flx-cyan]" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[3px] text-white/60">Flixora Intelligence</h3>
        </div>

        <p className="text-[13px] text-white/90 leading-relaxed font-medium mb-4">
          {insights.expectations}
        </p>

        {insights.pitch && (
          <div className="mb-6 p-4 bg-[--flx-purple]/10 border-l-2 border-[--flx-purple] rounded-r-xl">
            <p className="text-[11px] font-bold text-[--flx-purple] uppercase tracking-widest mb-1">Cinephile Pitch</p>
            <p className="text-[12px] text-white/70 italic leading-relaxed">&quot;{insights.pitch}&quot;</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {insights.vibes?.map((vibe: string) => (
            <span 
              key={vibe} 
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-[--flx-cyan] hover:border-[--flx-cyan]/30 transition-all cursor-default"
            >
              #{vibe}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
