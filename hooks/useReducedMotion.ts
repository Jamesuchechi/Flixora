'use client';

import { useSyncExternalStore } from 'react';

/**
 * SSR-safe hook to detect user's prefers-reduced-motion setting.
 * Uses useSyncExternalStore to synchronize with the browser API without cascading renders.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false // Default value for Server Side Rendering
  );
}
