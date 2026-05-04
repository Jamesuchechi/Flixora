'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MOODS = [
  'All', 
  'Action', 
  'Drama', 
  'Sci-Fi', 
  'Horror', 
  'Comedy', 
  'Thriller', 
  'Romance', 
  'Documentary', 
  'Animation'
];

export function MoodStrip() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGenre = searchParams.get('genre') || 'All';

  const handleMoodClick = (mood: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mood === 'All') {
      params.delete('genre');
    } else {
      params.set('genre', mood);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="px-10 py-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2"
      >
        <span className="text-[10px] font-black uppercase tracking-[2px] text-white/30 whitespace-nowrap mr-2">
          Mood Filter:
        </span>
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => handleMoodClick(mood)}
            className={cn(
              "px-5 py-2 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 border whitespace-nowrap",
              currentGenre === mood
                ? "bg-[--flx-cyan] border-[--flx-cyan] text-black shadow-[0_0_15px_rgba(0,255,255,0.3)] scale-105"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            )}
          >
            {mood}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
