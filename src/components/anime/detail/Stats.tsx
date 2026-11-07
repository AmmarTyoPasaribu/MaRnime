import type { MediaStats } from '@/lib/anilist/types';
import { getI18n } from '@/lib/i18n/server';
import { label } from '@/lib/i18n/labels';
import { compactNumber } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  CURRENT: '#34d399',
  PLANNING: '#60a5fa',
  COMPLETED: '#a78bfa',
  PAUSED: '#fbbf24',
  DROPPED: '#f87171',
  REPEATING: '#2dd4bf',
};

function scoreHue(score: number) {
  // 10 → red, 100 → green
  const hue = Math.round(((score - 10) / 90) * 130);
  return `hsl(${hue} 70% 55%)`;
}

export default async function Stats({ stats }: { stats: MediaStats }) {
  const { t, locale } = await getI18n();
  const scores = stats.scoreDistribution ?? [];
  const statuses = (stats.statusDistribution ?? []).filter((s) => s.amount > 0);
  const maxScore = Math.max(1, ...scores.map((s) => s.amount));
  const totalStatus = statuses.reduce((a, s) => a + s.amount, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {statuses.length > 0 && (
        <div className="panel p-5">
          <h3 className="mb-4 font-display text-base uppercase">{t('statusDistribution')}</h3>
          <div className="flex h-5 overflow-hidden border-[3px] border-ink bg-surface-2">
            {statuses.map((s) => (
              <div key={s.status} style={{ width: `${(s.amount / totalStatus) * 100}%`, background: STATUS_COLORS[s.status] ?? '#888' }} />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
            {statuses.map((s) => (
              <li key={s.status} className="flex items-center gap-2 text-sm">
                <span className="h-3.5 w-3.5 shrink-0 border-2 border-ink" style={{ background: STATUS_COLORS[s.status] }} />
                <span className="text-fg-2">{label.listStatus(s.status, locale)}</span>
                <span className="ml-auto font-bold tabular-nums">{compactNumber(s.amount, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {scores.length > 0 && (
        <div className="panel p-5">
          <h3 className="mb-4 font-display text-base uppercase">{t('scoreDistribution')}</h3>
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label={t('scoreDistribution')}>
            {scores.map((s) => (
              <div key={s.score} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] font-bold text-fg-3 opacity-0 transition group-hover:opacity-100">
                  {compactNumber(s.amount, locale)}
                </span>
                <div
                  className="w-full border-2 border-ink transition-transform group-hover:-translate-y-1"
                  style={{ height: `${Math.max(3, (s.amount / maxScore) * 100)}%`, background: scoreHue(s.score) }}
                />
                <span className="text-[10px] font-bold text-fg-3">{s.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
