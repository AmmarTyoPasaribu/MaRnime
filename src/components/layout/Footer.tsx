'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';

export default function Footer() {
  const { t } = useI18n();

  const quickLinks = [
    { href: '/browse', label: t('browseAnime') },
    { href: '/seasonal', label: t('seasonal') },
    { href: '/login', label: t('signIn') },
  ];

  return (
    <footer className="relative z-10 border-t border-[rgba(45,212,191,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image src="/logo.png" alt="MaRnime" width={28} height={28} className="rounded-lg" />
              <span className="text-lg font-bold gradient-text">MaRnime</span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-aurora-teal)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">{t('dataSource')}</h3>
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-aurora-teal)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('poweredBy')}
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-[rgba(45,212,191,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} MaRnime. Built with Next.js & AniList.
          </p>
          <span className="text-xs text-[var(--color-text-muted)] opacity-50">Aurora Dark Theme</span>
        </div>
      </div>
    </footer>
  );
}
