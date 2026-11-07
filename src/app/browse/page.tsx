import { Suspense } from 'react';
import type { Metadata } from 'next';
import BrowseClient from '@/components/browse/BrowseClient';
import { CardGridSkeleton } from '@/components/ui/Section';
import { getI18n } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('browseTitle'), description: t('browseSubtitle') };
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="pt-10">
          <div className="skeleton mb-3 h-10 w-64" />
          <div className="skeleton mb-8 h-5 w-96 max-w-full" />
          <CardGridSkeleton count={15} />
        </div>
      }
    >
      <BrowseClient />
    </Suspense>
  );
}
