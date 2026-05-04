// server-only
import { tmdb } from '@/lib/tmdb';
import { createClient } from '@/lib/supabase/server';

import { 
  VERIFIED_FREE_CHANNELS, 
  type YouTubeCandidateVideo, 
  type TMDBMatch, 
  type PipelineResult 
} from './youtube-types';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Parses ISO 8601 duration (e.g. PT1H32M45S) into total seconds.
 */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours   = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Strips noise from a YouTube video title to get a clean searchable title.
 * Removes: year in parens, quality tags, trailing channel suffixes, etc.
 */
function cleanVideoTitle(raw: string): string {
  return raw
    // Remove year in parentheses e.g. (1985)
    .replace(/\(\d{4}\)/g, '')
    // Remove quality/descriptor tags (case-insensitive)
    .replace(/\b(1080p|720p|4K|HD|HQ|Full\s*Movie|Free|Watch\s*Free|Watch\s*Now|Official|English|Subtitle[s]?)\b/gi, '')
    // Remove " | Channel Name" style suffixes
    .replace(/[|\-–—].*$/g, '')
    // Collapse whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Levenshtein distance (simple, no dependency).
 */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy title score: 0–50 points.
 */
function titleScore(ytTitle: string, tmdbTitle: string): number {
  const a = ytTitle.toLowerCase().trim();
  const b = tmdbTitle.toLowerCase().trim();
  if (a === b) return 50;
  if (a.includes(b) || b.includes(a)) return 30;
  // Partial: check if most words overlap
  const wordsA = new Set(a.split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.split(/\W+/).filter(Boolean));
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  if (union > 0 && intersection / union >= 0.6) return 15;
  // Levenshtein fallback
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen > 0 && dist / maxLen < 0.3) return 10;
  return 0;
}

/**
 * Extracts a 4-digit year from a string (if present).
 */
function extractYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : null;
}

// ── Core Functions ─────────────────────────────────────────────────────────────

/**
 * Searches a verified channel for potential full-length movies.
 * YouTube quota cost: 100 units (search) + 1 unit per details batch.
 */
export async function searchChannelForMovies(
  channelId: string,
  channelName: string,
  maxResults: number = 50
): Promise<YouTubeCandidateVideo[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    console.warn('[Pipeline] YOUTUBE_API_KEY not set — skipping channel search');
    return [];
  }

  // Step 1 — Search for videos in this channel ordered by view count
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('channelId', channelId);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('order', 'viewCount');
  searchUrl.searchParams.set('maxResults', String(Math.min(maxResults, 50)));
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('key', API_KEY);

  const searchRes = await fetch(searchUrl.toString(), { cache: 'no-store' });
  if (!searchRes.ok) {
    console.error('[Pipeline] YouTube search failed:', await searchRes.text());
    return [];
  }
  const searchData = await searchRes.json();
  if (!searchData.items?.length) return [];

  interface SearchItem {
    id: { videoId: string };
    snippet: { title: string; publishedAt: string; thumbnails: { high?: { url: string } } };
  }
  const items = searchData.items as SearchItem[];
  const videoIds = items.map(i => i.id.videoId).join(',');

  // Step 2 — Batch-fetch video details (contentDetails, status, statistics)
  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  detailsUrl.searchParams.set('id', videoIds);
  detailsUrl.searchParams.set('part', 'contentDetails,status,statistics');
  detailsUrl.searchParams.set('key', API_KEY);

  const detailsRes = await fetch(detailsUrl.toString(), { cache: 'no-store' });
  if (!detailsRes.ok) {
    console.error('[Pipeline] YouTube video details failed:', await detailsRes.text());
    return [];
  }
  const detailsData = await detailsRes.json();

  interface DetailItem {
    id: string;
    contentDetails: { duration: string };
    status: { embeddable: boolean; privacyStatus: string };
    statistics: { viewCount?: string };
  }
  const details = (detailsData.items ?? []) as DetailItem[];
  const detailMap = new Map(details.map(d => [d.id, d]));

  // Step 3 — Filter: >= 50 min, embeddable, public
  const candidates: YouTubeCandidateVideo[] = [];

  for (const item of items) {
    const detail = detailMap.get(item.id.videoId);
    if (!detail) continue;

    const durationSec = parseDuration(detail.contentDetails.duration);
    const isEmbeddable = detail.status.embeddable === true;
    const isPublic = detail.status.privacyStatus === 'public';

    if (durationSec > 3000 && isEmbeddable && isPublic) {
      candidates.push({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelId,
        channelName,
        duration: durationSec,
        isEmbeddable,
        viewCount: parseInt(detail.statistics.viewCount ?? '0', 10),
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.high?.url ?? '',
      });
    }
  }

  return candidates;
}

/**
 * Attempts to match a YouTube video to a TMDB entry via cleaned title search + scoring.
 */
