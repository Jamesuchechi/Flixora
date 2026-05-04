'use client';

import { useActionState } from 'react';
import { updatePassword, type AuthState } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';
import { Lock, ShieldCheck, RefreshCw } from 'lucide-react';

const initialState: AuthState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="min-h-screen bg-[--flx-bg] flex items-center justify-center p-6">
      <div className="max-w-[480px] w-full">
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[--flx-purple]/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 space-y-10">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={32} className="text-[--flx-cyan]" />
              </div>
              <h1 className="font-bebas text-5xl text-white tracking-wide uppercase">New Credentials</h1>
              <p className="text-[15px] text-[--flx-text-3] font-light">
                Secure your cinematic identity with a strong new password.
              </p>
            </div>

            {state.error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-300 animate-shake text-center">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[--flx-text-3] group-focus-within:text-[--flx-cyan] transition-colors" />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="New Password" 
                  required 
                  minLength={6} 
                  className="w-full bg-white/2 border border-white/10 hover:border-white/20 focus:border-[--flx-cyan]/50 focus:bg-white/5 rounded-2xl pl-12 pr-4 py-4 text-[15px] text-white placeholder-white/20 outline-none transition-all font-light" 
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className={cn(
                  "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[15px] uppercase tracking-[2px] transition-all",
                  "bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {pending ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  "Update & Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-[11px] text-white/20 font-bold uppercase tracking-[2px]">
              Security Protocol • Flixora Identity Protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
