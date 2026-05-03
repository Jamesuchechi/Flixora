'use server';

import { createClient } from '@/lib/supabase/server';
import { analyzeTrailer } from '@/lib/ai/groq';

/**
 * Fetches or generates AI insights for a title.
 */
export async function getAIInsights(tmdbId: number, title: string, overview: string, genres: string[]) {
  const supabase = await createClient();

  // 1. Check if we already have it in ai_metadata
  const { data: existing } = await supabase
    .from('ai_metadata')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .single();

  if (existing) {
    return existing;
  }

  // 2. If not, generate it with Groq
  try {
    const response = await analyzeTrailer(title, overview, genres);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const insights = JSON.parse(jsonMatch[0]);

    // 3. Store in Supabase
    const { data, error } = await supabase
      .from('ai_metadata')
      .upsert({
        tmdb_id: tmdbId,
        expectations: insights.expectations,
        pitch: insights.pitch,
        vibes: insights.vibes,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing AI metadata:', error);
    }

    return data;
  } catch (err) {
    console.error('Error generating AI insights:', err);
    return null;
  }
}
