import type { Metadata } from 'next';
import AnimeListClient from '@/components/browse/AnimeListClient';
import { getI18n } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('animeListTitle'), description: t('animeListSubtitle', { n: '3.000+' }) };
}

export default function AnimeListPage() {
  return <AnimeListClient />;
}
