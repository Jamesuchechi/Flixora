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
import { tmdb } from '@/lib/tmdb';
import { TMDBVideo } from '@/types/tmdb';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Welcome to Flixora | Cinema Without Limits',
  description: 'Stream thousands of movies and series in 4K Ultra HD. Ad-free, high-quality streaming starting for free.',
};

export default async function LandingPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If user is already logged in, redirect to the browse page
  if (user) {
    redirect('/home');
  }

  // Fetch real content for the landing page
  const trending = await tmdb.trending.movies();
  const posters = trending.results.slice(0, 15);
  const backdrops = trending.results.slice(5, 10);
  
  // Get trailer for the featured player movie (Dune: Part Two or current trending)
  const featuredMovie = trending.results[0];
  const videos = await tmdb.movies.videos(featuredMovie.id);
  const trailer = (videos.results as TMDBVideo[]).find(v => v.type === 'Trailer' && v.site === 'YouTube') || (videos.results[0] as TMDBVideo | undefined);

  return (
    <div className="min-h-screen bg-[--flx-bg] selection:bg-[--flx-purple]/30 text-white">
      <LandingNav />
      <LandingHero backdrops={backdrops} />
      <PosterStrip movies={posters} />
      <StatsBar />
      <FeaturesSection />
      <PlayerShowcase movie={featuredMovie} trailerKey={trailer?.key} nextMovies={trending.results.slice(1, 4)} />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
