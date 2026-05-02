import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
}

/**
 * Production-ready Skeleton component with shimmer animation and accessibility.
 */
export function Skeleton({ rounded = 'md', className, ...props }: SkeletonProps) {
  const roundMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        'relative overflow-hidden bg-white/5',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-linear-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer',
        roundMap[rounded],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/* --- Specific Skeletons for the Flixora UI --- */

export function MovieCardSkeleton() {
  return (
    <div className="shrink-0 w-[140px] space-y-3">
      <Skeleton className="w-[140px] h-[210px]" rounded="lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3 opacity-60" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[560px] w-full bg-[--flx-surface-1] overflow-hidden">
      <Skeleton className="absolute inset-0" rounded="none" />
      <div className="absolute bottom-20 left-12 space-y-6 max-w-xl">
        <Skeleton className="h-6 w-32" rounded="full" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-3/4" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 w-40" rounded="lg" />
          <Skeleton className="h-12 w-32" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedCardSkeleton() {
  return (
    <div className="shrink-0 w-[290px] space-y-3">
      <Skeleton className="w-[290px] h-[165px]" rounded="lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3 opacity-60" />
      </div>
    </div>
  );
}

export function RowSkeleton({ title }: { title?: string }) {
  return (
    <div className="px-10 py-7 space-y-5">
      {title && <Skeleton className="h-6 w-48" />}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
