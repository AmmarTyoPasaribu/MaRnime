'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import RichText from '@/components/ui/RichText';
import { useI18n } from '@/providers/I18nProvider';
import { cn } from '@/lib/utils';

export default function Synopsis({ text }: { text: string | null }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 4);
  }, [text]);

  if (!text) return <p className="text-sm text-fg-3">{t('noSynopsis')}</p>;

  return (
    <div>
      <div
        ref={ref}
        className={cn('relative overflow-hidden text-[15px] font-medium leading-relaxed text-fg-2 transition-[max-height] duration-500', expanded ? 'max-h-[2000px]' : 'max-h-[9.5rem]')}
      >
        <RichText text={text} />
        {!expanded && overflowing && <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-canvas to-transparent" />}
      </div>
      {overflowing && (
        <button onClick={() => setExpanded((e) => !e)} className="btn btn-sm mt-3">
          {expanded ? t('showLess') : t('readMore')}
          <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}
