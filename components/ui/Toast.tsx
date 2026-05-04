'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import type { ToastItem } from '@/store/useStore';

// ── Single Toast ───────────────────────────────────────────────────────────────

function Toast({ toast }: { toast: ToastItem }) {
  const dismissToast = useStore((s) => s.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismissToast]);

  const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? XCircle : Info;

  const styles = {
    success: 'bg-[#07050f] border-green-500/30 text-green-400',
    error:   'bg-[#07050f] border-red-500/30   text-red-400',
    info:    'bg-[#07050f] border-[--flx-cyan]/30 text-[--flx-cyan]',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={{   opacity: 0, x: 60,  scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[240px] max-w-xs',
        styles[toast.type]
      )}
    >
      <Icon size={16} className="shrink-0" />
      <p className="text-[11px] font-black uppercase tracking-wider flex-1">{toast.message}</p>
      <button
        onClick={() => dismissToast(toast.id)}
        className="text-white/20 hover:text-white/60 transition-colors shrink-0"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ── Toast Container — mount once in root layout ────────────────────────────────

export function ToastProvider() {
  const toasts = useStore((s) => s.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col-reverse gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
