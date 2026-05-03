import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import dynamic from 'next/dynamic';

const SearchOverlay = dynamic(() => import('@/components/search/SearchOverlay').then(mod => mod.SearchOverlay), {
  ssr: false,
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Navbar />
      <SearchOverlay />
      <main className="flex-1">{children}</main>
      <MobileNav />
      <Footer />
    </div>
  );
}
