import { Skeleton } from '@/components/ui/Skeleton';

export default function DetailLoading() {
  return (
    <div className="min-h-screen animate-in fade-in duration-1000">
      {/* Hero Backdrop Skeleton */}
      <div className="relative h-[85vh] w-full">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-[--flx-bg]/40 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end px-12 pb-24">
          <div className="flex flex-col md:flex-row gap-12 items-end w-full">
            {/* Poster Skeleton */}
            <Skeleton className="hidden md:block w-[300px] aspect-2/3 rounded-2xl shadow-2xl shrink-0" />
            
            {/* Metadata Skeleton */}
            <div className="flex-1 space-y-6 pb-4">
              <Skeleton className="h-4 w-32 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-3/4 rounded-xl" />
                <Skeleton className="h-6 w-1/2 rounded-lg opacity-60" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-14 w-48 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="px-12 py-16 space-y-20">
        <div className="space-y-8">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="flex gap-6 overflow-hidden">
             {Array.from({ length: 8 }).map((_, i) => (
               <Skeleton key={i} className="w-40 h-40 rounded-full shrink-0" />
             ))}
          </div>
        </div>
        
        <div className="space-y-8">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <div className="grid grid-cols-6 gap-6">
             {Array.from({ length: 6 }).map((_, i) => (
               <Skeleton key={i} className="aspect-2/3 rounded-xl" />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
