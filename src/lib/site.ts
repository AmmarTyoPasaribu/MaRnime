export const siteConfig = {
  name: 'MaRnime',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://marnime.vercel.app',
  description:
    'Discover trending anime, browse every season, follow the weekly airing schedule and track your watchlist with MaRnime.',
  author: {
    name: 'Ammar Tyo Pasaribu',
  },
  /**
   * Social / profile links shown in the footer.
   * Add or remove entries freely — supported icons: github, instagram, x,
   * linkedin, youtube, discord, tiktok, website, email.
   */
  socials: [] as { icon: SocialIcon; label: string; href: string }[],
};

export type SocialIcon =
  | 'github'
  | 'instagram'
  | 'x'
  | 'linkedin'
  | 'youtube'
  | 'discord'
  | 'tiktok'
  | 'website'
  | 'email';
