import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'cyan' | 'pink' | 'gold' | 'muted' | 'live' | 'new' | 'hot';
}

const variants = {
  purple: 'bg-[--flx-purple]/15 border-[--flx-purple]/30 text-violet-300',
  cyan:   'bg-[--flx-cyan]/12 border-[--flx-cyan]/25 text-cyan-300',
  pink:   'bg-[--flx-pink]/15 border-[--flx-pink]/30 text-pink-300',
  gold:   'bg-[--flx-gold]/12 border-[--flx-gold]/25 text-yellow-300',
  muted:  'bg-white/5 border-white/10 text-[--flx-text-3]',
  live:   'bg-[--flx-pink]/15 border-[--flx-pink]/30 text-pink-300',
  new:    'bg-[--flx-cyan]/12 border-[--flx-cyan]/25 text-cyan-300',
  hot:    'bg-[--flx-gold]/12 border-[--flx-gold]/25 text-yellow-300',
};

export function Badge({ variant = 'purple', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded',
        'text-[10px] font-semibold tracking-widest uppercase border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeProps['variant'];
}

export function Pill({ variant = 'muted', className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full',
        'text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
