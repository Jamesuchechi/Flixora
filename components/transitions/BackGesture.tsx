'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

/**
 * Global Back Gesture Detection for mobile users.
 * Swipe right from edge -> Navigate Back.
 */
export function BackGesture() {
  const router = useRouter();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [pullProgress, setPullProgress] = useState(0);

  // Minimum swipe distance
  const minSwipeDistance = 150;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only start if touch is near the left edge (first 30px)
      if (e.targetTouches[0].clientX < 40) {
        setTouchStart(e.targetTouches[0].clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStart === null) return;
      const currentX = e.targetTouches[0].clientX;
      const progress = Math.min(1, (currentX - touchStart) / minSwipeDistance);
      setPullProgress(progress);
    };

    const handleTouchEnd = () => {
      if (touchStart !== null && touchEnd !== null) {
        const distance = touchEnd - touchStart;
        if (distance > minSwipeDistance) {
          router.back();
        }
      }
      setTouchStart(null);
      setTouchEnd(null);
      setPullProgress(0);
    };

    const updateTouchEnd = (e: TouchEvent) => {
      if (touchStart !== null) {
        setTouchEnd(e.changedTouches[0].clientX);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', updateTouchEnd);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', updateTouchEnd);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, router]);

  return (
    <AnimatePresence>
      {touchStart !== null && pullProgress > 0.1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed left-0 top-0 bottom-0 w-12 z-10000 flex items-center justify-center pointer-events-none"
        >
          <div 
            className="w-1.5 bg-[--flx-cyan] rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            style={{ height: `${pullProgress * 100}%`, opacity: pullProgress }}
          />
          <div 
            className="absolute left-4 bg-[--flx-surface-1]/80 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl"
            style={{ opacity: pullProgress }}
          >
            <ChevronLeft className="text-[--flx-cyan]" size={20} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
