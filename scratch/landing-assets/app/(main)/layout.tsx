import { Navbar } from '@/components/layout/Navbar';
import { SearchOverlay } from '@/components/search/SearchOverlay';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <SearchOverlay />
      <main>{children}</main>
    </>
  );
}
