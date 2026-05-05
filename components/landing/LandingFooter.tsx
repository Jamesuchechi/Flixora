import Link from 'next/link';
import Image from 'next/image';

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Changelog', href: '/press' },
      { label: 'Roadmap', href: '/help' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/press' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/privacy' },
      { label: 'DMCA', href: '/dmca' },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/6">
      {/* Main */}
      <div className="px-12 py-12 flex flex-col md:flex-row gap-10 justify-between">
        {/* Brand */}
        <div className="max-w-[260px]">
          <div className="mb-4">
            <Image 
              src="/logo.png" 
              alt="Flixora" 
              width={110} 
              height={29} 
              className="h-7 w-auto opacity-80" 
            />
          </div>
          <p className="text-[13px] text-[--flx-text-3] leading-relaxed">
            Cinema without limits. Stream what you love, in stunning quality, ad-free.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-10 md:gap-16">
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-[11px] tracking-[2px] uppercase text-[--flx-text-3] mb-3 font-medium">{heading}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13px] text-[--flx-text-2] hover:text-[--flx-text-1] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/6 px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[--flx-text-3]">
        <span>© {new Date().getFullYear()} Flixora. All rights reserved.</span>
        <span>Made with ❤️ for cinema lovers</span>
      </div>
    </footer>
  );
}
