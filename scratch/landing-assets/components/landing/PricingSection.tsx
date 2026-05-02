import Link from 'next/link';
import { cn } from '@/lib/utils';

const CHECK = (
  <span className="w-[15px] h-[15px] rounded-full bg-[--flx-cyan]/15 flex items-center justify-center flex-shrink-0">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

const PLANS = [
  {
    name:     'Free',
    price:    '$0',
    period:   'Forever free',
    featured: false,
    badge:    null,
    features: [
      { text: 'Browse all titles',       active: true  },
      { text: 'HD quality streaming',    active: true  },
      { text: 'Watchlist (up to 20)',    active: true  },
      { text: '4K Ultra HD',             active: false },
      { text: 'Offline downloads',       active: false },
    ],
    cta:  'Get Started',
    href: '/signup',
  },
  {
    name:     'Pro',
    price:    '$9',
    period:   'per month',
    featured: true,
    badge:    'Most Popular',
    features: [
      { text: 'Everything in Free',       active: true },
      { text: '4K Ultra HD streaming',    active: true },
      { text: 'Unlimited watchlist',      active: true },
      { text: 'Offline downloads',        active: true },
      { text: '2 screens simultaneously', active: true },
    ],
    cta:  'Start Free Trial',
    href: '/signup?plan=pro',
  },
  {
    name:     'Family',
    price:    '$16',
    period:   'per month · 6 profiles',
    featured: false,
    badge:    null,
    features: [
      { text: 'Everything in Pro',        active: true },
      { text: '6 user profiles',          active: true },
      { text: '4 screens simultaneously', active: true },
      { text: 'Parental controls',        active: true },
      { text: 'Priority support',         active: true },
    ],
    cta:  'Get Started',
    href: '/signup?plan=family',
  },
];

export function PricingSection() {
  return (
    <section
      className="px-12 py-20"
      id="pricing"
      style={{ background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.04), transparent)' }}
    >
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[2.5px] uppercase text-[--flx-purple] font-semibold mb-3">Pricing</p>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(36px,5vw,56px)] tracking-[1.5px] mb-4">
          Simple, Honest Plans
        </h2>
        <p className="text-[15px] text-[--flx-text-2] font-light">
          No hidden fees. Cancel anytime. Start free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'relative rounded-2xl p-7 border transition-all duration-200',
              plan.featured
                ? 'border-[--flx-purple]/40 bg-gradient-to-b from-[--flx-purple]/8 to-[--flx-surface-1]'
                : 'border-white/7 bg-[--flx-surface-1] hover:-translate-y-1'
            )}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[--flx-purple] text-white text-[10px] font-semibold tracking-[1.5px] uppercase px-4 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div className="text-[12px] tracking-[2px] uppercase text-[--flx-text-3] mb-2">{plan.name}</div>
            <div className="font-['Bebas_Neue',sans-serif] text-[52px] leading-none tracking-wide mb-1">{plan.price}<span className="font-['Outfit',sans-serif] text-[16px] font-normal text-[--flx-text-2]">/mo</span></div>
            <div className="text-[12px] text-[--flx-text-3] mb-6">{plan.period}</div>

            <ul className="space-y-3 mb-7">
              {plan.features.map(({ text, active }) => (
                <li key={text} className={cn('flex items-center gap-2.5 text-[13px]', active ? 'text-[--flx-text-2]' : 'text-[--flx-text-3]/40')}>
                  {active ? CHECK : <span className="w-[15px] h-[15px] flex-shrink-0" />}
                  {text}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={cn(
                'block w-full text-center py-2.5 rounded-lg text-[13px] font-semibold transition-all',
                plan.featured
                  ? 'bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white hover:-translate-y-px'
                  : 'border border-white/15 text-[--flx-text-1] hover:bg-white/8'
              )}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
