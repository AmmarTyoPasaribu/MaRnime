'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clapperboard,
  Heart,
  LayoutGrid,
  List,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Search,
  Star,
  Tv,
} from 'lucide-react';
import { useAuth, displayNameOf } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { useToast } from '@/providers/ToastProvider';
import { getSupabase } from '@/lib/supabase/client';
import { label } from '@/lib/i18n/labels';
import { cn, formatNumber } from '@/lib/utils';
import {
  LIST_STATUSES,
  STATUS_COLOR,
  useFavorites,
  useSaveEntry,
  useToggleFavorite,
  useWatchlist,
  type ListStatus,
  type WatchlistEntry,
} from '@/lib/watchlist';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Section';
import ListEditor from '@/components/watchlist/ListEditor';

type Tab = 'all' | ListStatus | 'favorites';
type Sort = 'recent' | 'title' | 'score' | 'progress';

function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t('editProfile')}>
      <EditProfileForm onClose={onClose} />
    </Modal>
  );
}

function EditProfileForm({ onClose }: { onClose: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    if (avatar && !/^https:\/\/\S+$/i.test(avatar)) {
      toast('Avatar URL must start with https://', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() || null, bio: bio.trim() || null, avatar_url: avatar.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast(t('actionFailed'), 'error');
      return;
    }
    await refreshProfile();
    toast(t('profileUpdated'));
    onClose();
  };

  return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={name || displayNameOf(user, profile)} src={avatar || null} size={64} />
          <label className="flex-1">
            <span className="label">{t('avatarUrl')}</span>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" className="input" type="url" />
          </label>
        </div>
        <label className="block">
          <span className="label">{t('displayName')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="input" data-autofocus />
        </label>
        <label className="block">
          <span className="label">{t('bio')}</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={3} placeholder={t('bioPlaceholder')} className="input" />
          <span className="mt-1 block text-right text-xs text-fg-3">{bio.length}/280</span>
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            {t('cancel')}
          </button>
          <button onClick={save} disabled={saving} className="btn btn-primary min-w-24">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('save')}
          </button>
        </div>
      </div>
  );
}

