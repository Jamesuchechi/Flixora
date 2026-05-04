'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global Connection Monitor with auto-retry countdown.
 */
export function ConnectionToast() {
  const [isOffline, setIsOffline] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setCountdown(3);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOffline && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isOffline && countdown === 0) {
      // Attempt retry
      window.location.reload();
    }
    return () => clearTimeout(timer);
  }, [isOffline, countdown]);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10000 px-8 py-4 rounded-[32px] bg-red-500 text-white shadow-[0_20px_50px_rgba(239,68,68,0.3)] flex items-center gap-6 border border-white/20 backdrop-blur-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
            <WifiOff size={20} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-black uppercase tracking-widest leading-none">Connection Lost</p>
            <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">
              Retrying in <span className="text-white">{countdown}s</span>
            </p>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <button 
            onClick={() => window.location.reload()}
            className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90"
          >
            <RefreshCw size={18} className="animate-spin-slow" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
