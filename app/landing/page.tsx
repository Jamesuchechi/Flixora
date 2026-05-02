import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { PosterStrip } from '@/components/landing/PosterStrip';
import { StatsBar } from '@/components/landing/StatsBar';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PlayerShowcase } from '@/components/landing/PlayerShowcase';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'Welcome to Flixora | Cinema Without Limits',
  description: 'Stream thousands of movies and series in 4K Ultra HD. Ad-free, high-quality streaming starting for free.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[--flx-bg]">
      <LandingNav />
      <LandingHero />
      <PosterStrip />
      <StatsBar />
      <FeaturesSection />
      <PlayerShowcase />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
