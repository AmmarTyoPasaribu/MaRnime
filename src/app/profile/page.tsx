'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { User, BookOpen, Play, CheckCircle, Pause, XCircle, Clock, Loader2, Trash2, Star } from 'lucide-react';

interface WatchlistItem {
  id: string;
  anime_id: number;
  anime_title: string;
  anime_image: string | null;
  anime_total_episodes: number | null;
  status: string;
  score: number | null;
  episodes_watched: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const TABS = [
  { value: 'all', label: 'All', icon: BookOpen },
  { value: 'watching', label: 'Watching', icon: Play },
  { value: 'planning', label: 'Plan to Watch', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'on_hold', label: 'On Hold', icon: Pause },
  { value: 'dropped', label: 'Dropped', icon: XCircle },
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchWatchlist();
  }, [user, authLoading]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });
      setWatchlist(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('watchlist').delete().eq('id', id);
      setWatchlist((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEpisodes = async (id: string, episodes: number) => {
    try {
      const supabase = createClient();
      await supabase
        .from('watchlist')
        .update({ episodes_watched: episodes, updated_at: new Date().toISOString() })
        .eq('id', id);
      setWatchlist((prev) =>
        prev.map((w) => (w.id === id ? { ...w, episodes_watched: episodes } : w))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (!user) return null;

  const filtered =
    activeTab === 'all' ? watchlist : watchlist.filter((w) => w.status === activeTab);

  const stats = {
    total: watchlist.length,
    watching: watchlist.filter((w) => w.status === 'watching').length,
    completed: watchlist.filter((w) => w.status === 'completed').length,
    planning: watchlist.filter((w) => w.status === 'planning').length,
    on_hold: watchlist.filter((w) => w.status === 'on_hold').length,
    dropped: watchlist.filter((w) => w.status === 'dropped').length,
  };

  return (
    <div className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
      {/* Profile Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center ring-2 ring-[var(--color-accent)]">
            <User className="w-8 h-8 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.user_metadata?.display_name || user.email?.split('@')[0]}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Total</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-green)]">{stats.watching}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Watching</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-green)]">{stats.completed}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-accent)]">{stats.planning}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Planning</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-yellow)]">{stats.on_hold}</p>
            <p className="text-xs text-[var(--color-text-muted)]">On Hold</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-red)]">{stats.dropped}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Dropped</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 pb-2" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.value !== 'all' && (
              <span className="text-xs opacity-70">
                ({stats[tab.value as keyof typeof stats] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Watchlist */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="text-lg text-[var(--color-text-muted)]">
            {activeTab === 'all' ? 'Your list is empty' : `No anime in ${activeTab.replace('_', ' ')}`}
          </p>
          <Link href="/browse" className="btn-primary mt-4 inline-flex">
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card flex items-center gap-3 p-3 group"
            >
              {/* Poster */}
              <Link
                href={`/anime/${item.anime_id}`}
                className="relative w-12 h-16 sm:w-14 sm:h-[74px] rounded-lg overflow-hidden flex-shrink-0"
              >
                {item.anime_image ? (
                  <Image
                    src={item.anime_image}
                    alt={item.anime_title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--color-bg-card)] flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/anime/${item.anime_id}`} className="text-sm font-medium truncate block hover:text-[var(--color-accent)] transition-colors">
                  {item.anime_title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium status-${item.status}`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {item.score && (
                    <span className="flex items-center gap-0.5 text-xs text-[var(--color-yellow)]">
                      <Star className="w-3 h-3" />
                      {item.score}
                    </span>
                  )}
                </div>
              </div>

              {/* Episode Progress */}
              <div className="flex items-center gap-2">
                {(item.status === 'watching' || item.status === 'completed') && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                    <button
                      onClick={() => handleUpdateEpisodes(item.id, Math.max(0, item.episodes_watched - 1))}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--color-bg-card-hover)] transition-colors"
                    >
                      -
                    </button>
                    <span className="min-w-[60px] text-center">
                      {item.episodes_watched}/{item.anime_total_episodes || '?'}
                    </span>
                    <button
                      onClick={() => handleUpdateEpisodes(item.id, item.episodes_watched + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--color-bg-card-hover)] transition-colors"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-red)] hover:bg-[rgba(239,68,68,0.1)] opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
