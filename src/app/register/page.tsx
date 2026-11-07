'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, AtSign, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { cn, safeRedirect } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import AuthShell from '@/components/auth/AuthShell';
import PasswordInput from '@/components/auth/PasswordInput';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return pw.length < 6 ? 0 : Math.min(3, Math.ceil(s / 1.7));
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const next = safeRedirect(params.get('next'));
  const { user } = useAuth();

  // Already signed in? Skip the form.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const score = strength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameValid) {
      setError(t('usernameHint'));
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { username, display_name: username },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        // Email confirmation disabled: the DB trigger already created the profile.
        router.replace(next);
        router.refresh();
      } else {
        setDone(true);
      }
    } catch {
      setError(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = [t('passwordWeak'), t('passwordWeak'), t('passwordFair'), t('passwordStrong')][score];
  const strengthColor = ['#ff5c8a', '#ff5c8a', '#ffe94d', '#2de2a6'][score];

  return (
    <AuthShell
      title={t('createAccount')}
      subtitle={t('joinDesc')}
      footer={
        <>
          {t('alreadyHaveAccount')}{' '}
          <Link href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="bg-pop-yellow px-1 font-bold underline underline-offset-2">
            {t('signIn')}
          </Link>
        </>
      }
    >
      {done ? (
        <div className="panel flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-10 w-10 fill-pop-mint" strokeWidth={2.5} />
          <p className="text-fg-2">{t('checkEmail')}</p>
          <Link href="/login" className="btn btn-primary mt-2">
            {t('signIn')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="flex items-start gap-2.5 border-[3px] border-ink bg-pop-pink p-3 text-sm font-bold">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <label className="block">
            <span className="label">{t('username')}</span>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="animelover42"
                autoComplete="username"
                required
                maxLength={20}
                aria-invalid={username.length > 0 && !usernameValid}
                className={cn('input h-12 pl-10', username && !usernameValid && 'border-danger/50')}
              />
            </div>
            <span className={cn('mt-1.5 block text-xs', username && !usernameValid ? 'text-danger' : 'text-fg-3')}>{t('usernameHint')}</span>
          </label>
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
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" minLength={6} required />
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className="h-2.5 flex-1 border-2 border-ink transition-colors" style={{ background: i <= score ? strengthColor : '#fff' }} />
                  ))}
                </div>
                <span className="border-2 border-ink px-1 text-xs font-bold" style={{ background: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </label>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('createAccount')}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
