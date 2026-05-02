import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[--flx-bg] relative flex items-center justify-center p-6 overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://image.tmdb.org/t/p/original/xOMo8NETsFCUvnaD6vBbsSafeU0.jpg"
          alt="Auth Background"
          fill
          className="object-cover opacity-20 brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-[--flx-bg]/40 via-[--flx-bg]/80 to-[--flx-bg]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
      </div>

      {/* Aurora Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-24 -left-24 rounded-full bg-[--flx-purple]/10 blur-[120px] animate-aurora" />
        <div className="absolute w-[500px] h-[500px] -bottom-24 -right-24 rounded-full bg-[--flx-cyan]/5 blur-[120px] animate-aurora" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[440px] animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image 
            src="/logo.png" 
            alt="Flixora" 
            width={154} 
            height={40} 
            className="h-10 w-auto brightness-110 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}
