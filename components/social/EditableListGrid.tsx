'use client';

import { useState } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, GripVertical } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { tmdb } from '@/lib/tmdb';
import { BLUR_DATA_URL, getYear } from '@/lib/utils';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { ListItemActions } from './ListItemActions';
import { updateListItemOrder } from '@/lib/supabase/actions/lists';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type DisplayItem = (TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' };

interface EditableListGridProps {
  listId: string;
  initialItems: DisplayItem[];
  isOwner: boolean;
  votesMap: Record<string, { score: number, userVote: number }>;
}

export function EditableListGrid({ listId, initialItems, isOwner, votesMap }: EditableListGridProps) {
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`list:${listId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_items', filter: `list_id=eq.${listId}` },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_item_votes', filter: `list_id=eq.${listId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, supabase, router]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    if (isOwner) {
       // Persist to DB
       const orderData = newItems.map((item, index) => ({
         tmdb_id: item.id,
         media_type: item.media_type,
         position: index
       }));
       await updateListItemOrder(listId, orderData);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        <SortableContext 
          items={items.map(i => i.id)}
          strategy={rectSortingStrategy}
        >
          {items.map((item) => (
            <SortableItem 
              key={item.id} 
              item={item} 
              listId={listId}
              isOwner={isOwner}
              voteData={votesMap[`${item.id}_${item.media_type}`] || { score: 0, userVote: 0 }}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}

function SortableItem({ item, listId, isOwner, voteData }: { item: DisplayItem, listId: string, isOwner: boolean, voteData: { score: number, userVote: number } }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled: !isOwner });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const isMovie = item.media_type === 'movie';
  const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
  const date = isMovie ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date;

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <Link 
        href={`/${isMovie ? 'movies' : 'series'}/${item.id}`}
        className="block"
      >
        <div className="relative aspect-2/3 rounded-3xl overflow-hidden bg-[--flx-surface-2] border border-white/5 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] group-hover:border-[--flx-cyan]/30">
           <Image 
              src={tmdb.image(item.poster_path, 'w500')} 
              alt={title} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 250px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
           />
           <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
              <div className="w-10 h-10 rounded-full bg-[--flx-cyan] flex items-center justify-center mb-3 shadow-lg">
                 <Play size={16} fill="black" className="ml-1" />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[2px]">{isMovie ? 'Movie' : 'Series'}</p>
           </div>
        </div>
      </Link>

      {/* Grip for Reordering */}
      {isOwner && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-4 left-4 z-20 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white/40 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all"
        >
           <GripVertical size={16} />
        </div>
      )}

      {/* Voting Actions */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
         <ListItemActions 
            listId={listId}
            tmdbId={item.id}
            mediaType={item.media_type}
            initialScore={voteData.score}
            initialUserVote={voteData.userVote}
         />
      </div>

      <div className="mt-4 px-1">
        <h4 className="text-[14px] font-bold text-[--flx-text-1] truncate group-hover:text-[--flx-cyan] transition-colors">{title}</h4>
        <div className="flex items-center gap-2 mt-1">
           <span className="text-[11px] text-[--flx-gold] font-black">★ {item.vote_average.toFixed(1)}</span>
           <span className="text-[11px] text-[--flx-text-3] font-bold tracking-tighter">{getYear(date)}</span>
        </div>
      </div>
    </div>
  );
}
