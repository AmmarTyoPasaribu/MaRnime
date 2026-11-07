'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronDown,
  Compass,
  Dices,
  Home,
  ListOrdered,
  ListVideo,
  Loader2,
  LogOut,
  Menu,
  Search,
  Sparkles,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { useAuth, displayNameOf } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Logo } from '@/components/ui/Logo';
import Avatar from '@/components/ui/Avatar';
import CommandPalette from './CommandPalette';
import Footer from './Footer';
import { DisplayModeSwitch, LanguageSwitch, useRandomAnime } from './Switches';
import { label } from '@/lib/i18n/labels';
import { LIST_STATUSES, STATUS_COLOR, useFavorites, useWatchlist } from '@/lib/watchlist';
import { cn, formatNumber } from '@/lib/utils';

const FULL_WIDTH_ROUTES = ['/anime-list'];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function useNavLinks() {
  const { t } = useI18n();
  return useMemo(
    () => [
      { href: '/', label: t('home'), icon: Home },
      { href: '/browse', label: t('browse'), icon: Compass },
      { href: '/seasonal', label: t('seasonal'), icon: Sparkles },
      { href: '/schedule', label: t('schedule'), icon: CalendarDays },
      { href: '/top', label: t('top'), icon: Trophy },
      { href: '/anime-list', label: t('animeList'), icon: ListOrdered },
    ],
    [t]
  );
}

