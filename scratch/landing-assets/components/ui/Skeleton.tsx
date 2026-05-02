import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ rounded = 'md', className, ...props }: SkeletonProps) {
  const r = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-xl', full: 'rounded-full' }[rounded];
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-white/5 via-white/8 to-white/5 bg-[length:400%_100%]',
        r,
        className
      )}
      {...props}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[140px]">
      <Skeleton className="w-[140px] h-[210px] mb-2.5" rounded="lg" />
      <Skeleton className="h-3 w-3/4 mb-1.5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-[560px] bg-[--flx-surface-1] animate-pulse" />
  );
}

export function ContinueWatchingSkeleton() {
  return (
    <div className="flex-shrink-0 w-[190px]">
      <Skeleton className="w-[190px] h-[108px] mb-2" rounded="lg" />
      <Skeleton className="h-3 w-3/4 mb-1.5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function FeaturedCardSkeleton() {
  return <Skeleton className="flex-shrink-0 w-[290px] h-[165px]" rounded="lg" />;
}
