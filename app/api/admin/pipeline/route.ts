import { NextRequest, NextResponse } from 'next/server';
import { runDiscoveryPipeline } from '@/lib/youtube-pipeline';

export async function POST(req: NextRequest) {
  // ── Admin Guard ──────────────────────────────────────────────────────────────
  const adminSecret = req.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret || adminSecret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid or missing x-admin-secret header.' },
      { status: 401 }
    );
  }

  // ── Parse Body ───────────────────────────────────────────────────────────────
  let channelIds: string[] | undefined;
  let dryRun = true;
  let maxPerChannel = 25;

  try {
    const body = await req.json();
    channelIds = Array.isArray(body.channelIds) ? body.channelIds : undefined;
    dryRun = body.dryRun !== false; // default to true (safe)
    maxPerChannel = typeof body.maxPerChannel === 'number'
      ? Math.min(Math.max(body.maxPerChannel, 1), 50)
      : 25;
  } catch {
    // If body parsing fails, use defaults (dryRun=true, all channels)
  }

  // ── Run Pipeline ─────────────────────────────────────────────────────────────
  try {
    const result = await runDiscoveryPipeline({ channelIds, dryRun, maxPerChannel });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[API/pipeline] Pipeline error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Pipeline failed unexpectedly' },
      { status: 500 }
    );
  }
}
