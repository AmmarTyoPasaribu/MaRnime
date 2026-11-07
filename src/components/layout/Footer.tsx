'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';
import { Logo } from '@/components/ui/Logo';
import { AniListIcon, MalIcon, SOCIAL_ICONS } from '@/components/ui/BrandIcons';
import { siteConfig } from '@/lib/site';

export default function Footer() {
  const { t } = useI18n();
  const explore = [
    { href: '/browse', label: t('browse') },
    { href: '/seasonal', label: t('seasonal') },
    { href: '/schedule', label: t('schedule') },
    { href: '/top', label: t('top') },
    { href: '/anime-list', label: t('animeList') },
  ];

  return (
    <footer className="mt-20 border-[3px] border-ink bg-white shadow-brut-lg">
      {/* Marquee strip */}
      <div className="overflow-hidden border-b-[3px] border-ink bg-pop-yellow py-2" aria-hidden>
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-sm uppercase">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-8">
              {['Jelajahi', 'Lacak', 'Tonton', 'Ulangi', 'Discover', 'Track', 'Watch', 'Repeat'].map((w) => (
                <span key={w} className="flex items-center gap-8">
                  {w} <span className="inline-block h-3 w-3 rotate-45 border-2 border-ink bg-pop-pink" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.6fr_1fr_1.2fr]">
        <div>
          <Link href="/" aria-label="MaRnime" className="inline-block">
            <Logo />
          </Link>
          <p className="mt-4 max-w-sm text-sm font-medium text-fg-2">{t('footerDesc')}</p>
          {siteConfig.socials.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {siteConfig.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.icon];
              return (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="grid h-11 w-11 place-items-center border-[3px] border-ink bg-white shadow-brut-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pop-mint hover:shadow-brut"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
          )}
        </div>

        <nav aria-label={t('explore')}>
          <h3 className="mb-3 font-display text-base uppercase">{t('explore')}</h3>
          <ul className="space-y-1.5">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-bold underline-offset-4 hover:bg-pop-yellow hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-3 font-display text-base uppercase">{t('dataSource')}</h3>
          <div className="flex flex-col gap-2">
            <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 font-bold hover:bg-pop-yellow">
              <AniListIcon className="h-5 w-5 text-[#02a9ff]" /> AniList
            </a>
            <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 font-bold hover:bg-pop-yellow">
              <MalIcon className="h-5 w-5 text-[#2e51a2]" /> MyAnimeList (Jikan)
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t-[3px] border-ink px-6 py-4 text-xs font-medium sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="space-y-1">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {t('madeBy')}{' '}
            <span className="font-bold">{siteConfig.author.name}</span>
          </p>
          <p className="text-fg-3">{t('notAffiliated')}</p>
        </div>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn btn-sm self-start sm:self-auto">
          <ArrowUp className="h-4 w-4" strokeWidth={3} />
          {t('backToTop')}
        </button>
      </div>
    </footer>
  );
}
