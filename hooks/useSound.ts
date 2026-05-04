'use client';

import { useCallback } from 'react';

/**
 * High-fidelity Audio Hook for cinematic micro-interactions.
 */
export function useSound() {
  const playPop = useCallback(() => {
    // Check if sounds are disabled in preferences
    const prefs = typeof window !== 'undefined' ? localStorage.getItem('flx_user_prefs') : null;
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (!parsed.soundEffects) return;
    } else {
      // Default to OFF as requested by user
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // 440hz
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08); // 80ms fade

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08);
  }, []);

  return { playPop };
}
