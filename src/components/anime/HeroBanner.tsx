'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { MediaSummary } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, formatScore, plainText, scoreFill, titleOf } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import WatchlistButton from '@/components/watchlist/WatchlistButton';

const INTERVAL = 8000;

export default function HeroBanner({ anime }: { anime: MediaSummary[] }) {
  const { t, locale } = useI18n();
  const slides = anime.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hovered || userPaused;
  const reduced = !!useReducedMotion();
  const touchX = useRef<number | null>(null);

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    const id = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(id);
  }, [index, paused, reduced, go, slides.length]);

  const featured = slides[index];
  if (!featured) return null;

  const title = titleOf(featured.title);
  const desc = plainText(featured.description, 220);
  const score = formatScore(featured.averageScore);

  return (
    <section
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden border-[3px] border-ink bg-ink shadow-brut-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {/* Backdrop */}
      <AnimatePresence initial={false}>
        <motion.div
          key={featured.id}
          className="absolute inset-0 -z-10"
          initial={{ clipPath: 'inset(0 0 0 100%)' }}
          animate={{ clipPath: 'inset(0 0 0 0%)' }}
          exit={{ opacity: 0.6 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={featured.bannerImage || featured.coverImage.extraLarge}
            alt=""
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 1100px"
            className={cn('object-cover', !featured.bannerImage && 'scale-110 blur-xl')}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

      <div className="flex min-h-[460px] flex-col justify-end gap-6 p-5 sm:min-h-[440px] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl text-white"
          >
            <span className="sticker bg-pop-yellow text-xs" style={{ ['--r' as string]: '-3deg' }}>
              {t('heroTrending', { n: index + 1 })}
            </span>
            <h1 className="mt-4 font-display text-[1.75rem] uppercase leading-[1] sm:text-4xl xl:text-[2.75rem]">
              <Link href={`/anime/${featured.id}`} className="line-clamp-3 hover:underline hover:decoration-pop-yellow hover:decoration-4">
                {title}
              </Link>
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-white/85">
              <span>{label.format(featured.format, locale)}</span>
              {featured.episodes && <span>· {t('epsCount', { n: featured.episodes })}</span>}
              {featured.season && featured.seasonYear && (
                <span>
                  · {label.season(featured.season, locale)} {featured.seasonYear}
                </span>
              )}
              {featured.studios.nodes[0] && <span className="bg-pop-mint px-1.5 text-ink">{featured.studios.nodes[0].name}</span>}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {featured.genres.slice(0, 4).map((g) => (
                <Link key={g} href={`/browse?genres=${encodeURIComponent(g)}`} className="tag hover:bg-pop-yellow">
                  {g}
                </Link>
              ))}
            </div>
            {desc && <p className="mt-4 line-clamp-2 max-w-lg text-sm font-medium leading-relaxed text-white/80 sm:line-clamp-3">{desc}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`/anime/${featured.id}`} className="btn btn-primary btn-lg group">
                {t('viewDetails')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
              </Link>
              <WatchlistButton className="w-56" size="lg" anime={{ id: featured.id, title, image: featured.coverImage.large, episodes: featured.episodes }} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnails */}
        <div className="flex items-end gap-2.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={t('slide', { n: i + 1 })}
              aria-current={i === index}
              className={cn(
                'relative hidden shrink-0 overflow-hidden border-[3px] transition-all duration-300 sm:block',
                i === index ? 'h-[120px] w-[82px] -translate-y-1 border-pop-yellow shadow-[4px_4px_0_#ffe94d]' : 'h-[90px] w-[60px] border-white/60 opacity-70 hover:opacity-100'
              )}
            >
              <Image src={s.coverImage.medium} alt="" fill sizes="82px" className="object-cover" />
            </button>
          ))}
          {/* Mobile dots */}
          <div className="flex gap-1.5 sm:hidden">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={t('slide', { n: i + 1 })}
                className={cn('h-3 border-2 border-white transition-all', i === index ? 'w-8 bg-pop-yellow' : 'w-3 bg-transparent')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute right-3 top-3 flex items-start gap-3 sm:right-5 sm:top-5">
        <div className="hidden gap-2 md:flex">
          <button onClick={() => go(-1)} className="grid h-9 w-9 place-items-center border-2 border-ink bg-white transition hover:bg-pop-yellow" aria-label={t('scrollLeft')}>
            <ArrowLeft className="h-4 w-4" strokeWidth={3} />
          </button>
          <button onClick={() => setUserPaused((p) => !p)} className="grid h-9 w-9 place-items-center border-2 border-ink bg-white transition hover:bg-pop-yellow" aria-label={userPaused ? t('play') : t('pause')}>
            {userPaused ? <Play className="h-4 w-4" strokeWidth={3} /> : <Pause className="h-4 w-4" strokeWidth={3} />}
          </button>
          <button onClick={() => go(1)} className="grid h-9 w-9 place-items-center border-2 border-ink bg-white transition hover:bg-pop-yellow" aria-label={t('scrollRight')}>
            <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
        {score && (
          <span
            className="grid h-16 w-16 place-items-center rounded-full border-[3px] border-ink font-display text-lg text-ink sm:h-20 sm:w-20 sm:text-xl"
            style={{ background: scoreFill(featured.averageScore), transform: 'rotate(10deg)' }}
          >
            {score}★
          </span>
        )}
      </div>
      {/* Progress */}
      {!reduced && (
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20">
          <span
            key={`${index}-${paused}`}
            className="block h-full origin-left bg-pop-yellow"
            style={{ animation: `hero-progress ${INTERVAL}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        </div>
      )}
      <style>{`@keyframes hero-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </section>
  );
}
