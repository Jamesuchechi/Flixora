import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  delay?: number;
}

/**
 * Production-ready Skeleton component with shimmer animation and accessibility.
 */
export function Skeleton({ rounded = 'md', delay = 0, className, style, ...props }: SkeletonProps) {
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
        'relative overflow-hidden bg-radial from-[--flx-surface-2] to-[--flx-surface-1] opacity-0 animate-skeleton',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-linear-to-r after:from-transparent after:via-[rgba(255,255,255,0.05)] after:to-transparent after:animate-shimmer',
        roundMap[rounded],
        className
      )}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/* --- Specific Skeletons for the Flixora UI --- */

export function MovieCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="shrink-0 w-[140px] md:w-[180px] space-y-4">
      <Skeleton className="aspect-2/3 w-full" rounded="lg" delay={delay} />
      <div className="space-y-2">
        <Skeleton className="h-4 w-4/5" delay={delay + 50} />
        <Skeleton className="h-3 w-2/3 opacity-40" delay={delay + 100} />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[65vh] md:h-[85vh] w-full bg-[--flx-bg] overflow-hidden">
      {/* Background Shimmer */}
      <Skeleton className="absolute inset-0 opacity-20" rounded="none" />
      <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-[--flx-bg]/40 to-transparent" />
      
      <div className="absolute bottom-20 left-10 md:left-20 space-y-8 max-w-2xl">
        {/* Genre Tag */}
        <Skeleton className="h-6 w-24" rounded="full" delay={100} />
        
        {/* Title Shimmer */}
        <div className="space-y-3">
          <Skeleton className="h-14 md:h-20 w-full" delay={200} />
          <Skeleton className="h-14 md:h-20 w-3/4" delay={250} />
        </div>
        
        {/* Meta Stats */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" delay={300} />
          <Skeleton className="h-4 w-16" delay={350} />
          <Skeleton className="h-4 w-16" delay={400} />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-14 w-44" rounded="lg" delay={500} />
          <Skeleton className="h-14 w-36" rounded="lg" delay={600} />
        </div>
      </div>
    </div>
  );
}

export function FeaturedCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="shrink-0 w-[280px] md:w-[340px] space-y-4">
      <Skeleton className="aspect-video w-full" rounded="lg" delay={delay} />
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/2" delay={delay + 50} />
        <Skeleton className="h-3 w-1/3 opacity-40" delay={delay + 100} />
      </div>
    </div>
  );
}

export function RowSkeleton({ title }: { title?: string }) {
  return (
    <div className="px-10 py-10 space-y-6">
      {title && <Skeleton className="h-7 w-56" delay={0} />}
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <MovieCardSkeleton key={i} delay={i * 50} />
        ))}
      </div>
    </div>
  );
}
