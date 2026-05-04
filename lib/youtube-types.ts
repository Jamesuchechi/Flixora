export interface YouTubeCandidateVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  /** Duration in seconds */
  duration: number;
  isEmbeddable: boolean;
  viewCount: number;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface TMDBMatch {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  /** 0–100 */
  confidence: number;
}

export interface PipelineItem {
  videoId: string;
  videoTitle: string;
  tmdbId: number | null;
  tmdbTitle: string | null;
  confidence: number;
  action: 'added' | 'skipped' | 'failed' | 'no_match';
  reason: string;
}

export interface PipelineResult {
  processed: number;
  matched: number;
  added: number;
  skipped: number;
  failed: number;
  results: PipelineItem[];
}

export const VERIFIED_FREE_CHANNELS: { channelId: string; name: string; category: string }[] = [
  { channelId: 'UCrExDjSldHLsGbH22rD_4sA', name: 'Paramount Movies',   category: 'studio'      },
  { channelId: 'UCBcRF18a7Qf58cCRy5xuWwQ', name: 'MyMovies',           category: 'curated'     },
  { channelId: 'UC6107grRI4m0o2-emgoDnAA', name: 'Maverick Movies',    category: 'curated'     },
  { channelId: 'UCiVoupOGf60g5NKQO2lFNWw', name: 'FilmRise',           category: 'distributor' },
  { channelId: 'UCz8QFGdHHFGKPcbhRyAnMqg', name: 'Popcornflix',        category: 'distributor' },
  { channelId: 'UCXlH_8RohnBSGRSR5UtpCyg', name: 'Midnight Pulp',      category: 'distributor' },
  { channelId: 'UCWX3yGbODI3HLCBTSBzPLOA', name: 'The Film Detective', category: 'distributor' },
  { channelId: 'UC0SsKCJtXNIMX3pVRqImkYg', name: 'MGM',                category: 'studio'      },
  { channelId: 'UCpRDqBqSHPFn1OyJIRgNEbg', name: 'Sony Pictures',      category: 'studio'      },
  { channelId: 'UCFPNqCsjFRUcbKVMUqJSvxw', name: 'Shout Factory',      category: 'distributor' },
];
