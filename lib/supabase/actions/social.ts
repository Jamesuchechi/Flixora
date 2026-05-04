'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';
import type { Friendship, Profile, Json } from '@/types/supabase';

interface ActivityPayload {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  rating?: number;
  poster_path?: string;
}

/**
 * Send a friend request to a user.
 */
export async function sendFriendRequest(addresseeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');
  if (user.id === addresseeId) throw new Error('Cannot add yourself as friend');

  const { error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: 'pending'
    });

  if (error) {
    if (error.code === '23505') throw new Error('Request already exists');
    throw new Error(error.message);
  }

  // Notify the addressee
  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  await createNotification(
    addresseeId,
    'social',
    'New Friend Request',
    `${requesterProfile?.username || 'Someone'} sent you a friend request.`,
    `/u/${requesterProfile?.username}`
  );

  revalidatePath(`/u/${requesterProfile?.username}`);
  return { success: true };
}

/**
 * Accept a friend request.
 */
export async function acceptFriendRequest(requesterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('requester_id', requesterId)
    .eq('addressee_id', user.id);

  if (error) throw new Error(error.message);

  // Notify the requester
  const { data: accepterProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  await createNotification(
    requesterId,
    'social',
    'Friend Request Accepted',
    `${accepterProfile?.username || 'Someone'} accepted your friend request!`,
    `/u/${accepterProfile?.username}`
  );

  revalidatePath('/profile/friends');
  return { success: true };
}

/**
 * Decline or cancel a friend request.
 */
export async function removeFriendship(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`);

  if (error) throw new Error(error.message);

  revalidatePath('/profile/friends');
  return { success: true };
}

/**
 * Get all friends for the current user.
 */
export async function getFriends() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      requester:profiles!friendships_requester_id_fkey(*),
      addressee:profiles!friendships_addressee_id_fkey(*)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    console.error('Error fetching friends:', error);
    return [];
  }

  // Map to a list of friend profiles
  return data.map(f => {
    const requester = f.requester as unknown as Profile;
    const addressee = f.addressee as unknown as Profile;
    return requester.id === user.id ? addressee : requester;
  });
}

/**
 * Block a user.
 */
export async function blockUser(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Remove any existing friendship first to ensure we are the requester of the block
  await supabase
    .from('friendships')
    .delete()
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`);

  const { error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: otherUserId,
      status: 'blocked'
    });

  if (error) throw new Error(error.message);
  revalidatePath('/profile/friends');
  revalidatePath('/settings/privacy');
  return { success: true };
}

/**
 * Unblock a user.
 */
export async function unblockUser(otherUserId: string) {
  return removeFriendship(otherUserId);
}

/**
 * Get all blocked users.
 */
export async function getBlockedUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select('addressee:profiles!friendships_addressee_id_fkey(*)')
    .eq('requester_id', user.id)
    .eq('status', 'blocked');

  if (error) {
    console.error('Error fetching blocked users:', error);
    return [];
  }

  return data.map(d => d.addressee as unknown as Profile);
}

/**
 * Get the most reacted moments for a media item.
 */
export async function getTopReactions(tmdbId: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reactions')
    .select('timestamp_seconds')
    .eq('tmdb_id', tmdbId);

  if (error || !data) return [];

  // Group by 1-minute bins and find peaks
  const bins: Record<number, number> = {};
  data.forEach(r => {
    const minute = Math.floor(r.timestamp_seconds / 60);
    bins[minute] = (bins[minute] || 0) + 1;
  });

  return Object.entries(bins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([minute, count]) => ({
      minute: parseInt(minute),
      count
    }));
}

/**
 * Check friendship status between current user and another user.
 */