export async function matchVideoToTMDB(
  video: YouTubeCandidateVideo
): Promise<TMDBMatch | null> {
  const cleanTitle = cleanVideoTitle(video.title);
  if (!cleanTitle) return null;

  let searchResults: unknown[] = [];
  try {
    const res = await tmdb.search.multi(cleanTitle, 1, { silent: true });
    searchResults = (res as { results?: unknown[] }).results ?? [];
  } catch {
    return null;
  }

  const ytYear = extractYear(video.title);
  const preferMovie = /full\s*movie/i.test(video.title);

  interface TMDBResult {
    id: number;
    media_type: string;
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
  }

  let best: TMDBMatch | null = null;
  let bestScore = 0;

  for (const raw of searchResults) {
    const result = raw as TMDBResult;
    if (!['movie', 'tv'].includes(result.media_type)) continue;

    const tmdbTitle = result.title ?? result.name ?? '';
    if (!tmdbTitle) continue;

    let score = 0;

    // Title similarity: 0–50 pts
    score += titleScore(cleanTitle, tmdbTitle);

    // Year match: ±1 → +30 pts
    if (ytYear !== null) {
      const releaseStr = result.release_date ?? result.first_air_date ?? '';
      const tmdbYear = extractYear(releaseStr);
      if (tmdbYear !== null && Math.abs(ytYear - tmdbYear) <= 1) {
        score += 30;
      }
    }

    // Type boost for 'full movie' in title: +10 pts
    if (preferMovie && result.media_type === 'movie') {
      score += 10;
    }

    if (score > bestScore) {
      bestScore = score;
      best = {
        tmdbId: result.id,
        mediaType: result.media_type as 'movie' | 'tv',
        title: tmdbTitle,
        posterPath: result.poster_path,
        confidence: Math.min(score, 100),
      };
    }
  }

  // Minimum confidence gate: 60
  if (!best || best.confidence < 60) return null;
  return best;
}

/**
 * Runs the full discovery pipeline across verified channels.
 * Quota budget: stops before exceeding 8000 units/day.
 */
export async function runDiscoveryPipeline(options: {
  channelIds?: string[];
  dryRun?: boolean;
  maxPerChannel?: number;
}): Promise<PipelineResult> {
  const { channelIds, dryRun = true, maxPerChannel = 25 } = options;

  const channels = channelIds?.length
    ? VERIFIED_FREE_CHANNELS.filter(c => channelIds.includes(c.channelId))
    : VERIFIED_FREE_CHANNELS;

  const result: PipelineResult = {
    processed: 0,
    matched: 0,
    added: 0,
    skipped: 0,
    failed: 0,
    results: [],
  };

  // Quota tracking: search = 100 units, each details batch = 1 unit
  let quotaUsed = 0;
  const QUOTA_LIMIT = 8000;

  const supabase = dryRun ? null : await createClient();

  for (const channel of channels) {
    // Each channel search costs ~101 units (100 search + 1 details batch)
    if (quotaUsed + 101 > QUOTA_LIMIT) {
      console.warn('[Pipeline] Quota limit approached — stopping early.');
      break;
    }

    let candidates: YouTubeCandidateVideo[];
    try {
      candidates = await searchChannelForMovies(channel.channelId, channel.name, maxPerChannel);
      quotaUsed += 101; // search (100) + details batch (1)
    } catch (err) {
      console.error(`[Pipeline] Error fetching channel ${channel.name}:`, err);
      continue;
    }

    for (const video of candidates) {
      result.processed++;

      // Each TMDB search is free (our own API), no quota cost here
      let match: TMDBMatch | null = null;
      try {
        match = await matchVideoToTMDB(video);
      } catch (err) {
        result.failed++;
        result.results.push({
          videoId: video.videoId,
          videoTitle: video.title,
          tmdbId: null,
          tmdbTitle: null,
          confidence: 0,
          action: 'failed',
          reason: err instanceof Error ? err.message : 'TMDB match threw an error',
        });
        continue;
      }

      if (!match) {
        result.results.push({
          videoId: video.videoId,
          videoTitle: video.title,
          tmdbId: null,
          tmdbTitle: null,
          confidence: 0,
          action: 'no_match',
          reason: 'No TMDB match with confidence ≥ 60',
        });
        continue;
      }

      result.matched++;

      if (dryRun) {
        result.results.push({
          videoId: video.videoId,
          videoTitle: video.title,
          tmdbId: match.tmdbId,
          tmdbTitle: match.title,
          confidence: match.confidence,
          action: 'added',
          reason: 'Dry run — not saved',
        });
        continue;
      }

      // Check if already in DB
      const { data: existing } = await supabase!
        .from('free_films')
        .select('id')
        .eq('tmdb_id', match.tmdbId)
        .eq('media_type', match.mediaType)
        .maybeSingle();

      if (existing) {
        result.skipped++;
        result.results.push({
          videoId: video.videoId,
          videoTitle: video.title,
          tmdbId: match.tmdbId,
          tmdbTitle: match.title,
          confidence: match.confidence,
          action: 'skipped',
          reason: 'Already in free_films library',
        });
        continue;
      }

      // Insert
      const { error: insertError } = await supabase!
        .from('free_films')
        .insert({
          tmdb_id: match.tmdbId,
          media_type: match.mediaType,
          youtube_id: video.videoId,
          title: match.title,
          poster_path: match.posterPath,
          source: channel.name,
          region: 'ALL',
          verified_at: new Date().toISOString(),
        });

      if (insertError) {
        result.failed++;
        result.results.push({
          videoId: video.videoId,
          videoTitle: video.title,
          tmdbId: match.tmdbId,
          tmdbTitle: match.title,
          confidence: match.confidence,
          action: 'failed',
          reason: insertError.message,
        });
      } else {
        result.added++;
        result.results.push({
          videoId: video.videoId,
          videoTitle: video.title,
          tmdbId: match.tmdbId,
          tmdbTitle: match.title,
          confidence: match.confidence,
          action: 'added',
          reason: `Discovered via ${channel.name}`,
        });
      }
    }
  }

  return result;
}
