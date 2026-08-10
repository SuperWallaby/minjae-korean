import Link from "next/link";

import type { IgListSeoPage } from "@/lib/igList/seoTypes";
import { igListPath } from "@/lib/igList/seo";

export function IgListSeoHubCard({ page }: { page: IgListSeoPage }) {
  const href = igListPath(page.setId, page.slug);
  const phrases = page.cards
    .filter((c) => c.kind !== "cover" && c.hangul)
    .slice(0, 4)
    .map((c) => c.hangul)
    .join(" · ");

  return (
    <Link
      href={href}
      className="flex gap-4 px-4 py-4 transition hover:bg-[var(--quiz-surface-muted)] sm:px-5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={page.coverThumbUrl || page.coverUrl}
        alt=""
        width={72}
        height={90}
        className="h-[90px] w-[72px] shrink-0 rounded-xl border border-[var(--quiz-border)] object-cover bg-[var(--quiz-canvas)]"
        loading="lazy"
        decoding="async"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-[var(--quiz-text)]">
          {page.titleEn}
        </span>
        <span className="mt-1 block text-sm text-[var(--quiz-text-sub)] line-clamp-2">
          {phrases || page.intro}
        </span>
      </span>
    </Link>
  );
}

export function IgListSeoArticle({ page }: { page: IgListSeoPage }) {
  const body = page.cards.filter((c) => c.kind !== "cover" && c.hangul);

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text-muted)]">
          Korean phrase list
          {page.mascotFamily ? ` · ${page.mascotFamily}` : ""}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
          {page.titleEn}
        </h1>
        {page.intro ? (
          <p className="max-w-2xl text-base leading-relaxed text-[var(--quiz-text-sub)]">
            {page.intro}
          </p>
        ) : null}
      </header>

      <figure className="overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.coverUrl}
          alt={page.imageAlt}
          width={1080}
          height={1350}
          className="mx-auto w-full max-w-md object-contain bg-[var(--quiz-canvas)]"
          loading="eager"
          decoding="async"
        />
        <figcaption className="border-t border-[var(--quiz-border)] px-4 py-3 text-center text-sm text-[var(--quiz-text-sub)]">
          {page.title}
        </figcaption>
      </figure>

      {body.length > 0 ? (
        <section className="space-y-4" aria-labelledby="ig-list-phrases">
          <h2
            id="ig-list-phrases"
            className="text-lg font-semibold text-[var(--quiz-text)]"
          >
            Phrases in this list
          </h2>
          <ol className="divide-y divide-[var(--quiz-border)] overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
            {body.map((card, i) => (
              <li key={`${card.file}-${i}`} className="flex gap-4 p-4 sm:p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt=""
                  width={96}
                  height={120}
                  className="h-[120px] w-[96px] shrink-0 rounded-xl border border-[var(--quiz-border)] object-cover bg-[var(--quiz-canvas)]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-semibold text-[var(--quiz-text-muted)]">
                    {i + 1}
                  </p>
                  <p className="text-xl font-bold text-[var(--quiz-text)]">
                    {card.hangul}
                  </p>
                  {card.romanization ? (
                    <p className="text-sm text-[var(--quiz-text-muted)]">
                      {card.romanization}
                    </p>
                  ) : null}
                  <p className="text-base font-medium text-[var(--quiz-text)]">
                    {card.english}
                  </p>
                  {card.blurb ? (
                    <p className="pt-1 text-sm leading-relaxed text-[var(--quiz-text-sub)]">
                      {card.blurb}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="text-sm text-[var(--quiz-text-muted)]">
        Capybara character designed by{" "}
        <a
          href="https://www.instagram.com/chico._.pu"
          className="underline underline-offset-2 hover:text-[var(--quiz-text)]"
          target="_blank"
          rel="noreferrer"
        >
          점점이 (@chico._.pu)
        </a>
        .
      </p>
    </article>
  );
}

export function IgListSeoRelated({ pages }: { pages: IgListSeoPage[] }) {
  if (!pages.length) return null;
  return (
    <section className="space-y-4" aria-labelledby="ig-list-related">
      <h2
        id="ig-list-related"
        className="text-lg font-semibold text-[var(--quiz-text)]"
      >
        More phrase lists
      </h2>
      <div className="overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] divide-y divide-[var(--quiz-border)]">
        {pages.map((page) => (
          <IgListSeoHubCard key={page.setId} page={page} />
        ))}
      </div>
    </section>
  );
}
