import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileClient from '@/components/profile/ProfileClient';

export const metadata: Metadata = {
  title: 'My List',
  robots: { index: false },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="pt-8"><div className="skeleton h-64" /></div>}>
      <ProfileClient />
    </Suspense>
  );
}
