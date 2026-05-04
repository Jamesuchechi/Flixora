'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Create a new custom list.
 */
export async function createList(name: string, description: string, isPublic: boolean = true) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('custom_lists')
    .insert({
      user_id: user.id,
      name,
      description,
      is_public: isPublic
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/profile');

  // Log activity
  const { createActivityEvent } = await import('./social');
  await createActivityEvent('create_list', { 
    list_id: data.id, 
    list_name: data.name 
  });

  return data;
}

/**
 * Add an item to a list.
 */
export async function addToList(listId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      tmdb_id: tmdbId,
      media_type: mediaType
    });

  if (error) {
    if (error.code === '23505') return { success: true }; // Already in list
    throw new Error(error.message);
  }

  revalidatePath(`/list/${listId}`);
  return { success: true };
}

/**
 * Remove an item from a list.
 */
export async function removeFromList(listId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType);

  if (error) throw new Error(error.message);

  revalidatePath(`/list/${listId}`);
  return { success: true };
}

/**
 * Get list details including items.
 */
export async function getListDetails(listId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('custom_lists')
    .select(`
      *,
      items:list_items(*),
      votes:list_item_votes(*),
      owner:profiles!custom_lists_user_id_fkey(*)
    `)
    .eq('id', listId)
    .order('position', { foreignTable: 'list_items', ascending: true })
    .single();

  if (error) return null;
  return data;
}

/**
 * Get all lists for a user.
 */
export async function getUserLists(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('custom_lists')
    .select('*, items:list_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data.map(list => ({
    ...list,
    item_count: list.items?.[0]?.count || 0
  }));
}

/**
 * Invite a collaborator to a list.
 */
export async function inviteCollaborator(listId: string, userId: string, role: 'editor' | 'viewer' = 'editor') {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('list_collaborators')
    .insert({
      list_id: listId,
      user_id: userId,
      role
    });

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Vote on a list item.
 */
export async function voteOnListItem(listId: string, tmdbId: number, mediaType: string, vote: 1 | -1 | 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  if (vote === 0) {
    await supabase
      .from('list_item_votes')
      .delete()
      .eq('list_id', listId)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .eq('user_id', user.id);
  } else {
    const { error } = await supabase
      .from('list_item_votes')
      .upsert({
        list_id: listId,
        tmdb_id: tmdbId,
        media_type: mediaType,
        user_id: user.id,
        vote
      });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/list/${listId}`);
  return { success: true };
}

/**
 * Update the order of items in a list.
 */
export async function updateListItemOrder(listId: string, items: { tmdb_id: number; media_type: string; position: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify permission
  const { data: list } = await supabase.from('custom_lists').select('user_id').eq('id', listId).single();
  const { data: colab } = await supabase.from('list_collaborators').select('role').eq('list_id', listId).eq('user_id', user?.id).single();

  if (list?.user_id !== user?.id && colab?.role !== 'editor') {
    throw new Error('You do not have permission to reorder this list.');
  }

  const { error } = await supabase
    .from('list_items')
    .upsert(items.map(item => ({
      list_id: listId,
      ...item
    })));

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Fork an existing list (create a copy).
 */
export async function forkList(listId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: originalList } = await supabase
    .from('custom_lists')
    .select('*, items:list_items(*)')
    .eq('id', listId)
    .single();

  if (!originalList) throw new Error('List not found');

  const { data: newList, error: createError } = await supabase
    .from('custom_lists')
    .insert({
      user_id: user.id,
      name: `${originalList.name} (Copy)`,
      description: originalList.description,
      is_public: false
    })
    .select()
    .single();

  if (createError) throw new Error(createError.message);

  if (originalList.items && originalList.items.length > 0) {
    interface RawListItem {
      tmdb_id: number;
      media_type: string;
      position: number;
    }

    const itemsToInsert = (originalList.items as unknown as RawListItem[]).map((item) => ({
      list_id: newList.id,
      tmdb_id: item.tmdb_id,
      media_type: item.media_type,
      position: item.position
    }));
    await supabase.from('list_items').insert(itemsToInsert);
  }

  // Log activity
  const { createActivityEvent } = await import('./social');
  await createActivityEvent('fork_list', { 
    list_id: newList.id, 
    list_name: newList.name,
    original_list_id: listId
  });

  return newList;
}
