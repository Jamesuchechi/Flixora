import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <MobileNav />
      <Footer />
    </div>
  );
}
