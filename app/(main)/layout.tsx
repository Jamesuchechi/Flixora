import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchOverlay } from '@/components/search/SearchOverlay';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <SearchOverlay />
      <main>{children}</main>
      <Footer />
    </>
  );
}
