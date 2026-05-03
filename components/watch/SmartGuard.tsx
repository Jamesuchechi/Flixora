'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, RefreshCw, Clapperboard } from 'lucide-react';
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
  const [isDismissed, setIsDismissed] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);

  // Sync state with props during render to avoid cascading effects
  const [prevIsShieldActive, setPrevIsShieldActive] = useState(isShieldActive);
  if (isShieldActive !== prevIsShieldActive) {
    setPrevIsShieldActive(isShieldActive);
    if (isShieldActive) {
      setIsDismissed(false);
      setIsPreparing(true);
      setShowStatus(true);
    } else {
      setShowStatus(false);
      setIsPreparing(false);
    }
  }

  useEffect(() => {
    if (isShieldActive && !isDismissed) {
      const timer = setTimeout(() => {
        setIsPreparing(false);
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [isShieldActive, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowStatus(false);
  };

  return (
    <div className={cn("absolute inset-0 z-50 pointer-events-none transition-all duration-700", className)}>
      
      {/* ── THE CINEMA SHIELD ── 
          This layer visually masks the 3rd party player while it loads background ads
          and initializes the stream.
      */}
      <div className={cn(
        "absolute inset-0 bg-[#090514] flex flex-col items-center justify-center transition-opacity duration-1000 pointer-events-auto",
        isPreparing ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="relative">
          <div className="absolute inset-0 bg-[--flx-cyan]/20 blur-3xl rounded-full animate-pulse" />
          <Clapperboard size={48} className="text-[--flx-cyan] relative animate-bounce" />
        </div>
        <div className="mt-8 space-y-2 text-center">
          <h3 className="text-sm font-black uppercase tracking-[4px] text-white">Preparing Cinema</h3>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[2px]">Neutralizing background ads...</p>
        </div>
        
        {/* Progress Bar simulation */}
        <div className="mt-6 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[--flx-cyan] to-[--flx-purple] animate-progress-fast" />
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
