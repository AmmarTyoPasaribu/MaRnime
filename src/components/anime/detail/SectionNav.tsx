'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky in-page navigation with scroll-spy. Sections that stream in later
 * (e.g. MAL episodes / music) appear in the nav only once they exist.
 */
export default function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const [present, setPresent] = useState<string[]>([]);

  useEffect(() => {
    let frame = 0;
    const scan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const ids = sections.filter((s) => document.getElementById(s.id)).map((s) => s.id);
        setPresent((prev) => (prev.join() === ids.join() ? prev : ids));
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-130px 0px -55% 0px' }
    );
    present.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [present]);

  const shown = sections.filter((s) => present.includes(s.id));
  if (shown.length < 2) return null;

  return (
    <nav className="glass sticky top-[68px] z-30 mb-8 px-2 shadow-brut lg:top-3">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto py-2">
        {shown.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                'block whitespace-nowrap px-3.5 py-2 text-sm font-bold transition-colors',
                active === s.id ? 'bg-ink text-white' : 'hover:bg-pop-yellow'
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
