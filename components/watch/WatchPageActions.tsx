'use client';

import { useState } from 'react';
import { Share2, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface WatchPageActionsProps {
  /** Pass imdbId or any stable string for the report. If absent, report button is hidden. */
  reportId?: string;
  title: string;
}

function ShareThisButton() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ message: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ message: 'Could not copy link', type: 'error' });
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        'w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border font-black text-[10px] uppercase tracking-[2px] transition-all duration-300',
        copied
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20'
      )}
    >
      {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share This</>}
    </button>
  );
}

function ReportIssueButton({ reportId, title }: { reportId: string; title: string }) {
  const [sent, setSent] = useState(false);

  const handleReport = async () => {
    // Inline lightweight report — opens a mailto as a simple fallback if no Supabase action
    try {
      const { submitContentReport } = await import('@/lib/supabase/actions/reports');
      await submitContentReport({ videoId: reportId, title, reason: 'Watch page issue' });
      setSent(true);
    } catch {
      window.location.href = `mailto:support@flixora.app?subject=Issue: ${encodeURIComponent(title)}`;
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={sent}
      className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-white/5 bg-transparent text-white/20 hover:text-amber-400 hover:border-amber-400/20 hover:bg-amber-400/5 font-black text-[10px] uppercase tracking-[2px] transition-all duration-300 disabled:opacity-40"
    >
      <AlertTriangle size={14} />
      {sent ? 'Report Sent' : 'Report an Issue'}
    </button>
  );
}

/** Client actions panel — Share + Report — for the watch page right column. */
export function WatchPageActions({ reportId, title }: WatchPageActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <ShareThisButton />
      {reportId && <ReportIssueButton reportId={reportId} title={title} />}
    </div>
  );
}
