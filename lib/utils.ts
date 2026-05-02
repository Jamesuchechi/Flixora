import { type ClassValue, clsx } from 'clsx';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format minutes → "2h 46m" */
export function formatRuntime(minutes: number | undefined): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Format large numbers → "1.2M" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Truncate string to maxLength with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/** Get year from a TMDB date string "YYYY-MM-DD" */
export function getYear(date: string | undefined): string {
  return date?.split('-')[0] ?? 'N/A';
}

/** Get TMDB title regardless of media type */
export function getTitle(item: { title?: string; name?: string }): string {
  return item.title ?? item.name ?? 'Unknown';
}

/** Get TMDB release date regardless of media type */
export function getReleaseDate(item: { release_date?: string; first_air_date?: string }): string {
  return item.release_date ?? item.first_air_date ?? '';
}

/** Format a progress percentage to a display string */
export function formatProgress(progress: number): string {
  if (progress <= 0)  return 'Not started';
  if (progress >= 90) return 'Almost done';
  return `${Math.round(progress)}% watched`;
}

/** Debounce a function */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
