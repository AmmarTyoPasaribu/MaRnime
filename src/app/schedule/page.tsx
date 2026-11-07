import type { Metadata } from 'next';
import ScheduleClient from '@/components/schedule/ScheduleClient';
import { getI18n } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('scheduleTitle'), description: t('scheduleSubtitle') };
}

export default function SchedulePage() {
  return <ScheduleClient />;
}
