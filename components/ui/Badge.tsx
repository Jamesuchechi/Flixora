import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'cyan' | 'pink' | 'gold' | 'muted' | 'live' | 'new' | 'hot' | 'score';
}

const variants = {
  purple: 'bg-[--flx-purple]/12 border-[--flx-purple]/25 text-violet-300 shadow-[inset_0_0_10px_rgba(139,92,246,0.15)]',
  cyan:   'bg-[--flx-cyan]/10 border-[--flx-cyan]/20 text-cyan-300 shadow-[inset_0_0_10px_rgba(34,211,238,0.15)]',
  pink:   'bg-[--flx-pink]/12 border-[--flx-pink]/25 text-pink-300',
  gold:   'bg-[--flx-gold]/10 border-[--flx-gold]/20 text-yellow-300',
  muted:  'bg-white/5 border-white/10 text-[--flx-text-3]',
  live:   'bg-red-500/15 border-red-500/30 text-red-400',
  new:    'bg-[--flx-cyan]/12 border-[--flx-cyan]/30 text-cyan-200 shadow-[inset_0_0_10px_rgba(34,211,238,0.15)]',
  hot:    'bg-orange-500/15 border-orange-500/30 text-orange-400',
  score:  'bg-green-500/15 border-green-500/30 text-green-400 shadow-[inset_0_0_10px_rgba(34,197,94,0.15)]',
};

/**
 * Production-ready Badge component with glassmorphism and semantic variants.
 */
export function Badge({ variant = 'purple', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border backdrop-blur-md select-none',
        'text-[10px] font-bebas tracking-[1.5px] uppercase transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === 'live' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
      )}
      {children}
    </span>
  );
}

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeProps['variant'];
}

/**
 * Pill component for secondary labels and filtering indicators.
 */
export function Pill({ variant = 'muted', className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm select-none',
        'text-[11px] font-medium transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
