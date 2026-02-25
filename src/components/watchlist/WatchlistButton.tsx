'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Plus, Check, ChevronDown, Loader2 } from 'lucide-react';

interface WatchlistButtonProps {
  animeId: number;
  animeTitle: string;
  animeImage: string;
  totalEpisodes: number | null;
}

const STATUS_OPTIONS = [
  { value: 'watching', label: '▶️ Watching', color: 'var(--color-green)' },
  { value: 'planning', label: '📌 Plan to Watch', color: 'var(--color-accent-hover)' },
  { value: 'completed', label: '✅ Completed', color: 'var(--color-green)' },
  { value: 'on_hold', label: '⏸️ On Hold', color: 'var(--color-yellow)' },
  { value: 'dropped', label: '❌ Dropped', color: 'var(--color-red)' },
];

export default function WatchlistButton({ animeId, animeTitle, animeImage, totalEpisodes }: WatchlistButtonProps) {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase
      .from('watchlist')
      .select('status')
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
      .single()
      .then(({ data }: { data: { status: string } | null }) => {
        if (data) setCurrentStatus(data.status);
      });
  }, [user, animeId]);

  if (!user) {
    return (
      <a href="/login" className="btn-primary w-full text-center text-sm justify-center">
        <Plus className="w-4 h-4" />
        Sign in to add
      </a>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setShowDropdown(false);
    try {
      const supabase = createClient();
      if (currentStatus) {
        // Update
        await supabase
          .from('watchlist')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
            ...(newStatus === 'completed' ? { completed_at: new Date().toISOString().split('T')[0] } : {}),
          })
          .eq('user_id', user.id)
          .eq('anime_id', animeId);
      } else {
        // Insert
        await supabase.from('watchlist').insert({
          user_id: user.id,
          anime_id: animeId,
          anime_title: animeTitle,
          anime_image: animeImage,
          anime_total_episodes: totalEpisodes,
          status: newStatus,
          started_at: newStatus === 'watching' ? new Date().toISOString().split('T')[0] : null,
          completed_at: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
        });
      }
      setCurrentStatus(newStatus);
    } catch (err) {
      console.error('Failed to update watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setShowDropdown(false);
    try {
      const supabase = createClient();
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', animeId);
      setCurrentStatus(null);
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentLabel = STATUS_OPTIONS.find((s) => s.value === currentStatus);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className={`w-full text-sm justify-center ${currentStatus ? 'btn-secondary' : 'btn-primary'}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : currentStatus ? (
          <>
            <Check className="w-4 h-4" />
            {currentLabel?.label || currentStatus}
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add to List
          </>
        )}
        <ChevronDown className="w-3 h-3 ml-auto" />
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 glass-card py-1 shadow-xl">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-card-hover)] transition-colors flex items-center gap-2 ${
                  currentStatus === opt.value ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {opt.label}
                {currentStatus === opt.value && <Check className="w-3 h-3 ml-auto" />}
              </button>
            ))}
            {currentStatus && (
              <>
                <div className="border-t border-[var(--color-border)] my-1" />
                <button
                  onClick={handleRemove}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--color-red)] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                >
                  Remove from List
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
