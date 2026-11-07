import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SectionHeader({
  title,
  icon,
  href,
  linkLabel,
  subtitle,
  className,
  action,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  subtitle?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="section-heading">
          {icon ?? <span className="bar" aria-hidden />}
          <span className="line-clamp-2">{title}</span>
        </h2>
        {subtitle && <p className="mt-1 text-sm font-bold text-fg-3">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {href && (
          <Link href={href} className="btn btn-sm group">
            <span className="hidden sm:inline">{linkLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
          </Link>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('panel flex flex-col items-center px-6 py-14 text-center', className)}>
      {icon && <div className="mb-4 grid h-14 w-14 rotate-[-4deg] place-items-center border-[3px] border-ink bg-pop-yellow shadow-brut-sm">{icon}</div>}
      <h3 className="font-display text-xl uppercase">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm font-medium text-fg-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CardGridSkeleton({ count = 12, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3]" />
          <div className="skeleton mt-3 h-3.5 w-4/5" />
          <div className="skeleton mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
