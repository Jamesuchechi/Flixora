export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[--flx-bg]">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-bebas text-4xl tracking-[5px] bg-gradient-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] bg-clip-text text-transparent">
            FLIXORA
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
