import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-['Bebas_Neue',sans-serif] text-[120px] leading-none tracking-widest bg-gradient-to-r from-[--flx-purple] to-[--flx-cyan] bg-clip-text text-transparent mb-4">
        404
      </h1>
      <p className="text-[--flx-text-2] text-sm mb-8">This page doesn't exist or the content was removed.</p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all"
      >
        ← Back to Flixora
      </Link>
    </div>
  );
}
