'use client';

import { useState } from 'react';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { resendVerificationEmail } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';

interface VerifyEmailProps {
  email: string;
}

export function VerifyEmail({ email }: VerifyEmailProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const result = await resendVerificationEmail(email);
      if (result.error) {
        setError(result.error);
      } else {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      }
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 bg-[--flx-purple]/20 rounded-[32px] animate-pulse" />
        <div className="relative w-16 h-16 bg-[--flx-purple] rounded-2xl flex items-center justify-center shadow-2xl shadow-[--flx-purple]/40">
          <Mail size={32} className="text-white" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-bebas text-4xl text-white tracking-wide uppercase">Check Your Inbox</h2>
        <p className="text-[15px] text-[--flx-text-3] font-light leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent a verification link to <span className="text-white font-medium">{email}</span>. Please click the link to activate your cinematic identity.
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <p className="text-[11px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">
            {error}
          </p>
        )}

        {resent && (
          <div className="flex items-center justify-center gap-2 text-[11px] text-[--flx-cyan] font-bold uppercase tracking-widest bg-[--flx-cyan]/10 py-3 rounded-xl border border-[--flx-cyan]/20">
            <CheckCircle2 size={14} />
            Fresh link sent!
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resending || resent}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[14px] font-black uppercase tracking-[2px] transition-all",
            "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {resending ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <>Resend Link <ArrowRight size={18} /></>
          )}
        </button>

        <p className="text-[11px] text-white/20 font-bold uppercase tracking-[2px]">
          Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    </div>
  );
}
