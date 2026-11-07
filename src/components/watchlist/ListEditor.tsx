'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Loader2, Minus, Plus, Star, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useI18n } from '@/providers/I18nProvider';
import { useToast } from '@/providers/ToastProvider';
import { label } from '@/lib/i18n/labels';
import { cn } from '@/lib/utils';
import {
  LIST_STATUSES,
  STATUS_COLOR,
  useRemoveEntry,
  useSaveEntry,
  type AnimeRef,
  type ListStatus,
  type WatchlistEntry,
} from '@/lib/watchlist';

interface Props {
  open: boolean;
  onClose: () => void;
  anime: AnimeRef;
  entry: WatchlistEntry | null;
}

/** Form state lives in a child that mounts each time the dialog opens, so it always starts from the saved entry. */
function EditorForm({ onClose, anime, entry }: Omit<Props, 'open'>) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const save = useSaveEntry();
  const remove = useRemoveEntry();

  const [status, setStatus] = useState<ListStatus>(entry?.status ?? 'planning');
  const [score, setScore] = useState<number>(entry?.score ?? 0);
  const [progress, setProgress] = useState<number>(entry?.episodes_watched ?? 0);
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [started, setStarted] = useState(entry?.started_at ?? '');
  const [completed, setCompleted] = useState(entry?.completed_at ?? '');
  const [confirming, setConfirming] = useState(false);

  const max = anime.episodes ?? undefined;

  const onSave = async () => {
    try {
      await save.mutateAsync({
        anime,
        patch: {
          status,
          score: score || null,
          episodes_watched: progress,
          notes: notes.trim() || null,
          started_at: started || null,
          completed_at: completed || null,
        },
      });
      toast(t('savedToList', { status: label.listStatus(status, locale) }));
      onClose();
    } catch {
      toast(t('actionFailed'), 'error');
    }
  };

  const onRemove = async () => {
    try {
      await remove.mutateAsync(anime.id);
      toast(t('removedFromList'), 'info');
      onClose();
    } catch {
      toast(t('actionFailed'), 'error');
    }
  };

  return (
    <div className="space-y-5">
        {/* Status */}
        <div>
          <span className="label">{t('status')}</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {LIST_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'flex items-center gap-2 border px-3 py-2.5 text-left text-sm font-medium transition',
                  status === s ? 'border-ink bg-ink text-white' : 'border-ink bg-white hover:bg-pop-yellow'
                )}
                
              >
                <span className="h-3.5 w-3.5 shrink-0 border-2 border-ink" style={{ background: STATUS_COLOR[s] }} />
                {label.listStatus(s, locale)}
              </button>
            ))}
          </div>
        </div>

        {/* Progress & score */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="label">{t('progress')}</span>
            <div className="flex items-center gap-2">
              <button type="button" className="icon-btn border-2 border-ink" onClick={() => setProgress((p) => Math.max(0, p - 1))} aria-label="-1">
                <Minus className="h-4 w-4" />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={max}
                  value={progress}
                  onChange={(e) => {
                    const v = Math.max(0, parseInt(e.target.value || '0', 10));
                    setProgress(max ? Math.min(v, max) : v);
                  }}
                  className="input text-center tabular-nums"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-3">/ {max ?? '?'}</span>
              </div>
              <button
                type="button"
                className="icon-btn border-2 border-ink"
                onClick={() => setProgress((p) => (max ? Math.min(max, p + 1) : p + 1))}
                aria-label="+1"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <span className="label">
              {t('score')} <span className="normal-case tracking-normal text-fg-2">{score ? `${score}/10` : t('noScore')}</span>
            </span>
            <div className="flex h-11 items-center gap-0.5" onMouseLeave={() => undefined}>
              {Array.from({ length: 10 }).map((_, i) => {
                const v = i + 1;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setScore(score === v ? 0 : v)}
                    aria-label={`${v}/10`}
                    className="group/star grid h-8 flex-1 place-items-center"
                  >
                    <Star
                      className={cn(
                        'h-5 w-5 transition',
                        v <= score ? 'fill-pop-yellow text-ink' : 'text-ink/25 group-hover/star:text-ink'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">{t('startedAt')}</span>
            <input type="date" value={started} onChange={(e) => setStarted(e.target.value)} className="input" />
          </label>
          <label>
            <span className="label">{t('completedAt')}</span>
            <input type="date" value={completed} onChange={(e) => setCompleted(e.target.value)} className="input" />
          </label>
        </div>

        {/* Notes */}
        <label className="block">
          <span className="label">{t('notes')}</span>
          <textarea
            rows={3}
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            className="input"
          />
        </label>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {entry &&
            (confirming ? (
              <button type="button" onClick={onRemove} disabled={remove.isPending} className="btn btn-danger">
                {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {t('remove')}?
              </button>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="btn btn-ghost text-danger hover:!text-danger">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('remove')}</span>
              </button>
            ))}
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="btn btn-ghost">
            {t('cancel')}
          </button>
          <button type="button" onClick={onSave} disabled={save.isPending} className="btn btn-primary min-w-24">
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('saveChanges')}
          </button>
        </div>
    </div>
  );
}

export default function ListEditor({ open, onClose, anime, entry }: Props) {
  const { t } = useI18n();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          {anime.image && (
            <span className="relative h-12 w-9 shrink-0 overflow-hidden">
              <Image src={anime.image} alt="" fill sizes="36px" className="object-cover" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wider text-fg-3">{entry ? t('editEntry') : t('addToList')}</span>
            <span className="line-clamp-1 text-base">{anime.title}</span>
          </span>
        </span>
      }
    >
      <EditorForm onClose={onClose} anime={anime} entry={entry} />
    </Modal>
  );
}
