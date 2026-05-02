'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signUp, signInWithGoogle, type AuthState } from '@/lib/supabase/actions/auth';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
  redirectError?: string;
}

const initialState: AuthState = {};

export function AuthForm({ mode, redirectError }: AuthFormProps) {
  const router = useRouter();
  const action = mode === 'login' ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success && mode === 'signup') { 
       // You could trigger a toast or a specialized view here
    }
  }, [state, mode]);

  const handleGoogle = async () => {
    const result = await signInWithGoogle();
    if ('url' in result) router.push(result.url);
  };

  const inputClass = 'w-full bg-[--flx-surface-2] border border-white/5 hover:border-white/15 focus:border-[--flx-purple]/50 rounded-lg px-4 py-2.5 text-sm text-[--flx-text-1] placeholder-[--flx-text-3] outline-none transition-colors';

  return (
    <div className="bg-[--flx-surface-1] border border-white/5 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-auto">
      <h1 className="text-2xl font-semibold text-[--flx-text-1] mb-1">
        {mode === 'login' ? 'Welcome back' : 'Create account'}
      </h1>
      <p className="text-sm text-[--flx-text-3] mb-7">
        {mode === 'login' ? 'Sign in to continue watching' : 'Join Flixora and start watching'}
      </p>

      {state.success && mode === 'signup' && (
        <div className="mb-5 p-3.5 rounded-lg bg-[--flx-cyan]/10 border border-[--flx-cyan]/25 text-xs text-cyan-300">
          Check your email to confirm your address.
        </div>
      )}

      {(state.error || redirectError) && (
        <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-300">
          {state.error ?? decodeURIComponent(redirectError ?? '')}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs text-[--flx-text-2] mb-1.5 font-medium">Username</label>
            <input name="username" type="text" placeholder="flixora_user" required minLength={3} className={inputClass} />
          </div>
        )}

        <div>
          <label className="block text-xs text-[--flx-text-2] mb-1.5 font-medium">Email</label>
          <input name="email" type="email" placeholder="you@example.com" required className={inputClass} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-[--flx-text-2] font-medium">Password</label>
            {mode === 'login' && (
              <button type="button" className="text-[10px] text-[--flx-cyan] hover:opacity-70 transition-opacity">
                Forgot password?
              </button>
            )}
          </div>
          <input name="password" type="password" placeholder="........" required minLength={6} className={inputClass} />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-xs text-[--flx-text-2] mb-1.5 font-medium">Confirm Password</label>
            <input name="confirmPassword" type="password" placeholder="........" required minLength={6} className={inputClass} />
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className={cn(
            'w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-lg transition-all mt-2 cursor-pointer',
            'bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {pending ? (
            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{mode === 'login' ? 'Signing in...' : 'Creating...'}</>
          ) : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-[--flx-text-3]">or</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <button type="button" onClick={handleGoogle} className="w-full flex items-center justify-center gap-2.5 bg-white/6 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 text-sm text-[--flx-text-1] transition-all cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-xs text-[--flx-text-3] mt-6">
        {mode === 'login' ? (
          <>No account? <Link href="/signup" className="text-[--flx-cyan] hover:opacity-80">Sign up</Link></>
        ) : (
          <>Have an account? <Link href="/login" className="text-[--flx-cyan] hover:opacity-80">Sign in</Link></>
        )}
      </p>
    </div>
  );
}
