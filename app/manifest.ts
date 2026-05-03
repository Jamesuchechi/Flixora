import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flixora — Premium Streaming',
    short_name: 'Flixora',
    description: 'The ultimate cinematic experience. Stream movies and series in high quality.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06070d',
    theme_color: '#06070d',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
