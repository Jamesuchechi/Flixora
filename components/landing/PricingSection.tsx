import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Cinema for everyone. Start watching in seconds.',
    features: ['Access to all free titles', 'Standard HD streaming', 'Watchlist sync', 'Ad-supported'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$9',
    desc: 'The complete cinematic experience. Ad-free.',
    features: ['Everything in Free', '4K Ultra HD + HDR', 'Unlimited Watchlist', 'Offline downloads', 'Zero ads, ever'],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Family',
    price: '$16',
    desc: 'Sharing is caring. For the whole household.',
    features: ['Everything in Pro', '6 user profiles', '4 screens simultaneously', 'Parental controls', 'Priority support'],
    cta: 'Get Family',
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section className="px-12 py-32" id="pricing">
      <div className="text-center mb-20">
        <p className="text-[10px] tracking-[4px] uppercase text-[--flx-purple] font-bold mb-4">PRICING</p>
        <h2 className="font-bebas text-[clamp(44px,7vw,72px)] tracking-[1px] mb-6">Simple, Honest Plans</h2>
        <p className="text-[16px] text-[--flx-text-2] font-light">No hidden fees. Cancel anytime. Start free.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-10 rounded-[32px] border transition-all duration-500 flex flex-col ${
              plan.featured
                ? 'bg-white/4 border-[--flx-purple]/50 shadow-[0_20px_50px_rgba(139,92,246,0.15)] scale-105 z-10'
                : 'bg-white/2 border-white/5 hover:border-white/10'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-[--flx-purple] to-[--flx-cyan] rounded-full text-[10px] font-bold tracking-[1px] uppercase text-white">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-[14px] font-bold tracking-[2px] uppercase text-[--flx-text-3] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-[48px] font-bebas tracking-tight text-white">{plan.price}</span>
                <span className="text-[14px] text-[--flx-text-3]">/mo</span>
              </div>
              <p className="text-[13px] text-[--flx-text-2] mt-4 font-light leading-relaxed">{plan.desc}</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-[13px] text-[--flx-text-2]">
                  <Check size={16} className="text-[--flx-purple] shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-4 rounded-2xl text-[14px] font-bold transition-all cursor-pointer border-none ${
                plan.featured
                  ? 'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
