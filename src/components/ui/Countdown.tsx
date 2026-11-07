'use client';

import { useSyncExternalStore } from 'react';
import { formatCountdown } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';

const subscribers = new Map<number, (cb: () => void) => () => void>();
function subscribeEvery(interval: number) {
  let fn = subscribers.get(interval);
  if (!fn) {
    fn = (cb: () => void) => {
      const id = setInterval(cb, interval);
      return () => clearInterval(id);
    };
    subscribers.set(interval, fn);
  }
  return fn;
}

/**
 * Current unix time in seconds, quantised to `interval` ms. Returns null during
 * SSR and hydration so server-cached HTML never mismatches the client clock.
 */
export function useNow(interval = 30_000) {
  return useSyncExternalStore(
    subscribeEvery(interval),
    () => Math.floor(Date.now() / interval) * (interval / 1000),
    () => null
  );
}

/** Live countdown to a unix timestamp. */
export default function Countdown({ to, className, live = false }: { to: number; className?: string; live?: boolean }) {
  const now = useNow(live ? 1000 : 30_000);
  const { locale } = useI18n();
  if (now == null) return <span className={className} aria-hidden>&nbsp;</span>;
  const diff = Math.max(0, to - now);
  if (!live) return <span className={className}>{formatCountdown(diff, locale)}</span>;

  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  const units = locale === 'id' ? ['hari', 'jam', 'mnt', 'dtk'] : ['days', 'hrs', 'min', 'sec'];
  return (
    <span className={className} role="timer">
      {[d, h, m, s].map((v, i) => (
        <span key={i} className="inline-flex flex-col items-center">
          <span className="font-display text-2xl font-bold tabular-nums">{String(v).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-wider text-fg-3">{units[i]}</span>
        </span>
      ))}
    </span>
  );
}
