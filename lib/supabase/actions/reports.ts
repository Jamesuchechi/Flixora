'use server';

import { createClient } from '../server';

interface ReportData {
  videoId: string;
  title: string;
  reason: string;
}

/**
 * Submits a content report to Supabase.
 */
export async function submitContentReport({ videoId, title, reason }: ReportData) {
  const supabase = await createClient();
  
  // Get current user if logged in
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('content_reports')
    .insert({
      video_id: videoId,
      title: title,
      reason: reason,
      user_id: user?.id || null,
      status: 'pending'
    });

  if (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }

  return { success: true };
}
