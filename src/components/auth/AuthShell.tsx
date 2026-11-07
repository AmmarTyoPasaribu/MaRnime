'use client';

import Link from 'next/link';
import { CalendarClock, Compass, ListChecks } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';
import { Logo, LogoMark } from '@/components/ui/Logo';

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  const { t } = useI18n();
  const features = [
    { icon: ListChecks, text: t('featureTrack') },
    { icon: Compass, text: t('featureDiscover') },
    { icon: CalendarClock, text: t('featureSchedule') },
  ];

  return (
    <div className="grid min-h-[70vh] items-center py-6 lg:grid-cols-2 lg:gap-12">
      <div className="relative hidden h-full max-h-[640px] overflow-hidden border-[3px] border-ink bg-pop-pink p-10 shadow-brut-lg lg:flex lg:flex-col lg:justify-between">
                <LogoMark className="absolute -bottom-16 -right-16 -z-10 h-80 w-80 rotate-[-12deg] opacity-30" />
        <Link href="/" className="self-start">
          <Logo />
        </Link>
        <div>
          <h2 className="max-w-md text-balance font-display text-4xl uppercase leading-tight">{t('authHeroTitle')}</h2>
          <p className="mt-4 max-w-md font-medium">{t('authHeroDesc')}</p>
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm font-bold">
                <span className="grid h-9 w-9 place-items-center border-2 border-ink bg-pop-yellow">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center lg:text-left">
          <LogoMark className="mx-auto mb-5 h-12 w-12 lg:hidden" />
          <h1 className="font-display text-3xl uppercase">{title}</h1>
          <p className="mt-2 font-medium text-fg-2">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-fg-3">{footer}</p>
      </div>
    </div>
  );
}
