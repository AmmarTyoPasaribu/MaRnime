import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCharacter, parseId } from '@/lib/anilist/server';
import { getI18n } from '@/lib/i18n/server';
import { label } from '@/lib/i18n/labels';
import { compactNumber, formatBirthday, hexToRgb, plainText, titleOf } from '@/lib/utils';
import PersonHero from '@/components/person/PersonHero';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const c = await getCharacter(parseId((await params).id));
  const description = plainText(c.description, 160);
  return {
    title: c.name.full,
    description,
    openGraph: { title: c.name.full, description, images: [{ url: c.image.large }] },
  };
}

export default async function CharacterPage({ params }: PageProps) {
  const c = await getCharacter(parseId((await params).id));
  const { t, locale } = await getI18n();
  const edges = c.media.edges.filter((e) => !e.node.isAdult);

  return (
    <div className="pb-4 pt-2">
      <PersonHero
        image={c.image.large}
        name={c.name.full}
        native={c.name.native}
        alternative={c.name.alternative}
        favourites={compactNumber(c.favourites, locale)}
        description={c.description}
        siteUrl={c.siteUrl}
        labels={{ favorites: t('favorites'), alsoKnown: t('alternativeNames'), viewOnAniList: t('viewOnAniList') }}
        facts={[
          [t('gender'), label.gender(c.gender, locale)],
          [t('age'), c.age],
          [t('birthday'), formatBirthday(c.dateOfBirth, locale)],
          [t('bloodType'), c.bloodType],
        ]}
      />

      {edges.length > 0 && (
        <section>
          <h2 className="section-heading mb-5">
            <span className="bar" />
            {t('appearances')}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {edges.map((e) => {
              const va = e.voiceActors.find((v) => v.languageV2 === 'Japanese') ?? e.voiceActors[0];
              return (
                <div key={e.id} className="anime-card" style={{ '--card-accent': hexToRgb(e.node.coverImage.color) } as React.CSSProperties}>
                  <Link href={`/anime/${e.node.id}`} className="block">
                    <div className="poster">
                      <Image src={e.node.coverImage.large} alt={titleOf(e.node.title)} fill sizes="(max-width: 640px) 46vw, 200px" className="object-cover" />
                      <span className="absolute left-2 top-2 z-10 border-2 border-ink bg-pop-yellow px-1.5 py-0.5 text-[10px] font-bold">
                        {label.role(e.characterRole, locale)}
                      </span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug"><span className="card-title">{titleOf(e.node.title)}</span></h3>
                    <p className="mt-1 text-xs text-fg-3">
                      {[label.format(e.node.format, locale), e.node.seasonYear].filter(Boolean).join(' · ')}
                    </p>
                  </Link>
                  {va && (
                    <Link href={`/staff/${va.id}`} className="mt-2 flex items-center gap-2 text-xs text-fg-2 hover:bg-pop-yellow">
                      <span className="relative h-6 w-6 shrink-0 overflow-hidden border-2 border-ink">
                        <Image src={va.image.medium} alt="" fill sizes="24px" className="object-cover" />
                      </span>
                      <span className="truncate">{va.name.full}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
