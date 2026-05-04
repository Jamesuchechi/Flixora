import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#06070d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
import { Outfit, Bebas_Neue } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Flixora', template: '%s | Flixora' },
  description: 'Stream movies and series in stunning cinematic quality.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flixora',
  },
  formatDetection: {
    telephone: false,
  },
};

import { PWARegistration } from '@/components/layout/PWARegistration';
import { PageWipe } from '@/components/transitions/PageWipe';
import { BackGesture } from '@/components/transitions/BackGesture';
import { ConnectionToast } from '@/components/shared/ConnectionToast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bebasNeue.variable}`}>
      <body className="antialiased overflow-x-hidden">
        <PWARegistration />
        <PageWipe />
        <BackGesture />
        <ConnectionToast />
        {children}
      </body>
    </html>
  );
}
