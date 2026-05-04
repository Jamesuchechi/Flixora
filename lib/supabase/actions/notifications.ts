'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Notification } from '@/types/supabase';

/**
 * Fetch all notifications for the current user.
 */
export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false };
  }

  revalidatePath('/notifications');
  return { success: true };
}

/**
 * Mark all notifications for the user as read.
 */
export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to mark all as read:', error);
    return { success: false };
  }

  revalidatePath('/notifications');
  return { success: true };
}

/**
 * Delete a notification.
 */
export async function deleteNotification(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete notification:', error);
    return { success: false };
  }

  revalidatePath('/notifications');
  return { success: true };
}
