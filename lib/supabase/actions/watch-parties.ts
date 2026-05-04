'use server';

import { createClient } from '@/lib/supabase/server';
import type { WatchParty } from '@/types/supabase';

/**
 * Start a new watch party for a movie or series.
 */
export async function startWatchParty(tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: party, error } = await supabase
    .from('watch_parties')
    .insert({
      host_id: user.id,
      tmdb_id: tmdbId,
      media_type: mediaType,
      status: 'lobby',
      playback_timestamp: 0,
      is_locked: false
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Add host as participant
  await supabase.from('party_participants').insert({
    party_id: party.id,
    user_id: user.id
  });

  // Log activity (non-critical)
  try {
    const { createActivityEvent } = await import('./social');
    await createActivityEvent('create_party', { 
      party_id: party.id,
      tmdb_id: tmdbId,
      media_type: mediaType
    });
  } catch (err) {
    console.error('Activity logging failed:', err);
  }

  return party as WatchParty;
}

/**
 * Join an existing watch party.
 */
export async function joinWatchParty(partyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Check party details (limits and lock)
  const { data: party, error: partyError } = await supabase
    .from('watch_parties')
    .select('*, participants:party_participants(count)')
    .eq('id', partyId)
    .single();

  if (partyError || !party) throw new Error('Party not found');

  // 1. Check size limit (Free = 3)
  const participantCount = party.participants?.[0]?.count || 0;
  const LIMIT = 3; // TODO: Check user subscription tier for dynamic limits
  
  const isAlreadyIn = (await supabase.from('party_participants').select('user_id').eq('party_id', partyId).eq('user_id', user.id)).data?.length || 0;

  if (!isAlreadyIn && participantCount >= LIMIT) {
    throw new Error('This watch party is full (Limit: 3). Upgrade to Pro for more!');
  }

  // 2. Check lock status
  if (party.is_locked && party.host_id !== user.id && !isAlreadyIn) {
    throw new Error('This watch party is locked by the host.');
  }

  const { error } = await supabase
    .from('party_participants')
    .upsert({
      party_id: partyId,
      user_id: user.id
    });

  if (error) throw new Error(error.message);

  // Get current state for auto-sync
  const { data: finalParty } = await supabase
    .from('watch_parties')
    .select('playback_timestamp, status')
    .eq('id', partyId)
    .single();

  // Log system message
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  await sendSystemMessage(partyId, `${profile?.username || 'Someone'} joined the party`);

  // Log activity
  const { createActivityEvent } = await import('./social');
  await createActivityEvent('join_party', { 
    party_id: partyId,
    tmdb_id: party.tmdb_id,
    media_type: party.media_type
  });

  return { 
    success: true, 
    initialState: finalParty 
  };
}

/**
 * Leave a watch party.
 */
export async function leaveWatchParty(partyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('party_participants')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  // Log system message
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  await sendSystemMessage(partyId, `${profile?.username || 'Someone'} left the party`);

  return { success: true };
}

/**
 * Send a message to a watch party chat.
 */
export async function sendPartyMessage(partyId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('party_messages')
    .insert({
      party_id: partyId,
      user_id: user.id,
      content
    });

  if (error) throw new Error(error.message);

  return { success: true };
}

/**
 * Update the playback state (host only).
 */
export async function updatePartyState(partyId: string, timestamp: number, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('watch_parties')
    .update({
      playback_timestamp: timestamp,
      status: status,
    })
    .eq('id', partyId)
    .eq('host_id', user.id); // Security: only host can update

  if (error) throw new Error(error.message);

  // Log system message for significant state changes (pause/play)
  if (status === 'playing' || status === 'paused') {
     await sendSystemMessage(partyId, `Host ${status} the movie`);
  }

  return { success: true };
}

/**
 * End a watch party (host only).
 */
export async function endWatchParty(partyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('watch_parties')
    .update({ status: 'ended' })
    .eq('id', partyId)
    .eq('host_id', user.id);

  if (error) throw new Error(error.message);

  await sendSystemMessage(partyId, 'Host ended the watch party');

  return { success: true };
}

/**
 * Get party details including host profile and media.
 */
export async function getPartyDetails(partyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('watch_parties')
    .select(`
      *,
      host:profiles!host_id(*)
    `)
    .eq('id', partyId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get participants for a party.
 */
export async function getPartyParticipants(partyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('party_participants')
    .select(`
      *,
      user:profiles!user_id(*)
    `)
    .eq('party_id', partyId);

  if (error) return [];
  return data;
}

/**
 * Invite a friend to a watch party.
 */
export async function inviteToWatchParty(partyId: string, friendId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: hostProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  const { data: party } = await supabase.from('watch_parties').select('tmdb_id, media_type').eq('id', partyId).single();

  if (!party) throw new Error('Party not found');

  const { createNotification } = await import('./notifications');
  await createNotification(
    friendId,
    'social',
    'Watch Party Invite',
    `${hostProfile?.username || 'Someone'} invited you to watch a movie together!`,
    `/watch/${party.media_type}/${party.tmdb_id}?partyId=${partyId}`
  );

  return { success: true };
}

/**
 * Helper to send system messages.
 */
async function sendSystemMessage(partyId: string, content: string) {
  const supabase = await createClient();
  await supabase.from('party_messages').insert({
    party_id: partyId,
    user_id: null,
    content
  });
}
