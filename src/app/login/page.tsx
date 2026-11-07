'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, Mail } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { safeRedirect } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import AuthShell from '@/components/auth/AuthShell';
import PasswordInput from '@/components/auth/PasswordInput';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const next = safeRedirect(params.get('next'));
  const { user } = useAuth();

  // Already signed in? Skip the form.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get('error') ?? '');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError(t('unexpectedError'));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('welcomeBack')}
      subtitle={t('signInDesc')}
      footer={
        <>
          {t('dontHaveAccount')}{' '}
          <Link href={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="bg-pop-yellow px-1 font-bold underline underline-offset-2">
            {t('signUp')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 border-[3px] border-ink bg-pop-pink p-3 text-sm font-bold">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <label className="block">
          <span className="label">{t('email')}</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="input h-12 pl-10"
            />
          </div>
        </label>
        <label className="block">
          <span className="label">{t('password')}</span>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('signIn')}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
