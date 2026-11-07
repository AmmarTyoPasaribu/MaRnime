import { Suspense } from 'react';
import type { Metadata } from 'next';
import SeasonalClient from '@/components/browse/SeasonalClient';
import { CardGridSkeleton } from '@/components/ui/Section';
import { getI18n } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('seasonalTitle'), description: t('seasonalSubtitle') };
}

export default function SeasonalPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-10">
          <div className="skeleton mb-8 h-44" />
          <CardGridSkeleton count={18} />
        </div>
      }
    >
      <SeasonalClient />
    </Suspense>
  );
}
