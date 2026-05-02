import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="bg-[--flx-surface-1] border border-[--flx-border-p] rounded-2xl p-8 shadow-2xl">
      <h1 className="text-2xl font-semibold text-[--flx-text-1] mb-1">Welcome back</h1>
      <p className="text-sm text-[--flx-text-3] mb-7">Sign in to continue watching</p>

      <form className="space-y-4">
        <div>
          <label className="block text-xs text-[--flx-text-2] mb-1.5 font-medium">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-[--flx-surface-2] border border-[--flx-border] rounded-lg px-4 py-2.5 text-sm text-[--flx-text-1] placeholder-[--flx-text-3] outline-none focus:border-[--flx-purple]/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[--flx-text-2] mb-1.5 font-medium">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-[--flx-surface-2] border border-[--flx-border] rounded-lg px-4 py-2.5 text-sm text-[--flx-text-1] placeholder-[--flx-text-3] outline-none focus:border-[--flx-purple]/50 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-semibold text-sm py-3 rounded-lg transition-all mt-2 cursor-pointer"
        >
          Sign In
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[--flx-border]" />
        <span className="text-xs text-[--flx-text-3]">or</span>
        <div className="flex-1 h-px bg-[--flx-border]" />
      </div>

      <button className="w-full flex items-center justify-center gap-2.5 bg-white/6 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 text-sm text-[--flx-text-1] transition-all cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-xs text-[--flx-text-3] mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[--flx-cyan] hover:opacity-80">Sign up</Link>
      </p>
    </div>
  );
}
