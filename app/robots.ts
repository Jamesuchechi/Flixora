import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flixora.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/watch/', '/profile/', '/settings/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