/** Everything that lives in the sidebar — reused by the mobile drawer. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const links = useNavLinks();
  const random = useRandomAnime();
  const { data: list = [] } = useWatchlist();
  const { data: favorites = [] } = useFavorites();

  const counts = useMemo(() => {
    const c = Object.fromEntries(LIST_STATUSES.map((s) => [s, 0])) as Record<string, number>;
    let eps = 0;
    for (const e of list) {
      c[e.status] += 1;
      eps += e.episodes_watched;
    }
    return { c, eps };
  }, [list]);

  return (
    <div className="flex flex-col gap-5">
      <div className="border-[3px] border-ink bg-pop-yellow p-4 shadow-brut">
        <Link href="/" onClick={onNavigate} aria-label="MaRnime" className="mb-5 hidden lg:inline-flex">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 border-[3px] border-ink px-3 py-2.5 text-[15px] font-bold transition-[transform,box-shadow,background-color] duration-150',
                  active ? 'bg-ink text-pop-yellow' : 'bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm'
                )}
              >
                <link.icon className="h-5 w-5 transition-transform group-hover:-rotate-6" strokeWidth={2.5} />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              onNavigate?.();
              random.go();
            }}
            disabled={random.loading}
            className="group flex items-center gap-3 border-[3px] border-dashed border-ink bg-white/70 px-3 py-2.5 text-[15px] font-bold transition hover:bg-white"
          >
            {random.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Dices className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />}
            {t('randomAnime')}
          </button>
        </nav>
      </div>

      <div className="border-[3px] border-ink bg-white p-4 shadow-brut">
        <p className="label mb-2.5">{t('displayMode')}</p>
        <DisplayModeSwitch />
      </div>

      {user ? (
        <>
          <div className="border-[3px] border-ink bg-white p-4 shadow-brut">
            <p className="mb-2 font-display text-lg uppercase">{t('myList')}</p>
            <ul>
              {LIST_STATUSES.map((s) => (
                <li key={s}>
                  <Link
                    href={`/profile?tab=${s}`}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 border-t-2 border-ink py-2 text-sm font-bold transition-colors hover:bg-pop-yellow"
                  >
                    <span className="h-4 w-4 border-2 border-ink" style={{ background: STATUS_COLOR[s] }} />
                    <span className="flex-1">{label.listStatus(s, locale)}</span>
                    <span className="min-w-8 bg-ink px-1.5 py-0.5 text-center text-xs text-white">{counts.c[s]}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/profile?tab=favorites"
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 border-t-2 border-ink py-2 text-sm font-bold transition-colors hover:bg-pop-yellow"
                >
                  <span className="h-4 w-4 border-2 border-ink bg-pop-pink" />
                  <span className="flex-1">{t('favorites')}</span>
                  <span className="min-w-8 bg-ink px-1.5 py-0.5 text-center text-xs text-white">{favorites.length}</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="-rotate-[1.5deg] border-[3px] border-ink bg-pop-pink p-4 shadow-brut transition-transform hover:rotate-0">
            <p className="text-xs font-bold uppercase tracking-wide">{t('yourStats')}</p>
            <p className="mt-1 font-display text-4xl leading-none">{formatNumber(counts.eps, locale)}</p>
            <p className="mt-1 text-sm font-bold">
              {t('statsLine', { n: '' }).trim()} · {list.length} anime
            </p>
          </div>
        </>
      ) : (
        <div className="border-[3px] border-ink bg-pop-mint p-4 shadow-brut">
          <p className="font-display text-lg uppercase leading-tight">{t('trackCtaTitle')}</p>
          <p className="mt-1.5 text-sm font-medium">{t('trackCtaDesc')}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/login" onClick={onNavigate} className="btn btn-sm btn-ink flex-1">
              {t('signIn')}
            </Link>
            <Link href="/register" onClick={onNavigate} className="btn btn-sm flex-1">
              {t('signUp')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpenOn(null);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!user) return null;
  const name = displayNameOf(user, profile);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('profile')}
        className="flex h-[52px] items-center gap-1.5 border-[3px] border-ink bg-white pl-1 pr-2 shadow-brut-sm transition hover:bg-pop-yellow"
      >
        <Avatar name={name} src={profile?.avatar_url} size={38} />
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} strokeWidth={3} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="brut absolute right-0 top-full z-50 mt-3 w-64 p-2"
          >
            <div className="flex items-center gap-3 border-b-[3px] border-ink px-2 pb-3 pt-1">
              <Avatar name={name} src={profile?.avatar_url} size={40} />
              <div className="min-w-0">
                <p className="truncate font-bold">{name}</p>
                <p className="truncate text-xs text-fg-3">{user.email}</p>
              </div>
            </div>
            <Link role="menuitem" href="/profile" className="mt-2 flex items-center gap-2.5 px-2 py-2 text-sm font-bold hover:bg-pop-yellow">
              <ListVideo className="h-4 w-4" />
              {t('myList')}
            </Link>
            <Link role="menuitem" href="/profile?tab=favorites" className="flex items-center gap-2.5 px-2 py-2 text-sm font-bold hover:bg-pop-yellow">
              <User className="h-4 w-4" />
              {t('profile')}
            </Link>
            <button role="menuitem" onClick={signOut} className="flex w-full items-center gap-2.5 px-2 py-2 text-left text-sm font-bold text-danger hover:bg-pop-pink hover:text-ink">
              <LogOut className="h-4 w-4" />
              {t('signOut')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const links = useNavLinks();
  // Menus remember the path they were opened on, so navigating closes them.
  const [searchOn, setSearchOn] = useState<string | null>(null);
  const [drawerOn, setDrawerOn] = useState<string | null>(null);
  const searchOpen = searchOn === pathname;
  const drawerOpen = drawerOn === pathname;
  // Dense pages (A–Z list) use the full screen width; the sidebar moves into the drawer.
  const fullWidth = FULL_WIDTH_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOn((o) => (o === pathname ? null : pathname));
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setSearchOn(pathname);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOn(null);
    document.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', esc);
    };
  }, [drawerOpen]);

  const loginHref = `/login${pathname !== '/' && !pathname.startsWith('/login') && !pathname.startsWith('/register') ? `?next=${encodeURIComponent(pathname)}` : ''}`;

  return (
    <div className={cn('container-page flex gap-5 pb-24 pt-4 lg:gap-6 lg:pb-8 lg:pt-5', fullWidth && 'max-w-none lg:px-8')}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:border-[3px] focus:border-ink focus:bg-pop-yellow focus:px-3 focus:py-2 focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className={cn('no-scrollbar sticky top-5 hidden max-h-[calc(100dvh-2.5rem)] w-[264px] shrink-0 self-start overflow-y-auto pb-3 pr-2', !fullWidth && 'lg:block')}>
        <SidebarContent />
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-40 -mx-4 mb-6 flex items-center gap-2.5 border-b-[3px] border-ink bg-white px-4 py-2.5 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:mb-7 lg:border-0 lg:bg-transparent lg:p-0">
          <button onClick={() => setDrawerOn(pathname)} className={cn('icon-btn -ml-1', fullWidth ? 'lg:h-[52px] lg:w-[52px] lg:border-[3px] lg:border-ink lg:bg-white lg:shadow-brut' : 'lg:hidden')} aria-label={t('openMenu')}>
            <Menu className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <Link href="/" aria-label="MaRnime" className={cn(!fullWidth && 'lg:hidden', fullWidth && 'lg:mr-2')}>
            <Logo className="[&_svg]:h-9 [&_svg]:w-9 [&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
          </Link>

          <button
            onClick={() => setSearchOn(pathname)}
            className="ml-auto flex h-11 min-w-0 items-center gap-3 border-[3px] border-ink bg-white px-3 text-left text-sm font-medium text-fg-3 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm sm:flex-1 lg:ml-0 lg:h-[52px] lg:shadow-brut lg:hover:shadow-brut-lg"
          >
            <Search className="h-5 w-5 shrink-0 text-ink" strokeWidth={2.5} />
            <span className="hidden flex-1 truncate sm:inline">{t('searchPlaceholder')}</span>
            <span className="kbd hidden md:inline-flex">CTRL K</span>
          </button>

          <LanguageSwitch className="hidden h-[52px] items-stretch shadow-brut lg:flex [&_button]:h-auto" />
          <DisplayModeSwitch compact className="hidden h-[52px] items-stretch shadow-brut sm:flex lg:hidden [&_button]:h-auto" />

          {loading ? (
            <div className="skeleton h-11 w-11 lg:h-[52px] lg:w-[52px]" />
          ) : user ? (
            <UserMenu />
          ) : (
            <Link href={loginHref} className="btn btn-mint h-11 lg:h-[52px] lg:shadow-brut">
              {t('signIn')}
            </Link>
          )}
        </header>

        <main id="main" className="min-h-[70vh]">
          {children}
        </main>
        <Footer />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className={cn('fixed inset-0 z-[80]', !fullWidth && 'lg:hidden')}>
            <motion.div className="absolute inset-0 bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOn(null)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('openMenu')}
              initial={{ x: '-105%' }}
              animate={{ x: 0 }}
              exit={{ x: '-105%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 40 }}
              className="absolute inset-y-0 left-0 w-[86%] max-w-[330px] overflow-y-auto border-r-[3px] border-ink bg-white p-4"
              style={{ backgroundImage: 'radial-gradient(#d6d2c6 1.1px, transparent 1.2px)', backgroundSize: '22px 22px' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <Logo />
                <button onClick={() => setDrawerOn(null)} className="icon-btn border-[3px] border-ink bg-white" aria-label={t('closeMenu')}>
                  <X className="h-5 w-5" strokeWidth={3} />
                </button>
              </div>
              <div className="mb-5">
                <LanguageSwitch className="w-fit shadow-brut-sm" />
              </div>
              <SidebarContent onNavigate={() => setDrawerOn(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile bottom navigation */}
      <nav aria-label="Mobile" className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t-[3px] border-ink bg-white lg:hidden">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {[links[0], links[1], links[3], links[4]].map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn('relative isolate flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold uppercase', active ? 'text-ink' : 'text-fg-3')}
              >
                {active && <motion.span layoutId="mobile-tab" className="absolute inset-x-1.5 inset-y-1.5 -z-10 border-2 border-ink bg-pop-yellow" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <link.icon className="h-5 w-5" strokeWidth={2.5} />
                {link.label}
              </Link>
            );
          })}
          <Link
            href={user ? '/profile' : '/login'}
            className={cn('relative isolate flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold uppercase', isActive(pathname, '/profile') ? 'text-ink' : 'text-fg-3')}
          >
            {isActive(pathname, '/profile') && <motion.span layoutId="mobile-tab" className="absolute inset-x-1.5 inset-y-1.5 -z-10 border-2 border-ink bg-pop-yellow" />}
            <ListVideo className="h-5 w-5" strokeWidth={2.5} />
            {user ? t('myList') : t('signIn')}
          </Link>
        </div>
      </nav>

      <CommandPalette open={searchOpen} onClose={() => setSearchOn(null)} />
    </div>
  );
}
