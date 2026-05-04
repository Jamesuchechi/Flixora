import type { WatchmodeSource } from './watchmode';

export interface ProviderMeta {
  displayName: string;
  color: string;
  textColor: string;
  affiliateBase?: string;
  logo: string;
}

// ── Static brand metadata — never call an API ─────────────────────────────────

export const PROVIDER_METADATA: Record<string, ProviderMeta> = {
  'Netflix':             { displayName: 'Netflix',      color: '#E50914', textColor: '#fff', logo: '▶' },
  'Amazon Prime Video':  { displayName: 'Prime Video',  color: '#00A8E1', textColor: '#fff', affiliateBase: 'https://www.amazon.com/dp/', logo: '📦' },
  'Amazon Prime':        { displayName: 'Prime Video',  color: '#00A8E1', textColor: '#fff', affiliateBase: 'https://www.amazon.com/dp/', logo: '📦' },
  'Disney+':             { displayName: 'Disney+',      color: '#113CCF', textColor: '#fff', logo: '✦' },
  'Apple TV+':           { displayName: 'Apple TV+',    color: '#000000', textColor: '#fff', logo: '◆' },
  'Hulu':                { displayName: 'Hulu',         color: '#1CE783', textColor: '#000', logo: '▷' },
  'HBO Max':             { displayName: 'Max',          color: '#002BE7', textColor: '#fff', logo: '◉' },
  'Max':                 { displayName: 'Max',          color: '#002BE7', textColor: '#fff', logo: '◉' },
  'Peacock':             { displayName: 'Peacock',      color: '#000000', textColor: '#fff', logo: '◈' },
  'Peacock Premium':     { displayName: 'Peacock',      color: '#000000', textColor: '#fff', logo: '◈' },
  'Paramount+':          { displayName: 'Paramount+',   color: '#0064FF', textColor: '#fff', logo: '⬡' },
  'Tubi':                { displayName: 'Tubi',         color: '#FF5A00', textColor: '#fff', logo: '▸' },
  'Tubi TV':             { displayName: 'Tubi',         color: '#FF5A00', textColor: '#fff', logo: '▸' },
  'Pluto TV':            { displayName: 'Pluto TV',     color: '#FFF200', textColor: '#000', logo: '◕' },
  'Crackle':             { displayName: 'Crackle',      color: '#FF0000', textColor: '#fff', logo: '▶' },
  'Plex':                { displayName: 'Plex',         color: '#E5A00D', textColor: '#000', logo: '◧' },
  'Shudder':             { displayName: 'Shudder',      color: '#04E0BD', textColor: '#000', logo: '👁' },
  'Mubi':                { displayName: 'MUBI',         color: '#3C5A9A', textColor: '#fff', logo: '◉' },
  'Criterion Channel':   { displayName: 'Criterion',    color: '#C41E3A', textColor: '#fff', logo: '◈' },
  'Starz':               { displayName: 'Starz',        color: '#000000', textColor: '#fff', logo: '★' },
  'Showtime':            { displayName: 'Showtime',     color: '#CC0000', textColor: '#fff', logo: '◉' },
  'Vudu':                { displayName: 'Vudu',         color: '#3A6FF8', textColor: '#fff', logo: '▷' },
  'Fandango At Home':    { displayName: 'Fandango',     color: '#FF5500', textColor: '#fff', logo: '▶' },
  'YouTube':             { displayName: 'YouTube',      color: '#FF0000', textColor: '#fff', logo: '▶' },
  'YouTube Premium':     { displayName: 'YT Premium',   color: '#FF0000', textColor: '#fff', logo: '▶' },
  'Google Play Movies':  { displayName: 'Google Play',  color: '#4285F4', textColor: '#fff', logo: '▷' },
  'Microsoft Store':     { displayName: 'MS Store',     color: '#0078D4', textColor: '#fff', logo: '◆' },
};

// Generic fallback for unknown providers
const FALLBACK_META: ProviderMeta = {
  displayName: '',
  color: '#6B7280',
  textColor: '#fff',
  logo: '▶',
};

/**
 * Returns brand metadata for a provider name.
 * Tries exact match first, then partial match, then returns a generic fallback.
 */
export function getProviderMeta(name: string): ProviderMeta {
  // Exact match
  if (PROVIDER_METADATA[name]) return PROVIDER_METADATA[name];

  // Case-insensitive exact match
  const lower = name.toLowerCase();
  const exactKey = Object.keys(PROVIDER_METADATA).find(
    k => k.toLowerCase() === lower
  );
  if (exactKey) return PROVIDER_METADATA[exactKey];

  // Partial match (provider name contains known key or vice versa)
  const partialKey = Object.keys(PROVIDER_METADATA).find(
    k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  );
  if (partialKey) return PROVIDER_METADATA[partialKey];

  // Generic fallback — use the raw name as displayName
  return { ...FALLBACK_META, displayName: name };
}

// Known providers that offer free (ad-supported) tiers
const FREE_TIER_PROVIDERS = new Set([
  'tubi', 'tubi tv', 'pluto tv', 'crackle', 'plex',
  'peacock', 'peacock free', 'imdb tv', 'freevee',
  'amazon freevee', 'kanopy', 'hoopla', 'youtube',
]);

/**
 * Returns true if the source is genuinely free to watch without a subscription.
 */
export function isFreeProvider(source: WatchmodeSource): boolean {
  if (source.type === 'free') return true;
  // Some providers list free tiers as 'sub' with null price
  const nameLower = source.name.toLowerCase();
  return source.price === null && FREE_TIER_PROVIDERS.has(nameLower);
}

/**
 * Converts a movie title to a JustWatch-compatible URL slug.
 */
export function toJustWatchSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