export async function getFriendshipStatus(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`)
    .maybeSingle();

  if (error) return null;
  return data as Friendship;
}

/**
 * Kick a participant from a watch party.
 */
export async function kickParticipant(partyId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify requester is the host
  const { data: party } = await supabase
    .from('watch_parties')
    .select('host_id')
    .eq('id', partyId)
    .single();

  if (!party || party.host_id !== user?.id) {
    throw new Error('Only the host can kick participants.');
  }

  const { error } = await supabase
    .from('party_participants')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Transfer host role to another participant.
 */
export async function transferHost(partyId: string, newHostId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify requester is current host
  const { data: party } = await supabase
    .from('watch_parties')
    .select('host_id')
    .eq('id', partyId)
    .single();

  if (!party || party.host_id !== user?.id) {
    throw new Error('Only the current host can transfer leadership.');
  }

  const { error } = await supabase
    .from('watch_parties')
    .update({ host_id: newHostId })
    .eq('id', partyId);

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Update party settings (e.g., locking).
 */
export async function updatePartySettings(partyId: string, settings: { is_locked?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: party } = await supabase
    .from('watch_parties')
    .select('host_id')
    .eq('id', partyId)
    .single();

  if (!party || party.host_id !== user?.id) {
    throw new Error('Only the host can update settings.');
  }

  const { error } = await supabase
    .from('watch_parties')
    .update(settings)
    .eq('id', partyId);

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Create a new activity event.
 */
export async function createActivityEvent(type: string, payload: Json) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const { error } = await supabase
    .from('activity_events')
    .insert({
      user_id: user.id,
      type,
      payload
    });

  if (error) {
    console.error('Failed to create activity event:', error);
    return { success: false };
  }

  return { success: true };
}

/**
 * Get activity feed for the current user (friends + own).
 */
export async function getActivityFeed() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Get current user's watch history for spoiler protection
  const { data: myHistory } = await supabase
    .from('watch_progress')
    .select('tmdb_id')
    .eq('user_id', user.id);
  const watchedIds = new Set(myHistory?.map(h => h.tmdb_id) || []);

  const friends = await getFriends();
  const friendIds = friends.map(f => f.id);
  const userIds = [user.id, ...friendIds];

  const { data, error } = await supabase
    .from('activity_events')
    .select(`
      *,
      profiles!inner(*),
      likes:activity_likes(user_id),
      comments:activity_comments(count)
    `)
    .in('user_id', userIds)
    // Filter: own activity, or public activity, or friends-only activity if requester is a friend
    .or(`user_id.eq.${user.id},profiles.privacy_activity.eq.public,and(profiles.privacy_activity.eq.friends,user_id.in.(${friendIds.length > 0 ? friendIds.join(',') : user.id}))`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }

  // Enrich data with simplified interaction info
  return data.map(item => {
    const likes = item.likes as unknown as { user_id: string }[];
    const comments = item.comments as unknown as { count: number }[];
    
    return {
      ...item,
      like_count: likes?.length || 0,
      has_liked: likes?.some(l => l.user_id === user.id) || false,
      comment_count: comments?.[0]?.count || 0,
      has_watched: watchedIds.has((item.payload as unknown as ActivityPayload)?.tmdb_id)
    };
  });
}

/**
 * Toggle a like on an activity item.
 */
export async function toggleActivityLike(activityId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('activity_likes')
    .select('*')
    .eq('activity_id', activityId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('activity_likes')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', user.id);
    return { liked: false };
  } else {
    await supabase
      .from('activity_likes')
      .insert({
        activity_id: activityId,
        user_id: user.id
      });
    return { liked: true };
  }
}

/**
 * Add a comment to an activity item.
 */
export async function addActivityComment(activityId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('activity_comments')
    .insert({
      activity_id: activityId,
      user_id: user.id,
      content
    })
    .select('*, profiles(*)')
    .single();

  if (error) throw new Error(error.message);

  return data;
}

/**
 * Get comments for an activity.
 */
export async function getActivityComments(activityId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('activity_comments')
    .select('*, profiles(*)')
    .eq('activity_id', activityId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data;
}

/**
 * Discovery: Recommend people based on shared watchlist overlap (>3 titles).
 */
export async function getPeopleYouMayKnow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // 1. Get current user's watchlist
  const { data: myWatchlist } = await supabase
    .from('watchlist')
    .select('tmdb_id')
    .eq('user_id', user.id);

  if (!myWatchlist || myWatchlist.length < 3) return [];

  const myTmdbIds = myWatchlist.map(w => w.tmdb_id);

  // 2. Find other users who have these titles in their watchlist
  const { data: overlaps, error } = await supabase
    .from('watchlist')
    .select('user_id')
    .in('tmdb_id', myTmdbIds)
    .neq('user_id', user.id)
    .limit(1000);

  if (error || !overlaps) return [];

  // 3. Count overlaps per user
  const counts: Record<string, number> = {};
  overlaps.forEach(o => {
    counts[o.user_id] = (counts[o.user_id] || 0) + 1;
  });

  // 4. Filter users with >= 3 shared titles
  const recommendedIds = Object.entries(counts)
    .filter(([, count]) => count >= 3)
    .map(([userId]) => userId);

  if (recommendedIds.length === 0) return [];

  // 5. Exclude existing friends
  const friends = await getFriends();
  const friendIds = new Set(friends.map(f => f.id));
  const finalIds = recommendedIds.filter(id => !friendIds.has(id)).slice(0, 5);

  if (finalIds.length === 0) return [];

  // 6. Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', finalIds);

  return (profiles || []) as Profile[];
}

/**
 * Save a user reaction at a specific timestamp.
 */
export async function saveReaction(tmdbId: number, emoji: string, timestamp: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const { error } = await supabase
    .from('reactions')
    .insert({
      tmdb_id: tmdbId,
      user_id: user.id,
      emoji,
      timestamp_seconds: Math.floor(timestamp)
    });

  if (error) {
    console.error('Failed to save reaction:', error);
    return { success: false };
  }

  return { success: true };
}

/**
 * Get reactions for a title to build a heatmap.
 */
export async function getReactions(tmdbId: number, visibility: 'all' | 'friends' = 'all') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('reactions')
    .select('emoji, timestamp_seconds, user_id')
    .eq('tmdb_id', tmdbId);

  if (visibility === 'friends' && user) {
    const friends = await getFriends();
    const friendIds = friends.map(f => f.id);
    // Include current user in friends view
    query = query.in('user_id', [...friendIds, user.id]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reactions:', error);
    return [];
  }

  return data;
}
