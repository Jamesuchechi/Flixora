import { LandingNav }      from './LandingNav';
import { LandingHero }     from './LandingHero';
import { PosterStrip }     from './PosterStrip';
import { StatsBar }        from './StatsBar';
import { FeaturesSection } from './FeaturesSection';
import { PlayerShowcase }  from './PlayerShowcase';
import { PricingSection }  from './PricingSection';
import { FaqSection }      from './FaqSection';
import { CtaSection }      from './CtaSection';
import { LandingFooter }   from './LandingFooter';

export function LandingPage() {
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
