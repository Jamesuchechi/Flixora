import { Skeleton } from '@/components/ui/Skeleton';

export default function MoviesLoading() {
  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <div className="px-6 md:px-10 pt-10 pb-8 border-b border-white/5 bg-linear-to-b from-white/5 to-transparent">
        <div className="space-y-3">
          <Skeleton className="h-12 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </div>

      <div className="px-6 md:px-10 pt-10 space-y-16">
        {/* Featured Hero Skeleton */}
        <div className="relative h-[450px] rounded-3xl overflow-hidden">
          <Skeleton className="absolute inset-0" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end gap-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-16 w-3/4 rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 rounded-lg" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Grid Skeletons */}
        <div className="space-y-8">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-2/3 rounded-2xl" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-md opacity-50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
