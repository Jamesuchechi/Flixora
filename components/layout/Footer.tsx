import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Flixora',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Originals', href: '/originals' },
        { label: 'Press Kit', href: '/press' },
        { label: 'Careers', href: '/careers' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'DMCA Policy', href: '/dmca' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
  ];

  return (
    <footer className="hidden md:block relative z-10 bg-[--flx-bg] border-t border-white/5 pt-16 pb-8 px-10 mt-10">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[--flx-purple]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <Link 
              href="/" 
              className="mb-6 inline-block group"
            >
              <Image 
                src="/logo.png" 
                alt="Flixora" 
                width={154} 
                height={40} 
                className="h-10 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
            <p className="text-[--flx-text-3] text-sm leading-relaxed max-w-sm">
              The ultimate cinematic experience. Stream your favorite movies and series in stunning quality with our immersive aurora design.
            </p>
          </div>

          {/* Nav Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bebas text-lg tracking-widest text-[--flx-text-1] mb-6">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-[--flx-text-3] hover:text-[--flx-cyan] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <span className="text-xs text-[--flx-text-3]">
              © {currentYear} Flixora Inc.
            </span>
            <div className="hidden md:flex items-center gap-4">
               <div className="w-1 h-1 rounded-full bg-white/10" />
               <span className="text-[10px] text-[--flx-text-3] tracking-widest uppercase">Designed for Excellence</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-[--flx-text-3] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </Link>
            <Link href="#" className="text-[--flx-text-3] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </Link>
            <Link href="#" className="text-[--flx-text-3] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
