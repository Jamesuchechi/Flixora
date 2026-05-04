import { notFound } from 'next/navigation';
import { getPartyDetails, getPartyParticipants, joinWatchParty } from '@/lib/supabase/actions/watch-parties';
import { getUserProfile } from '@/lib/supabase/actions/auth';
import { tmdb } from '@/lib/tmdb';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { PartyUI } from './PartyUI';

interface PartyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { id } = await params;
  const party = await getPartyDetails(id);

  if (!party) {
    notFound();
  }

  const currentUser = await getUserProfile();
  if (!currentUser) {
    return <div>Please log in to join the party.</div>;
  }

  // Auto-join participant list
  await joinWatchParty(id);

  const participants = await getPartyParticipants(id);
  const isHost = party.host_id === currentUser.user.id;

  // Fetch media details
  const media = (party.media_type === 'movie' 
    ? await tmdb.movies.detail(party.tmdb_id) 
    : await tmdb.tv.detail(party.tmdb_id)) as TMDBMovie | TMDBTVShow;

  const title = (media as TMDBMovie).title || (media as TMDBTVShow).name;

  return (
    <PartyUI 
      party={party} 
      currentUser={currentUser.user} 
      participants={participants}
      media={media}
      title={title}
      isHost={isHost}
    />
  );
}
