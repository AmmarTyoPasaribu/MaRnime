import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeRedirect } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Only allow same-site relative paths (prevents open redirects like `?next=@evil.com`).
  const next = safeRedirect(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
          if (!profile) {
            await supabase.from('profiles').insert({
              id: user.id,
              username: user.user_metadata.username || user.email?.split('@')[0] || 'user',
              display_name: user.user_metadata.display_name || user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
              avatar_url: user.user_metadata.avatar_url || null,
            });
          }
        }
        return NextResponse.redirect(new URL(next, origin));
      }
    }
  }

  return NextResponse.redirect(new URL('/login?error=Could%20not%20authenticate', origin));
}
