/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';

const FILLS = ['#ffe94d', '#ff5c8a', '#2de2a6', '#b9a6ff', '#ff9f45'];

export default function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return (
    <span
      className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden border-2 border-ink font-display text-ink', className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: FILLS[hash % FILLS.length] }}
    >
      {initials || '?'}
      {src && <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
    </span>
  );
}
