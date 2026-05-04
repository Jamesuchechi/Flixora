import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { PosterStrip } from '@/components/landing/PosterStrip';
import { StatsBar } from '@/components/landing/StatsBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PlayerShowcase } from '@/components/landing/PlayerShowcase';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { tmdb } from '@/lib/tmdb';

export const metadata = {
  title: 'Welcome to Flixora | Cinema Without Limits',
  description: 'Stream thousands of movies and series in 4K Ultra HD. Ad-free, high-quality streaming starting for free.',
};

export default async function LandingPage() {
  const trending = await tmdb.trending.movies('week');
  const backdrops = trending.results.slice(0, 5);

  return (
    <div className="min-h-screen bg-[--flx-bg]">
      <LandingNav />
      <LandingHero backdrops={backdrops} />
      <PosterStrip />
      <StatsBar />
      <HowItWorks />
      <FeaturesSection />
      <PlayerShowcase />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
