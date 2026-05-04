'use client';

import { Users, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ReactionToggle() {
  const visibility = useStore(s => s.preferences.reactionVisibility);
  const setPreference = useStore(s => s.setPreference);
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'all', label: 'All Reactions', icon: Eye, color: 'text-[--flx-cyan]' },
    { value: 'friends', label: 'Friends Only', icon: Users, color: 'text-[--flx-purple]' },
    { value: 'hide', label: 'Hide All', icon: EyeOff, color: 'text-white/40' },
  ] as const;

  const current = options.find(o => o.value === visibility) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
      >
        <current.icon size={16} className={current.color} />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
           {current.label}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full mb-2 right-0 w-48 bg-[--flx-surface-1] border border-white/10 rounded-2xl p-2 shadow-2xl z-20"
            >
              <div className="space-y-1">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPreference('reactionVisibility', opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      visibility === opt.value 
                        ? "bg-white/10 text-white" 
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <opt.icon size={14} className={visibility === opt.value ? opt.color : ''} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
