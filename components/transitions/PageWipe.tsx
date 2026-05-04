'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Cinematic Page Wipe Transition for navigating to the watch page.
 */
export function PageWipe() {
  const pathname = usePathname();
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    // Only trigger cinematic wipe when navigating TO a movie or series watch page
    // (Assuming watch page has /watch in URL or just identifying by id)
    // Actually, the user said "navigating TO the watch page specifically"
    // I'll check if pathname includes '/movies/[id]' or '/series/[id]'
    const isWatchPage = /^\/(movies|series)\/\d+/.test(pathname);
    
    if (isWatchPage) {
      const rafId = requestAnimationFrame(() => {
        setIsWiping(true);
      });
      
      const timer = setTimeout(() => setIsWiping(false), 800);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timer);
      };
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {isWiping && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-9999 bg-black flex items-center justify-center pointer-events-none"
        >
          <div className="font-bebas text-4xl text-[--flx-cyan] tracking-[10px] animate-pulse">
            FLIXORA
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
