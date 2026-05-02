import Link from 'next/link';

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  {
    heading: 'Legal',
    links: ['Privacy', 'Terms', 'Cookies', 'DMCA'],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/6">
      {/* Main */}
      <div className="px-12 py-12 flex flex-col md:flex-row gap-10 justify-between">
        {/* Brand */}
        <div className="max-w-[260px]">
          <div className="font-['Bebas_Neue',sans-serif] text-[22px] tracking-[3px] bg-gradient-to-r from-[--flx-purple] via-[--flx-cyan] to-[--flx-pink] bg-clip-text text-transparent mb-3">
            FLIXORA
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
                  <li key={link}>
                    <Link href="#" className="text-[13px] text-[--flx-text-2] hover:text-[--flx-text-1] transition-colors">
                      {link}
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