function ProgressControl({ entry }: { entry: WatchlistEntry }) {
  const save = useSaveEntry();
  const { toast } = useToast();
  const { t } = useI18n();
  const total = entry.anime_total_episodes;
  const bump = async (delta: number) => {
    try {
      await save.mutateAsync({
        anime: { id: entry.anime_id, title: entry.anime_title, image: entry.anime_image, episodes: total },
        patch: { episodes_watched: Math.max(0, entry.episodes_watched + delta) },
      });
    } catch {
      toast(t('actionFailed'), 'error');
    }
  };
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => bump(-1)} disabled={entry.episodes_watched <= 0} className="icon-btn h-7 w-7 disabled:opacity-30" aria-label="-1">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-14 text-center text-xs font-bold tabular-nums">
        {entry.episodes_watched} / {total ?? '?'}
      </span>
      <button
        onClick={() => bump(1)}
        disabled={!!total && entry.episodes_watched >= total}
        className="icon-btn h-7 w-7 disabled:opacity-30"
        aria-label={t('plusOneEpisode')}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ProfileClient() {
  const { user, profile, loading: authLoading } = useAuth();
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { data: list = [], isPending } = useWatchlist();
  const { data: favorites = [] } = useFavorites();
  const toggleFav = useToggleFavorite();

  const tabParam = params.get('tab') as Tab | null;
  const tab: Tab = tabParam && (['all', 'favorites', ...LIST_STATUSES] as string[]).includes(tabParam) ? tabParam : 'all';
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  // Safe to read storage in the initializer: the list only renders after auth resolves on the client.
  const [view, setView] = useState<'list' | 'grid'>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('marnime-list-view') === 'grid' ? 'grid' : 'list';
    } catch {
      return 'list';
    }
  });
  const [editing, setEditing] = useState<WatchlistEntry | null>(null);
  const [editProfile, setEditProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent('/profile')}`);
  }, [authLoading, user, router]);

  const changeView = (v: 'list' | 'grid') => {
    setView(v);
    try {
      localStorage.setItem('marnime-list-view', v);
    } catch {}
  };

  const setTab = (next: Tab) => router.replace(next === 'all' ? pathname : `${pathname}?tab=${next}`, { scroll: false });

  const stats = useMemo(() => {
    const counts = Object.fromEntries(LIST_STATUSES.map((s) => [s, 0])) as Record<ListStatus, number>;
    let episodes = 0;
    let scored = 0;
    let scoreSum = 0;
    for (const e of list) {
      counts[e.status] += 1;
      episodes += e.episodes_watched;
      if (e.score) {
        scored += 1;
        scoreSum += e.score;
      }
    }
    return { counts, episodes, mean: scored ? scoreSum / scored : 0, total: list.length };
  }, [list]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const base = tab === 'all' || tab === 'favorites' ? list : list.filter((e) => e.status === tab);
    const filtered = q ? base.filter((e) => e.anime_title.toLowerCase().includes(q)) : base;
    const sorted = [...filtered];
    if (sort === 'title') sorted.sort((a, b) => a.anime_title.localeCompare(b.anime_title));
    if (sort === 'score') sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    if (sort === 'progress')
      sorted.sort(
        (a, b) =>
          b.episodes_watched / (b.anime_total_episodes || b.episodes_watched || 1) -
          a.episodes_watched / (a.anime_total_episodes || a.episodes_watched || 1)
      );
    return sorted;
  }, [list, tab, filter, sort]);

  const visibleFavs = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? favorites.filter((f) => f.anime_title.toLowerCase().includes(q)) : favorites;
  }, [favorites, filter]);

  if (authLoading || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin" strokeWidth={3} />
      </div>
    );
  }

  const name = displayNameOf(user, profile);
  const joined = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' }).format(
    new Date(profile?.created_at ?? user.created_at)
  );

  const tabs: { id: Tab; label: string; count: number; color?: string }[] = [
    { id: 'all', label: t('all'), count: stats.total },
    ...LIST_STATUSES.map((s) => ({ id: s as Tab, label: label.listStatus(s, locale), count: stats.counts[s], color: STATUS_COLOR[s] })),
    { id: 'favorites', label: t('favorites'), count: favorites.length, color: '#f472b6' },
  ];

  return (
    <div className="pb-4">
      {/* Header */}
      <section className="relative mb-8 overflow-hidden border-[3px] border-ink bg-pop-yellow shadow-brut-lg">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <Avatar name={name} src={profile?.avatar_url} size={96} className="ring-4" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl uppercase">{name}</h1>
            <p className="text-sm text-fg-3">
              {profile?.username ? `@${profile.username} · ` : ''}
              {t('memberSince', { date: joined })}
            </p>
            {profile?.bio && <p className="mt-2 max-w-2xl text-sm text-fg-2">{profile.bio}</p>}
          </div>
          <button onClick={() => setEditProfile(true)} className="btn btn-secondary self-start sm:self-center">
            <Pencil className="h-4 w-4" />
            {t('editProfile')}
          </button>
        </div>

        <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
          {[
            { icon: BookOpen, label: t('totalAnime'), value: formatNumber(stats.total, locale), color: 'fill-pop-mint' },
            { icon: Tv, label: t('episodesWatched'), value: formatNumber(stats.episodes, locale), color: 'fill-pop-blue' },
            { icon: CheckCircle2, label: label.listStatus('completed', locale), value: formatNumber(stats.counts.completed, locale), color: 'fill-pop-lilac' },
            { icon: Star, label: t('meanScore'), value: stats.mean ? stats.mean.toFixed(1) : '–', color: 'fill-pop-yellow' },
          ].map((s, i) => (
            <div key={s.label} className={cn('flex items-center gap-3 p-4 sm:p-5', i % 2 === 1 && 'border-l border-line', i >= 2 && 'border-t border-line sm:border-t-0', i === 2 && 'sm:border-l')}>
              <s.icon className={cn('h-6 w-6 shrink-0', s.color)} strokeWidth={2.5} />
              <div>
                <p className="font-display text-xl font-bold">{s.value}</p>
                <p className="text-xs text-fg-3">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {stats.total > 0 && (
          <div className="border-t border-line px-6 py-4 sm:px-8">
            <div className="flex h-5 overflow-hidden border-[3px] border-ink bg-white">
              {LIST_STATUSES.map((s) =>
                stats.counts[s] ? (
                  <div key={s} title={`${label.listStatus(s, locale)}: ${stats.counts[s]}`} style={{ width: `${(stats.counts[s] / stats.total) * 100}%`, background: STATUS_COLOR[s] }} />
                ) : null
              )}
            </div>
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} data-active={tab === tb.id} className="chip h-10 px-4">
            {tb.color && tab !== tb.id && <span className="h-3 w-3 border-2 border-ink" style={{ background: tb.color }} />}
            {tb.label}
            <span className={cn('text-xs', tab === tb.id ? 'text-black/60' : 'text-fg-3')}>{tb.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('searchList')} className="input pl-10" />
        </div>
        {tab !== 'favorites' && (
          <>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input h-11 w-auto" aria-label={t('sortBy')}>
              <option value="recent">{t('sortRecent')}</option>
              <option value="title">{t('sortTitle')}</option>
              <option value="score">{t('sortScore')}</option>
              <option value="progress">{t('sortProgress')}</option>
            </select>
            <div className="flex border-2 border-ink p-0.5">
              {(['list', 'grid'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => changeView(v)}
                  aria-pressed={view === v}
                  aria-label={v === 'grid' ? t('gridView') : t('listView')}
                  className={cn('grid h-9 w-9 place-items-center transition', view === v ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg')}
                >
                  {v === 'grid' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {tab === 'favorites' ? (
        visibleFavs.length === 0 ? (
          <EmptyState icon={<Heart className="h-6 w-6" />} title={t('emptyList')} description={t('emptyFavorites')} />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {visibleFavs.map((f) => (
              <div key={f.anime_id} className="anime-card group">
                <Link href={`/anime/${f.anime_id}`} className="poster block">
                  {f.anime_image && <Image src={f.anime_image} alt={f.anime_title} fill sizes="160px" className="object-cover" />}
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await toggleFav.mutateAsync({ anime: { id: f.anime_id, title: f.anime_title, image: f.anime_image, episodes: null }, favorite: false });
                      toast(t('removedFavorite'), 'info');
                    } catch {
                      toast(t('actionFailed'), 'error');
                    }
                  }}
                  className="absolute right-1.5 top-1.5 z-10 grid h-8 w-8 place-items-center border-2 border-ink bg-pop-pink transition hover:scale-110"
                  aria-label={t('removedFavorite')}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
                <p className="mt-2 line-clamp-2 text-xs font-bold">{f.anime_title}</p>
              </div>
            ))}
          </div>
        )
      ) : isPending ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="h-6 w-6" />}
          title={t('emptyList')}
          description={t('emptyListHint')}
          action={
            <Link href="/browse" className="btn btn-primary">
              {t('browseAnime')}
            </Link>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((e) => {
            const pct = e.anime_total_episodes ? (e.episodes_watched / e.anime_total_episodes) * 100 : e.status === 'completed' ? 100 : 0;
            return (
              <div key={e.anime_id} className="anime-card group">
                <Link href={`/anime/${e.anime_id}`} className="poster block">
                  {e.anime_image && <Image src={e.anime_image} alt={e.anime_title} fill sizes="200px" className="object-cover" />}
                  <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 border-2 border-ink bg-pop-yellow px-1.5 py-0.5 text-[10px] font-bold">
                    <span className="h-2.5 w-2.5 border border-ink" style={{ background: STATUS_COLOR[e.status] }} />
                    {label.listStatus(e.status, locale)}
                  </span>
                  {e.score ? (
                    <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-0.5 border-2 border-ink bg-white px-1.5 py-0.5 text-[11px] font-bold">
                      <Star className="h-3 w-3 fill-pop-yellow" />
                      {e.score}
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 z-10 h-2.5 border-t-2 border-ink bg-white">
                    <span className="block h-full" style={{ width: `${pct}%`, background: STATUS_COLOR[e.status] }} />
                  </span>
                </Link>
                <div className="mt-2.5 flex items-start gap-1">
                  <p className="card-title line-clamp-2 flex-1 text-sm font-bold leading-snug">{e.anime_title}</p>
                  <button onClick={() => setEditing(e)} className="icon-btn h-7 w-7 shrink-0" aria-label={t('editEntry')}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-1">
                  <ProgressControl entry={e} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((e) => {
            const pct = e.anime_total_episodes ? (e.episodes_watched / e.anime_total_episodes) * 100 : e.status === 'completed' ? 100 : 0;
            return (
              <li key={e.anime_id} className="panel group relative flex items-center gap-3 overflow-hidden p-2.5 sm:gap-4 sm:p-3">
                <span className="absolute inset-y-0 left-0 w-2 border-r-2 border-ink" style={{ background: STATUS_COLOR[e.status] }} />
                <Link href={`/anime/${e.anime_id}`} className="relative ml-1 h-[84px] w-[60px] shrink-0 overflow-hidden bg-surface-2">
                  {e.anime_image && <Image src={e.anime_image} alt="" fill sizes="60px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/anime/${e.anime_id}`} className="line-clamp-1 font-bold hover:bg-pop-yellow">
                    {e.anime_title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-3">
                    <span className="border-2 border-ink px-1 font-bold text-ink" style={{ background: STATUS_COLOR[e.status] }}>
                      {label.listStatus(e.status, locale)}
                    </span>
                    {e.score ? (
                      <span className="inline-flex items-center gap-1 text-fg-2">
                        <Star className="h-3 w-3 fill-pop-yellow" />
                        {e.score}/10
                      </span>
                    ) : null}
                    {e.notes && <span className="line-clamp-1 max-w-xs italic">“{e.notes}”</span>}
                  </div>
                  <div className="mt-2 h-3 max-w-sm overflow-hidden border-2 border-ink bg-white">
                    <div className="h-full transition-[width] duration-500" style={{ width: `${pct}%`, background: STATUS_COLOR[e.status] }} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <ProgressControl entry={e} />
                  <button onClick={() => setEditing(e)} className="icon-btn h-9 w-9" aria-label={t('editEntry')}>
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <ListEditor
          open={!!editing}
          onClose={() => setEditing(null)}
          anime={{ id: editing.anime_id, title: editing.anime_title, image: editing.anime_image, episodes: editing.anime_total_episodes }}
          entry={list.find((e) => e.anime_id === editing.anime_id) ?? editing}
        />
      )}
      <EditProfileModal open={editProfile} onClose={() => setEditProfile(false)} />
    </div>
  );
}
