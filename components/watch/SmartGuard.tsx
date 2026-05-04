'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartGuardProps {
  isShieldActive: boolean;
  onRefresh: () => void;
  className?: string;
}

/**
 * SmartGuard Cinema Ad-Shield
 * Neutralizes 3rd party ads by sandboxing them and masking the initial load
 * with a premium "Preparing Cinema" UI.
 */
export function SmartGuard({ isShieldActive, onRefresh, className }: SmartGuardProps) {
  const [countdown, setCountdown] = useState(3);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);

  // Sync state with props during render (Most efficient pattern to avoid cascading renders)
  const [prevIsShieldActive, setPrevIsShieldActive] = useState(isShieldActive);
  if (isShieldActive !== prevIsShieldActive) {
    setPrevIsShieldActive(isShieldActive);
    if (isShieldActive) {
      setIsDismissed(false);
      setIsPreparing(true);
      setShowStatus(true);
      setCountdown(3);
    } else {
      setShowStatus(false);
      setIsPreparing(false);
    }
  }

  useEffect(() => {
    if (isPreparing && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setIsPreparing(false);
          setCountdown(0);
        } else {
          setCountdown(prev => prev - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPreparing, countdown]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowStatus(false);
  };

  return (
    <div className={cn("absolute inset-0 z-50 pointer-events-none transition-all duration-700", className)}>
      
      {/* ── THE CINEMA SHIELD ── */}
      <div className={cn(
        "absolute inset-0 bg-[#090514] flex flex-col items-center justify-center transition-opacity duration-1000 pointer-events-auto",
        isPreparing ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="relative flex items-center justify-center">
          {/* Animated Circle Timer */}
          <svg className="w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-white/5"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray="377"
              strokeDashoffset={377 - (377 * countdown) / 3}
              className="text-[--flx-cyan] transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute font-bebas text-6xl text-white animate-pulse">
            {countdown > 0 ? countdown : "GO"}
          </span>
        </div>

        <div className="mt-12 space-y-2 text-center">
          <h3 className="text-sm font-black uppercase tracking-[6px] text-white animate-fade-in">Preparing Cinema</h3>
          <p className="text-[9px] font-bold text-[--flx-cyan] uppercase tracking-[3px] opacity-60">Initializing Stealth Mode</p>
        </div>
      </div>

      {/* ── THE CLICK SHIELD ── 
          Prevents accidental clicks during ad-trigger windows.
          Stays active until the user intentionally dismisses it.
      */}
      {!isDismissed && isShieldActive && (
        <div 
          onClick={handleDismiss}
          className={cn(
            "absolute inset-0 pointer-events-auto bg-black/5 cursor-pointer flex items-center justify-center transition-opacity duration-500",
            !isPreparing ? "opacity-100" : "opacity-0"
          )}
        >
          {!isPreparing && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-[--flx-cyan] flex items-center justify-center shadow-[0_0_30px_rgba(0,255,242,0.4)] animate-pulse">
                <Shield size={24} className="text-black" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[3px] text-[--flx-cyan]">Cinema Guard Active</p>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-[2px] mt-1">Click anywhere to start playing</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SmartGuard Active Indicator */}
      <div className={cn(
        "absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full transition-all duration-500",
        showStatus ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}>
        <Shield size={14} className="text-[--flx-cyan]" />
        <span className="text-[10px] font-black uppercase tracking-[2px] text-white">SmartGuard Stealth Active</span>
      </div>

      {/* Quick Recovery Button */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <button 
          onClick={onRefresh}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-[--flx-cyan] transition-all group"
          title="Refresh Player (Recover from Redirect)"
        >
          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Compliance Warning */}
      {!isShieldActive && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
           <ShieldAlert size={10} />
           <span>Stealth Compliance Mode • Ads Neutralized</span>
         </div>
       )}
    </div>
  );
}
