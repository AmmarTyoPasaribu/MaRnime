import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('h-10 w-10', className)} aria-hidden="true">
      <rect x="5" y="5" width="40" height="40" fill="#111" />
      <rect x="1.5" y="1.5" width="40" height="40" fill="#ff5c8a" stroke="#111" strokeWidth="3" />
      <path d="M10 33V11h6l5.5 8 5.5-8h6v22h-6V21.5l-5.5 7.5-5.5-7.5V33z" fill="#111" />
    </svg>
  );
}

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {showText && <span className="font-display text-[22px] leading-none tracking-tight">MARNIME</span>}
    </span>
  );
}
