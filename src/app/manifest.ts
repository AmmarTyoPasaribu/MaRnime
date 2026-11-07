import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MaRnime — Discover & Track Anime',
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#07080e',
    theme_color: '#07080e',
    icons: [{ src: '/logo.png', sizes: '640x640', type: 'image/png', purpose: 'any' }],
  };
}
