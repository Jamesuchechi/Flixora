'use client';

import { useState } from 'react';
import { Mail, RefreshCw, CheckCircle2, ChevronLeft, KeyRound } from 'lucide-react';
import { resetPassword } from '@/lib/actions/auth';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    } catch {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-[--flx-cyan]/20 rounded-[32px] animate-pulse" />
          <div className="relative w-16 h-16 bg-[--flx-cyan] rounded-2xl flex items-center justify-center shadow-2xl shadow-[--flx-cyan]/40">
            <CheckCircle2 size={32} className="text-black" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-bebas text-4xl text-white tracking-wide uppercase">Link Dispatched</h2>
          <p className="text-[15px] text-[--flx-text-3] font-light leading-relaxed max-w-sm mx-auto">
            If an account exists for <span className="text-white font-medium">{email}</span>, you&apos;ll receive a recovery link shortly.
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[14px] font-black uppercase tracking-[2px] bg-white text-black hover:bg-white/90 transition-all"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[11px] font-black text-white/40 uppercase tracking-[2px] hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Login
      </button>

      <div className="mb-10 text-center lg:text-left">
        <h1 className="font-bebas text-[42px] leading-none tracking-[1px] mb-3 text-white">
          Identity Recovery
        </h1>
        <p className="text-[15px] text-[--flx-text-3] font-light">
          Lost your credentials? Enter your email to receive a secure recovery link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[--flx-text-3] group-focus-within:text-[--flx-cyan] transition-colors" />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="w-full bg-white/2 border border-white/10 hover:border-white/20 focus:border-[--flx-cyan]/50 focus:bg-white/5 rounded-2xl pl-12 pr-4 py-4 text-[15px] text-white placeholder-white/20 outline-none transition-all font-light" 
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 font-bold text-[15px] py-4 rounded-2xl bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5 disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <>Request Recovery <KeyRound size={18} /></>
          )}
        </button>
      </form>
    </div>
  );
}
