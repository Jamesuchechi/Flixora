'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { VERIFIED_FREE_CHANNELS, type PipelineResult, type PipelineItem } from '@/lib/youtube-pipeline';
import { runPipelineAction } from '@/lib/supabase/actions/pipeline-action';
import {
  Play, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2,
  ToggleLeft, ToggleRight, ChevronRight, RefreshCw, Film, Zap,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Helpers ────────────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    studio:      'bg-[--flx-purple]/20 text-[--flx-purple] border-[--flx-purple]/30',
    distributor: 'bg-[--flx-cyan]/10 text-[--flx-cyan] border-[--flx-cyan]/20',
    curated:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border',
      colors[category] ?? 'bg-white/5 text-white/40 border-white/10'
    )}>
      {category}
    </span>
  );
}

function StatCard({ label, value, sub, icon }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-[160px] bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[--flx-cyan]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[2px] text-white/40">{label}</p>
        <p className="text-3xl font-bebas text-white tracking-wide mt-0.5">{value}</p>
        {sub && <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: PipelineItem['action'] }) {
  const map = {
    added:    { label: 'Added',    cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    skipped:  { label: 'Skipped',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    failed:   { label: 'Failed',   cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    no_match: { label: 'No Match', cls: 'bg-white/5 text-white/30 border-white/10' },
  };
  const { label, cls } = map[action] ?? map.no_match;
  return (
    <span className={cn('px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border', cls)}>
      {label}
    </span>
  );
}

function rowHighlight(action: PipelineItem['action']) {
  if (action === 'added')    return 'border-l-2 border-l-emerald-500/60 bg-emerald-500/5';
  if (action === 'skipped')  return 'border-l-2 border-l-amber-500/40 bg-amber-500/5';
  if (action === 'failed')   return 'border-l-2 border-l-red-500/40 bg-red-500/5';
  return 'border-l-2 border-l-white/5';
}

function ConfidencePill({ value }: { value: number }) {
  const color = value >= 80 ? 'text-emerald-400' : value >= 60 ? 'text-amber-400' : 'text-red-400';
  return <span className={cn('font-black text-sm tabular-nums', color)}>{value}%</span>;
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    VERIFIED_FREE_CHANNELS.map(c => c.channelId)
  );
  const [dryRun, setDryRun] = useState(true);
  const [maxPerChannel, setMaxPerChannel] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [totalFreeFilms, setTotalFreeFilms] = useState<number>(0);
  const [filmsAddedThisWeek, setFilmsAddedThisWeek] = useState<number>(0);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [quotaUsed, setQuotaUsed] = useState<number | null>(null);

  // ── Load stats ────────────────────────────────────────────────────────────
  async function loadStats() {
    const supabase = createClient();

    const { count: total } = await supabase
      .from('free_films')
      .select('*', { count: 'exact', head: true });
    setTotalFreeFilms(total ?? 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekly } = await supabase
      .from('free_films')
      .select('*', { count: 'exact', head: true })
      .gte('verified_at', weekAgo.toISOString());
    setFilmsAddedThisWeek(weekly ?? 0);

    // YouTube quota today
    const today = new Date().toISOString().split('T')[0];
    const { data: quotaRow } = await supabase
      .from('youtube_quota')
      .select('units_used')
      .eq('date', today)
      .maybeSingle();
    setQuotaUsed(quotaRow?.units_used ?? 0);

    // Last run from localStorage
    const stored = typeof window !== 'undefined' ? localStorage.getItem('pipeline_last_run') : null;
    setLastRun(stored);
  }

  // Load stats on mount — inner async function avoids the "setState in effect" lint warning
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!cancelled) await loadStats();
    }
    run();
    return () => { cancelled = true; };

  }, []);

  // ── Channel selection ──────────────────────────────────────────────────────
  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
  };
  const selectAll = () => setSelectedChannels(VERIFIED_FREE_CHANNELS.map(c => c.channelId));
  const deselectAll = () => setSelectedChannels([]);

  // ── Run pipeline ───────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (selectedChannels.length === 0 || isRunning) return;
    setIsRunning(true);
    setError(null);
    setPipelineResult(null);

    try {
      const result = await runPipelineAction({
        channelIds: selectedChannels,
        dryRun,
        maxPerChannel,
      });

      if (!result.ok) throw new Error(result.error);

      setPipelineResult(result.data);

      const now = new Date().toLocaleString();
      localStorage.setItem('pipeline_last_run', now);
      setLastRun(now);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  // ── Summary counts ─────────────────────────────────────────────────────────
  const summary = pipelineResult ? {
    added:    pipelineResult.results.filter(r => r.action === 'added').length,
    skipped:  pipelineResult.results.filter(r => r.action === 'skipped').length,
    noMatch:  pipelineResult.results.filter(r => r.action === 'no_match').length,
    failed:   pipelineResult.results.filter(r => r.action === 'failed').length,
  } : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[--flx-bg] pt-28 pb-24 px-6">

      {/* Atmospheric orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[--flx-purple]/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-[--flx-cyan]/8 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center shadow-lg shadow-[--flx-purple]/20">
                <Zap size={20} className="text-white" />
              </div>
              <h1 className="text-4xl font-bebas tracking-tight text-white uppercase">Discovery Pipeline</h1>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/30">
              Automated YouTube film discovery for the free library
            </p>
          </div>
          <span className="self-start sm:self-auto px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-[3px] text-red-400">
            Admin Only
          </span>
        </div>

        {/* ── Stats row ── */}
        <div className="flex flex-wrap gap-4">
          <StatCard
            label="Total Free Films"
            value={totalFreeFilms}
            sub="In library"
            icon={<Film size={18} />}
          />
          <StatCard
            label="Last Run"
            value={lastRun ? lastRun.split(',')[0] : '—'}
            sub={lastRun ? lastRun.split(',')[1]?.trim() : 'Never'}
            icon={<Clock size={18} />}
          />
          <StatCard
            label="Quota Used Today"
            value={quotaUsed !== null ? `${quotaUsed.toLocaleString()} u` : '—'}
            sub="of 10,000 daily"
            icon={<Zap size={18} />}
          />
          <StatCard
            label="Added This Week"
            value={filmsAddedThisWeek}
            sub="7-day window"
            icon={<CheckCircle2 size={18} />}
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── Left column: channels + options + run ── */}
          <div className="space-y-6">

            {/* Channel selector */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[3px] text-white">Verified Channels</h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {VERIFIED_FREE_CHANNELS.map(ch => {
                  const checked = selectedChannels.includes(ch.channelId);
                  return (
                    <label
                      key={ch.channelId}
                      className={cn(
                        'flex items-center gap-4 px-4 py-3 rounded-2xl border cursor-pointer transition-all select-none',
                        checked
                          ? 'bg-[--flx-cyan]/5 border-[--flx-cyan]/20'
                          : 'bg-white/3 border-white/5 hover:bg-white/5'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                        checked ? 'bg-[--flx-cyan] border-[--flx-cyan]' : 'border-white/20'
                      )}>
                        {checked && <CheckCircle2 size={12} className="text-black" />}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleChannel(ch.channelId)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{ch.name}</p>
                        <p className="text-[9px] text-white/30 font-mono truncate">{ch.channelId}</p>
                      </div>
                      <CategoryBadge category={ch.category} />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-5">
              <h2 className="text-sm font-black uppercase tracking-[3px] text-white">Options</h2>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Dry Run</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Preview matches without saving to library</p>
                </div>
                <button
                  onClick={() => setDryRun(prev => !prev)}
                  className="flex items-center gap-2 transition-all"
                  title={dryRun ? 'Dry Run ON — click to disable' : 'Dry Run OFF — click to enable'}
                >
                  {dryRun
                    ? <ToggleRight size={36} className="text-[--flx-cyan]" />
                    : <ToggleLeft size={36} className="text-white/30" />
                  }
                </button>
              </div>

              {dryRun && (
                <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider leading-relaxed">
                    Dry run is ON — results will be previewed but not saved to the database.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40">
                  Max videos per channel (1 – 50)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxPerChannel}
                  onChange={e => setMaxPerChannel(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[--flx-cyan] transition-all"
                />
                <p className="text-[9px] text-white/25 uppercase tracking-wider">
                  ~{(maxPerChannel * VERIFIED_FREE_CHANNELS.length * 101).toLocaleString()} est. quota units for all channels
                </p>
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={selectedChannels.length === 0 || isRunning}
              className={cn(
                'w-full py-5 rounded-2xl font-black text-[13px] uppercase tracking-[3px] flex items-center justify-center gap-3 transition-all shadow-lg',
                selectedChannels.length === 0 || isRunning
                  ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                  : 'bg-linear-to-r from-[--flx-purple] to-[--flx-cyan] text-black hover:scale-[1.01] active:scale-[0.99] shadow-[--flx-purple]/30'
              )}
            >
              {isRunning ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Running… (this takes 30–60 seconds)
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  Run Discovery Pipeline
                  {dryRun && <span className="text-[9px] opacity-60 font-bold">(DRY RUN)</span>}
                </>
              )}
            </button>

            {error && (
              <div className="flex items-start gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-red-400 font-bold">{error}</p>
              </div>
            )}
          </div>

          {/* ── Right column: manual curation link + tip ── */}
          <div className="space-y-5 sticky top-28">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-[3px] text-white">Manual Curation</h2>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Add a specific film by TMDB ID and YouTube video ID with full metadata auto-fetch.
              </p>
              <Link
                href="/admin/free-films"
                className="flex items-center justify-between w-full px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
              >
                <span className="text-[11px] font-black uppercase tracking-[2px] text-white">
                  Manual Curation Studio
                </span>
                <ChevronRight size={16} className="text-white/40 group-hover:text-[--flx-cyan] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[3px] text-white/40">Pipeline Notes</h2>
              <ul className="space-y-2 text-[10px] text-white/30 leading-relaxed">
                <li>• Each channel search costs ~100 YouTube quota units.</li>
                <li>• Pipeline stops automatically before hitting 8,000 units/day.</li>
                <li>• Minimum match confidence: 60%. Year ± 1 year adds 30 pts.</li>
                <li>• Only videos longer than 50 minutes are considered.</li>
                <li>• Videos must be embeddable and publicly available.</li>
                <li>• Always use Dry Run first to preview before committing.</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
              <button onClick={loadStats} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-white/40 hover:text-[--flx-cyan] transition-colors">
                <RefreshCw size={12} /> Refresh Stats
              </button>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        {pipelineResult && summary && (
          <div className="space-y-5">

            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-4 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-[2px] text-white/40 mr-2">
                Pipeline Result
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 size={14} /> {summary.added} added
              </span>
              <span className="text-white/10">•</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                <Clock size={14} /> {summary.skipped} skipped
              </span>
              <span className="text-white/10">•</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/30">
                <XCircle size={14} /> {summary.noMatch} no match
              </span>
              {summary.failed > 0 && (
                <>
                  <span className="text-white/10">•</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                    <AlertTriangle size={14} /> {summary.failed} failed
                  </span>
                </>
              )}
              <span className="ml-auto text-[10px] font-bold text-white/20 uppercase tracking-widest">
                {pipelineResult.processed} processed
              </span>
              {dryRun && (
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-amber-400">
                  Dry Run
                </span>
              )}
            </div>

            {/* Results table */}
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_80px_90px] gap-4 px-6 py-3 border-b border-white/5 text-[9px] font-black uppercase tracking-[2px] text-white/30">
                <span>Video Title</span>
                <span>Matched To</span>
                <span className="text-center">Confidence</span>
                <span className="text-center">Action</span>
              </div>

              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {pipelineResult.results.map((item, i) => (
                  <div
                    key={`${item.videoId}-${i}`}
                    className={cn(
                      'grid grid-cols-[1fr_1fr_80px_90px] gap-4 px-6 py-4 items-center transition-colors hover:bg-white/3',
                      rowHighlight(item.action)
                    )}
                  >
                    {/* Video title */}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate" title={item.videoTitle}>
                        {item.videoTitle}
                      </p>
                      <a
                        href={`https://youtube.com/watch?v=${item.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] text-[--flx-cyan]/50 hover:text-[--flx-cyan] transition-colors mt-0.5 w-fit"
                      >
                        <ExternalLink size={9} /> {item.videoId}
                      </a>
                    </div>

                    {/* TMDB match */}
                    <div className="min-w-0">
                      {item.tmdbTitle ? (
                        <>
                          <p className="text-[11px] font-bold text-white/80 truncate">{item.tmdbTitle}</p>
                          <p className="text-[9px] text-white/30 mt-0.5">TMDB #{item.tmdbId}</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-white/20 italic">{item.reason}</p>
                      )}
                    </div>

                    {/* Confidence */}
                    <div className="flex justify-center">
                      {item.confidence > 0
                        ? <ConfidencePill value={item.confidence} />
                        : <span className="text-white/15 text-sm font-bold">—</span>
                      }
                    </div>

                    {/* Action badge */}
                    <div className="flex justify-center">
                      <ActionBadge action={item.action} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
