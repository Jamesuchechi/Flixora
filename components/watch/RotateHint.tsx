'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function RotateHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Show hint if in portrait mode and width is small
      const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      setShow(isPortrait && isMobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-100 pointer-events-none"
        >
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
            <Smartphone className="text-[--flx-cyan] animate-bounce" size={20} />
            <span className="text-[10px] font-black uppercase tracking-[2px] text-white">Rotate for better experience</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
