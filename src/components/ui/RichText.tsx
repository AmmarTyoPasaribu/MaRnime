'use client';

import { useState } from 'react';
import { cleanDescription, cn } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';

/**
 * Renders AniList description markdown safely as React nodes:
 * __bold__ **bold** _italic_ [label](url) ~!spoiler!~ and line breaks.
 * No dangerouslySetInnerHTML — untrusted text never becomes HTML.
 */
function Spoiler({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  if (open) return <span className="bg-surface-2 px-0.5">{children}</span>;
  return (
    <span
      role="button"
      tabIndex={0}
      title={t('spoiler')}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(true)}
      className="cursor-pointer select-none bg-surface-3 px-0.5 text-transparent blur-[5px] transition hover:blur-[3px]"
    >
      {children}
    </span>
  );
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern =
    /(~!([\s\S]+?)!~)|(__([\s\S]+?)__)|(\*\*([\s\S]+?)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))|((?<![\w])_([^_\n]+)_(?![\w]))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    if (match[1]) nodes.push(<Spoiler key={key}>{renderInline(match[2], key)}</Spoiler>);
    else if (match[3]) nodes.push(<strong key={key}>{renderInline(match[4], key)}</strong>);
    else if (match[5]) nodes.push(<strong key={key}>{renderInline(match[6], key)}</strong>);
    else if (match[7]) {
      const href = match[9];
      const internal = href.match(/anilist\.co\/(anime|character|staff|studio)\/(\d+)/);
      nodes.push(
        <a
          key={key}
          href={internal ? `/${internal[1]}/${internal[2]}` : href}
          {...(internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {match[8]}
        </a>
      );
    } else if (match[10]) nodes.push(<em key={key}>{match[11]}</em>);
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function RichText({ text, className }: { text: string | null | undefined; className?: string }) {
  const clean = cleanDescription(text);
  if (!clean) return null;
  return <div className={cn('rich-text whitespace-pre-line', className)}>{renderInline(clean, 'r')}</div>;
}
