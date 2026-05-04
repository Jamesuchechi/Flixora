'use server';

import { createClient } from '@/lib/supabase/server';
import { analyzeTrailer } from '@/lib/ai/groq';

/**
 * Fetches or generates AI insights for a title.
 */
export async function getAIInsights(tmdbId: number, title: string, overview: string, genres: string[]) {
  const supabase = await createClient();

  // 1. Check if we already have it in ai_metadata and if it's fresh
  const { data: existing } = await supabase
    .from('ai_metadata')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .single();

  const STALE_THRESHOLD = 30 * 24 * 60 * 60 * 1000; // 30 days
  const isStale = existing && (new Date().getTime() - new Date(existing.generated_at).getTime() > STALE_THRESHOLD);

  if (existing && !isStale) {
    return existing;
  }

  // 2. If not found or stale, generate it with Groq
  try {
    const response = await analyzeTrailer(title, overview, genres);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // If generation fails but we have stale data, return it as fallback
      if (existing) return existing;
      return null;
    }

    const insights = JSON.parse(jsonMatch[0]);

    // 3. Store in Supabase with explicit error check
    const { data, error } = await supabase
      .from('ai_metadata')
      .upsert({
        tmdb_id: tmdbId,
        expectations: insights.expectations,
        pitch: insights.pitch,
        vibes: insights.vibes,
        generated_at: new Date().toISOString()
      }, { onConflict: 'tmdb_id' })
      .select()
      .single();

    if (error) {
      console.error('CRITICAL: AI Metadata Upsert Failed:', error);
      // Fallback to returned insights if DB fails but we have the generation result
      return { 
        ...insights, 
        tmdb_id: tmdbId,
        generated_at: new Date().toISOString() 
      };
    }

    return data;
  } catch (err) {
    console.error('Error generating AI insights:', err);
    return existing || null;
  }
}
