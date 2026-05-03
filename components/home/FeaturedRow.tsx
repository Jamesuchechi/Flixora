import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';
import { Badge } from '@/components/ui/Badge';
import { FeaturedCardSkeleton } from '@/components/ui/Skeleton';
import { BLUR_DATA_URL } from '@/lib/utils';
import type { TMDBTVShow } from '@/types/tmdb';

interface FeaturedCardProps {
  show: TMDBTVShow;
  episodeInfo?: string;
}

export function FeaturedCard({ show, episodeInfo }: FeaturedCardProps) {
  const router = useRouter();
  const backdrop = tmdb.image(show.backdrop_path ?? show.poster_path, 'w780');
  const href = `/series/${show.id}`;

  return (
    <Link 
      href={href} 
      className="shrink-0 relative w-[290px] h-[165px] rounded-xl overflow-hidden group cursor-pointer block"
      onMouseEnter={() => router.prefetch(href)}
    >
      <Image 
        src={backdrop} 
        alt={show.name} 
        fill 
        className="object-cover transition-transform duration-300 group-hover:scale-105" 
        sizes="290px"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg]/95 via-transparent to-transparent" />
      <div className="absolute inset-0 border-2 border-[--flx-purple]/0 group-hover:border-[--flx-purple]/40 rounded-xl transition-all duration-200" />

      {/* Play icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-11 h-11 rounded-full bg-[--flx-purple]/90 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        </div>
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <p className="font-bebas text-[17px] tracking-wide mb-0.5">{show.name}</p>
        <p className="text-[10px] text-[--flx-text-3]">
          {episodeInfo ?? `${show.number_of_seasons ?? '?'} Seasons · Drama`}
        </p>
      </div>

      {/* New badge */}
      <div className="absolute top-2.5 left-2.5">
        <Badge variant="new">NEW</Badge>
      </div>
    </Link>
  );
}

interface FeaturedRowProps {
  title: string;
  shows: TMDBTVShow[];
  loading?: boolean;
}

export function FeaturedRow({ title, shows, loading }: FeaturedRowProps) {
  return (
    <section className="px-10 py-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bebas text-xl tracking-[2px] text-[--flx-text-1] flex items-center gap-2.5">
          {title}
          <Badge variant="new">NEW</Badge>
        </h2>
        <Link href="/series" className="text-xs text-[--flx-cyan] font-medium hover:opacity-70 transition-opacity">
          View all →
        </Link>
      </div>
      <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <FeaturedCardSkeleton key={i} />)
          : shows.map((s) => <FeaturedCard key={s.id} show={s} />)
        }
      </div>
    </section>
  );
}


