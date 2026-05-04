'use server';

import { runDiscoveryPipeline, type PipelineResult } from '@/lib/youtube-pipeline';

/**
 * Server Action that proxies the pipeline run.
 * The ADMIN_SECRET stays on the server — never exposed to the browser bundle.
 * The pipeline page calls this directly instead of hitting /api/admin/pipeline.
 */
export async function runPipelineAction(options: {
  channelIds?: string[];
  dryRun?: boolean;
  maxPerChannel?: number;
}): Promise<{ ok: true; data: PipelineResult } | { ok: false; error: string }> {
  try {
    const data = await runDiscoveryPipeline(options);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Pipeline failed' };
  }
}
