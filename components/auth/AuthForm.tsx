'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, signUp, type AuthState } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';
import { Mail, Lock, User } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  redirectError?: string;
}

const initialState: AuthState = {};

export function AuthForm({ mode, redirectError }: AuthFormProps) {
  const action = mode === 'login' ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success && mode === 'signup') {
      // Success logic
    }
  }, [state, mode]);

  const handleGoogle = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) {
      console.error('Google Sign-in failed:', error.message);
    }
  };

  const inputWrapper = "relative group";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-[--flx-text-3] group-focus-within:text-[--flx-purple] transition-colors";
  const inputClass = 'w-full bg-white/2 border border-white/10 hover:border-white/20 focus:border-[--flx-purple]/50 focus:bg-white/5 rounded-2xl pl-12 pr-4 py-4 text-[15px] text-white placeholder-white/20 outline-none transition-all font-light';

  return (
    <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl backdrop-blur-xl w-full">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="font-bebas text-[42px] leading-none tracking-[1px] mb-3 text-white">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-[15px] text-[--flx-text-3] font-light">
          {mode === 'login' ? 'Sign in to continue your journey.' : 'Join the elite community of movie lovers.'}
        </p>
      </div>

      {state.success && mode === 'signup' && (
        <div className="mb-8 p-4 rounded-2xl bg-[--flx-cyan]/10 border border-[--flx-cyan]/20 text-[13px] text-cyan-300 animate-fade-in text-center">
          Success! Check your email to confirm your account.
        </div>
      )}

      {(state.error || redirectError) && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-300 animate-shake text-center">
          {state.error ?? decodeURIComponent(redirectError ?? '')}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {mode === 'signup' && (
          <div className={inputWrapper}>
            <User size={18} className={iconClass} />
            <input 
              name="username" 
              type="text" 
              placeholder="Username" 
              required 
              minLength={3} 
              className={inputClass} 
            />
          </div>
        )}

        <div className={inputWrapper}>
          <Mail size={18} className={iconClass} />
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address" 
            required 
            className={inputClass} 
          />
        </div>

        <div className={inputWrapper}>
          <Lock size={18} className={iconClass} />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            minLength={6} 
            className={inputClass} 
          />
          {mode === 'login' && (
            <button 
              type="button" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[--flx-cyan] hover:opacity-70 transition-opacity font-medium"
            >
              Forgot?
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className={cn(
            'w-full flex items-center justify-center gap-3 font-bold text-[15px] py-4 rounded-2xl transition-all mt-4 cursor-pointer',
            'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5',
            'disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]'
          )}
        >
          {pending ? (
            <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> {mode === 'login' ? 'Authenticating...' : 'Processing...'}</>
          ) : mode === 'login' ? 'Sign In' : 'Create Free Account'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[11px] uppercase tracking-[2px] text-white/20 font-bold">Or continue with</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button 
          type="button" 
          onClick={handleGoogle} 
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl py-4 text-[14px] text-white transition-all cursor-pointer group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google Account</span>
        </button>
      </div>

      <p className="text-center text-[14px] text-[--flx-text-3] mt-10 font-light">
        {mode === 'login' ? (
          <>Don&apos;t have an account? <Link href="/signup" className="text-white font-semibold hover:underline decoration-[--flx-purple] underline-offset-4">Sign up for free</Link></>
        ) : (
          <>Already a member? <Link href="/login" className="text-white font-semibold hover:underline decoration-[--flx-purple] underline-offset-4">Sign in here</Link></>
        )}
      </p>
    </div>
  );
}
