'use client';

import { Share2 } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';
import { useToast } from '@/providers/ToastProvider';

export default function ShareButton({ title }: { title: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  return (
    <button
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) await navigator.share({ title, url });
          else {
            await navigator.clipboard.writeText(url);
            toast(t('linkCopied'), 'info');
          }
        } catch {
          // user cancelled
        }
      }}
      className="btn w-[2.75rem] px-0"
      aria-label={t('share')}
      title={t('share')}
    >
      <Share2 className="h-5 w-5" />
    </button>
  );
}
