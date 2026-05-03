'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartGuardProps {
  isPlaying: boolean;
  onRefresh: () => void;
  className?: string;
}

/**
 * SmartGuard Stealth Ad-Shield
 * Protects users from malicious pop-ups while maintaining provider compliance.
 */
export function SmartGuard({ isPlaying, onRefresh, className }: SmartGuardProps) {
  const [showStatus, setShowStatus] = useState(false);

  // Briefly show shield status when playback starts
  useEffect(() => {
    if (isPlaying) {
      const frame = requestAnimationFrame(() => setShowStatus(true));
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  }, [isPlaying]);

  return (
    <div className={cn("absolute inset-0 pointer-events-none z-10", className)}>
      {/* 
        THE SHIELD LAYER 
        When playing, this transparent layer catches "accidental" clicks that 
        3rd party providers use to trigger pop-ups.
      */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-auto bg-transparent cursor-default" />
      )}

      {/* Status Indicator */}
      <div className={cn(
        "absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full transition-all duration-500",
        showStatus ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}>
        <Shield size={14} className="text-[--flx-cyan]" />
        <span className="text-[10px] font-black uppercase tracking-[2px] text-white">SmartGuard Active</span>
      </div>

      {/* Quick Recovery Button (Visible on hover or when paused) */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <button 
          onClick={onRefresh}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-[--flx-cyan] transition-all group"
          title="Refresh Player (Recover from Redirect)"
        >
          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Compliance Warning (Only if playback is clearly broken) */}
      {!isPlaying && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
           <ShieldAlert size={10} />
           <span>Stealth Compliance Mode • Ads permitted on pause</span>
        </div>
      )}
    </div>
  );
}
