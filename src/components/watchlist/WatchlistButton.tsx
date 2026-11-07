'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Heart, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { useToast } from '@/providers/ToastProvider';
import { label } from '@/lib/i18n/labels';
import { cn } from '@/lib/utils';
import {
  LIST_STATUSES,
  STATUS_COLOR,
  useFavorites,
  useRemoveEntry,
  useSaveEntry,
  useToggleFavorite,
  useWatchlistEntry,
  type AnimeRef,
  type ListStatus,
} from '@/lib/watchlist';
import ListEditor from './ListEditor';

export default function WatchlistButton({ anime, className, size = 'md' }: { anime: AnimeRef; className?: string; size?: 'md' | 'lg' }) {
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const pathname = usePathname();
  const { entry, isLoading } = useWatchlistEntry(anime.id);
  const save = useSaveEntry();
  const remove = useRemoveEntry();
  const [menu, setMenu] = useState(false);
  const [editor, setEditor] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [menu]);

  const btnSize = size === 'lg' ? 'btn-lg' : '';

  if (authLoading || (user && isLoading)) {
    return <div className={cn('skeleton h-[2.75rem] w-full', size === 'lg' && 'h-[3.25rem]', className)} />;
  }

  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={cn('btn btn-secondary', btnSize, className || 'w-full')}>
        <Plus className="h-4 w-4" />
        {t('signInToAdd')}
      </Link>
    );
  }

  const setStatus = async (status: ListStatus) => {
    setMenu(false);
    try {
      await save.mutateAsync({ anime, patch: { status } });
      toast(t('savedToList', { status: label.listStatus(status, locale) }));
    } catch {
      toast(t('actionFailed'), 'error');
    }
  };

  const onRemove = async () => {
    setMenu(false);
    try {
      await remove.mutateAsync(anime.id);
      toast(t('removedFromList'), 'info');
    } catch {
      toast(t('actionFailed'), 'error');
    }
  };

  const busy = save.isPending || remove.isPending;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className={cn('flex w-full border-[3px] border-ink shadow-brut transition-transform', size === 'lg' ? 'h-[3.25rem]' : 'h-[2.75rem]')}>
        <button
          onClick={() => (entry ? setEditor(true) : setStatus('planning'))}
          disabled={busy}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 px-3 text-sm font-bold text-ink transition-colors disabled:opacity-60',
            entry ? 'bg-white hover:bg-surface-2' : 'bg-pop-yellow hover:bg-[#fff06e]'
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : entry ? (
            <>
              <span className="h-3.5 w-3.5 border-2 border-ink" style={{ background: STATUS_COLOR[entry.status] }} />
              <span className="truncate">{label.listStatus(entry.status, locale)}</span>
              {entry.status === 'watching' && (
                <span className="bg-ink px-1.5 text-xs text-white">
                  {entry.episodes_watched}/{anime.episodes ?? '?'}
                </span>
              )}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {t('addToList')}
            </>
          )}
        </button>
        <button
          onClick={() => setMenu((m) => !m)}
          aria-haspopup="menu"
          aria-expanded={menu}
          aria-label={t('status')}
          className={cn('grid w-11 place-items-center border-l-[3px] border-ink text-ink transition-colors', entry ? 'bg-white hover:bg-pop-yellow' : 'bg-pop-yellow hover:bg-[#fff06e]')}
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', menu && 'rotate-180')} strokeWidth={3} />
        </button>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="brut absolute left-0 right-0 top-full z-40 mt-3 min-w-56 p-1.5 text-ink"
          >
            {LIST_STATUSES.map((s) => (
              <button
                key={s}
                role="menuitem"
                onClick={() => setStatus(s)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-bold transition hover:bg-pop-yellow"
              >
                <span className="h-3.5 w-3.5 border-2 border-ink" style={{ background: STATUS_COLOR[s] }} />
                {label.listStatus(s, locale)}
                {entry?.status === s && <Check className="ml-auto h-4 w-4" strokeWidth={3} />}
              </button>
            ))}
            <div className="my-1 h-[3px] bg-ink" />
            <button
              role="menuitem"
              onClick={() => {
                setMenu(false);
                setEditor(true);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-bold transition hover:bg-pop-yellow"
            >
              <Pencil className="h-4 w-4" />
              {t('editEntry')}
            </button>
            {entry && (
              <button
                role="menuitem"
                onClick={onRemove}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-bold text-danger transition hover:bg-pop-pink hover:text-ink"
              >
                <Trash2 className="h-4 w-4" />
                {t('remove')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ListEditor open={editor} onClose={() => setEditor(false)} anime={anime} entry={entry} />
    </div>
  );
}

export function FavoriteButton({ anime, className }: { anime: AnimeRef; className?: string }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const pathname = usePathname();
  const { data: favorites } = useFavorites();
  const toggle = useToggleFavorite();
  const isFav = !!favorites?.some((f) => f.anime_id === anime.id);

  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={cn('btn w-[2.75rem] px-0', className)} aria-label={t('favorite')}>
        <Heart className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <button
      onClick={async () => {
        try {
          await toggle.mutateAsync({ anime, favorite: !isFav });
          toast(isFav ? t('removedFavorite') : t('addedFavorite'), isFav ? 'info' : 'success');
        } catch {
          toast(t('actionFailed'), 'error');
        }
      }}
      aria-pressed={isFav}
      aria-label={t('favorite')}
      title={t('favorite')}
      className={cn(
        'btn w-[2.75rem] px-0',
        isFav ? 'bg-pop-pink' : 'bg-white',
        className
      )}
    >
      <motion.span key={String(isFav)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
        <Heart className={cn('h-5 w-5', isFav && 'fill-current')} />
      </motion.span>
    </button>
  );
}
