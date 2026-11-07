'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Tag } from '@/lib/anilist/types';
import { useI18n } from '@/providers/I18nProvider';
import { cn } from '@/lib/utils';

export default function TagList({ tags }: { tags: Tag[] }) {
  const { t } = useI18n();
  const [showSpoilers, setShowSpoilers] = useState(false);
  const spoilerCount = tags.filter((tag) => tag.isMediaSpoiler || tag.isGeneralSpoiler).length;
  const visible = tags.filter((tag) => showSpoilers || !(tag.isMediaSpoiler || tag.isGeneralSpoiler));

  if (!tags.length) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visible.map((tag) => {
          const spoiler = tag.isMediaSpoiler || tag.isGeneralSpoiler;
          return (
            <Link
              key={tag.id}
              href={`/browse?tags=${encodeURIComponent(tag.name)}`}
              title={tag.description ?? undefined}
              className={cn(
                'group relative isolate overflow-hidden border-2 border-ink bg-white px-2.5 py-1.5 text-xs font-bold transition hover:-translate-y-0.5 hover:shadow-brut-sm',
                spoiler ? 'text-danger' : ''
              )}
            >
              <span
                className={cn('absolute inset-y-0 left-0 -z-10', spoiler ? 'bg-pop-pink/60' : 'bg-pop-mint/70')}
                style={{ width: `${tag.rank}%` }}
              />
              <span className="relative">
                {tag.name} <span className="text-fg-3">{tag.rank}%</span>
              </span>
            </Link>
          );
        })}
      </div>
      {spoilerCount > 0 && (
        <button onClick={() => setShowSpoilers((s) => !s)} className="btn btn-sm mt-4">
          {showSpoilers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showSpoilers ? t('hideSpoilers') : t('showSpoilers')} ({spoilerCount})
        </button>
      )}
    </div>
  );
}
