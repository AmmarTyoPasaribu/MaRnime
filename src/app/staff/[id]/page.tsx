import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getStaff, parseId } from '@/lib/anilist/server';
import { getI18n } from '@/lib/i18n/server';
import { label } from '@/lib/i18n/labels';
import { compactNumber, formatBirthday, formatFuzzyDate, hexToRgb, plainText, titleOf } from '@/lib/utils';
import PersonHero from '@/components/person/PersonHero';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const s = await getStaff(parseId((await params).id));
  const description = plainText(s.description, 160);
  return {
    title: s.name.full,
    description,
    openGraph: { title: s.name.full, description, images: [{ url: s.image.large }] },
  };
}

export default async function StaffPage({ params }: PageProps) {
  const s = await getStaff(parseId((await params).id));
  const { t, locale } = await getI18n();

  const voiceRoles = s.characterMedia.edges
    .filter((e) => e.node.type !== 'MANGA' && !e.node.isAdult)
    .flatMap((e) => e.characters.map((c) => ({ key: `${e.id}-${c.id}`, character: c, media: e.node, role: e.characterRole })));

  // Merge multiple staff roles on the same anime into one card.
  const staffMap = new Map<number, { media: (typeof s.staffMedia.edges)[number]['node']; roles: string[] }>();
  for (const e of s.staffMedia.edges) {
    if (e.node.isAdult) continue;
    const item = staffMap.get(e.node.id) ?? { media: e.node, roles: [] };
    item.roles.push(e.staffRole);
    staffMap.set(e.node.id, item);
  }
  const staffRoles = [...staffMap.values()];

  const active = s.yearsActive?.length ? `${s.yearsActive[0]}${s.yearsActive[1] ? ` – ${s.yearsActive[1]}` : ` – ${t('present')}`}` : null;

  return (
    <div className="pb-4 pt-2">
      <PersonHero
        image={s.image.large}
        name={s.name.full}
        native={s.name.native}
        alternative={s.name.alternative}
        favourites={compactNumber(s.favourites, locale)}
        description={s.description}
        siteUrl={s.siteUrl}
        labels={{ favorites: t('favorites'), alsoKnown: t('alternativeNames'), viewOnAniList: t('viewOnAniList') }}
        facts={[
          [t('occupations'), s.primaryOccupations?.join(', ')],
          [t('language'), label.language(s.languageV2, locale)],
          [t('birthday'), formatBirthday(s.dateOfBirth, locale)],
          [t('age'), s.age],
          [t('gender'), label.gender(s.gender, locale)],
          [t('yearsActive'), active],
          [t('hometown'), s.homeTown],
          [t('bloodType'), s.bloodType],
          [t('died'), formatFuzzyDate(s.dateOfDeath, locale)],
        ]}
      />

      {voiceRoles.length > 0 && (
        <section className="mb-14">
          <h2 className="section-heading mb-5">
            <span className="bar" />
            {t('voiceRoles')}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {voiceRoles.map(({ key, character, media, role }) => (
              <div key={key} className="anime-card" style={{ '--card-accent': hexToRgb(media.coverImage.color) } as React.CSSProperties}>
                <Link href={`/character/${character.id}`} className="block">
                  <div className="poster">
                    <Image src={character.image.large} alt={character.name.full} fill sizes="(max-width: 640px) 46vw, 200px" className="object-cover" />
                    <span className="absolute left-2 top-2 z-10 border-2 border-ink bg-pop-yellow px-1.5 py-0.5 text-[10px] font-bold">
                      {label.role(role, locale)}
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-1 text-sm font-bold"><span className="card-title">{character.name.full}</span></h3>
                </Link>
                <Link href={`/anime/${media.id}`} className="mt-1.5 flex items-center gap-2 text-xs text-fg-3 hover:bg-pop-yellow">
                  <span className="relative h-8 w-6 shrink-0 overflow-hidden ">
                    <Image src={media.coverImage.medium} alt="" fill sizes="24px" className="object-cover" />
                  </span>
                  <span className="line-clamp-2 leading-snug">{titleOf(media.title)}</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {staffRoles.length > 0 && (
        <section>
          <h2 className="section-heading mb-5">
            <span className="bar" />
            {t('staffRoles')}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {staffRoles.map(({ media, roles }) => (
              <Link
                key={media.id}
                href={`/anime/${media.id}`}
                className="anime-card"
                style={{ '--card-accent': hexToRgb(media.coverImage.color) } as React.CSSProperties}
              >
                <div className="poster">
                  <Image src={media.coverImage.large} alt={titleOf(media.title)} fill sizes="(max-width: 640px) 46vw, 200px" className="object-cover" />
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug"><span className="card-title">{titleOf(media.title)}</span></h3>
                <p className="mt-1 line-clamp-2 text-xs text-fg-3">{roles.join(', ')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
