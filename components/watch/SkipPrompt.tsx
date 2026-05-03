'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, X } from 'lucide-react';

interface SkipPromptProps {
  currentTime: number;
  segments: { type: string, startTime: number, endTime: number }[];
  onSkip: (to: number) => void;
  onAlwaysSkip?: () => void;
}


export function SkipPrompt({ currentTime, segments, onSkip, onAlwaysSkip }: SkipPromptProps) {
  const [dismissedSegmentStartTime, setDismissedSegmentStartTime] = useState<number | null>(null);

  // Derive activeSegment directly during render
  const activeSegment = segments.find(s => 
    currentTime >= s.startTime && 
    currentTime <= s.startTime + 15 &&
    s.startTime !== dismissedSegmentStartTime
  ) || null;

  if (!activeSegment) return null;

  const label = activeSegment.type === 'op' ? 'Skip Opening' : 'Skip Ending';

  return (
    <AnimatePresence>
      {activeSegment && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="absolute bottom-24 right-8 z-50"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSkip(activeSegment.endTime)}
              className="flex items-center gap-3 px-6 py-4 bg-white text-black rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all group"
            >
              <SkipForward size={18} className="fill-black group-hover:translate-x-1 transition-transform" />
              {label}
            </button>
            {onAlwaysSkip && (
              <button 
                onClick={onAlwaysSkip}
                className="px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-[--flx-cyan] transition-all"
              >
                Always Skip
              </button>
            )}
            <button 
              onClick={() => setDismissedSegmentStartTime(activeSegment.startTime)}
              className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 text-white/40 hover:text-white rounded-2xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
