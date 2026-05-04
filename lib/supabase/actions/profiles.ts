'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Profile } from '@/types/supabase';
import { tmdb } from '@/lib/tmdb';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface EnrichedWatchProgress {
  id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  updated_at: string;
  title?: string;
  backdrop_path?: string | null;
}

interface EnrichedCustomList {
  id: string;
  name: string;
  description: string | null;
  item_count: number;
  is_public: boolean;
}

/**
 * Fetch a profile by username.
 */
export async function getProfileByUsername(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) return null;
  return data as Profile;
}

/**
 * Fetch a profile by ID.
 */
export async function getProfileById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Profile;
}

/**
 * Get public profile data including pinned media and watch stats.
 */
export async function getPublicProfileData(username: string) {
  const profile = await getProfileByUsername(username);
  if (!profile) return null;

  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === profile.id;

  // Check friendship if needed for privacy
  let isFriend = false;
  if (!isOwnProfile && currentUser) {
    const { getFriendshipStatus } = await import('./social');
    const status = await getFriendshipStatus(profile.id);
    isFriend = status?.status === 'accepted';
  }

  // Helper to check permission
  const hasPermission = (setting: string | undefined) => {
    if (isOwnProfile) return true;
    if (setting === 'public') return true;
    if (setting === 'friends') return isFriend;
    return false;
  };

  // Fetch watch history (if permitted)
  let history: EnrichedWatchProgress[] = [];
  if (hasPermission(profile.privacy_activity)) {
    const { data: rawHistory } = await supabase
      .from('watch_progress')
      .select('*')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (rawHistory) {
      history = await Promise.all(
        rawHistory.map(async (item) => {
          try {
            const details = item.media_type === 'movie' 
              ? await tmdb.movies.detail(item.tmdb_id)
              : await tmdb.tv.detail(item.tmdb_id);
            return { 
              ...item, 
              title: (details as TMDBMovie).title || (details as TMDBTVShow).name,
              backdrop_path: details.backdrop_path 
            };
          } catch {
            return item;
          }
        })
      );
    }
  }

  // Fetch custom lists (if permitted)
  let lists: EnrichedCustomList[] = [];
  if (hasPermission(profile.privacy_lists)) {
    const { data: rawLists } = await supabase
      .from('custom_lists')
      .select('*, items:list_items(count)')
      .eq('user_id', profile.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (rawLists) {
      lists = rawLists.map(list => ({
        ...list,
        item_count: (list.items as unknown as { count: number }[])[0]?.count || 0
      }));
    }
  }

  // Fetch pinned media details if exists
  let pinnedMedia = null;
  if (profile.pinned_media_id && profile.pinned_media_type) {
    try {
      if (profile.pinned_media_type === 'movie') {
        pinnedMedia = await tmdb.movies.detail(profile.pinned_media_id);
      } else {
        pinnedMedia = await tmdb.tv.detail(profile.pinned_media_id);
      }
    } catch (err) {
      console.error('Failed to fetch pinned media details:', err);
    }
  }

  return {
    profile,
    history: history || [],
    lists: lists || [],
    pinnedMedia,
    favoriteGenres: await (async () => {
      if (!profile.favorite_genres?.length) return [];
      try {
        const [mGenres, tGenres] = await Promise.all([
          tmdb.genres.movies({ silent: true }),
          tmdb.genres.tv({ silent: true })
        ]);
        const allGenres = [...mGenres.genres, ...tGenres.genres];
        return profile.favorite_genres.map(id => 
          allGenres.find(g => g.id === id)?.name || `Genre ${id}`
        );
      } catch {
        return profile.favorite_genres.map(id => `Genre ${id}`);
      }
    })()
  };
}

/**
 * Update profile customization (pinned film, accent color).
 */
export async function updateProfileCustomization(
  pinnedMediaId: number | null,
  pinnedMediaType: 'movie' | 'tv' | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({
      pinned_media_id: pinnedMediaId,
      pinned_media_type: pinnedMediaType,
    })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }
  
  revalidatePath('/profile');
  return { success: true };
}

/**
 * Upload profile avatar to Supabase Storage.
 */
export async function uploadAvatar(file: File) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath);

  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  revalidatePath('/profile');
  return publicUrl;
}

/**
 * Get profile badges (Mock logic for now based on stats).
 */
export async function getProfileBadges(userId: string) {
  const supabase = await createClient();

  const { count: watchCount } = await supabase
    .from('watch_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const badges = [];
  if ((watchCount || 0) > 0) badges.push({ id: 'early-member', name: 'Early Member', icon: '🌟' });
  if ((watchCount || 0) > 100) badges.push({ id: 'cinephile', name: 'Cinephile', icon: '🎬' });
  
  return badges;
}
