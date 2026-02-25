'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Search, Menu, X, User, LogOut, Compass, Calendar, Globe, ListVideo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { locale, toggleLocale, t } = useI18n();

  const navLinks = [
    { href: '/browse', label: t('browse'), icon: Compass },
    { href: '/seasonal', label: t('seasonal'), icon: Calendar },
  ];

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(11, 11, 20, 0.9)'
            : 'rgba(11, 11, 20, 0.4)',
          backdropFilter: 'blur(24px)',
          borderBottom: scrolled
            ? '1px solid rgba(45, 212, 191, 0.08)'
            : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="MaRnime"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold gradient-text">MaRnime</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-[var(--color-aurora-teal)] bg-[rgba(45,212,191,0.08)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1.5">
              {/* Language Toggle */}
              <button
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-aurora-teal)] hover:bg-[rgba(45,212,191,0.06)]"
                title={locale === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5" />
                {locale === 'en' ? 'EN' : 'ID'}
              </button>

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-aurora-teal)] hover:bg-[rgba(45,212,191,0.06)] transition-all"
              >
                <Search className="w-4 h-4" />
                <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] rounded-md bg-[rgba(255,255,255,0.04)] text-[var(--color-text-muted)] border border-[var(--color-border)]">⌘K</kbd>
              </button>

              {/* Auth */}
              {!loading && (
                user ? (
                  <div className="hidden md:flex items-center gap-1">
                    <Link
                      href="/profile"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        pathname === '/profile'
                          ? 'text-[var(--color-aurora-teal)] bg-[rgba(45,212,191,0.08)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                      }`}
                    >
                      <ListVideo className="w-4 h-4" />
                      {t('myAnimeList')}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      <User className="w-4 h-4" />
                      {t('profile')}
                    </Link>
                    <button
                      onClick={signOut}
                      className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-red)] hover:bg-[rgba(248,113,113,0.08)] transition-all"
                      title={t('signOut')}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="hidden md:flex btn-primary text-sm py-2 px-4">
                    {t('signIn')}
                  </Link>
                )
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid rgba(45, 212, 191, 0.06)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === link.href
                        ? 'text-[var(--color-aurora-teal)] bg-[rgba(45,212,191,0.08)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      <User className="w-5 h-5" />
                      {t('profile')}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[var(--color-red)] hover:bg-[rgba(248,113,113,0.08)] w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      {t('signOut')}
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[var(--color-aurora-teal)]">
                    <User className="w-5 h-5" />
                    {t('signIn')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
            style={{ background: 'rgba(5, 5, 10, 0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-xl p-2"
              style={{
                background: 'rgba(15, 18, 30, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(45, 212, 191, 0.15)',
                borderRadius: '16px',
                boxShadow: '0 0 60px rgba(45, 212, 191, 0.05)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-[var(--color-aurora-teal)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchAnime')}
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-lg py-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                  />
                  <kbd className="hidden sm:inline-flex px-2 py-1 text-xs rounded-lg bg-[rgba(255,255,255,0.04)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    ESC
                  </kbd>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
