import Link from "next/link";

import type { VocabSeoPage } from "@/lib/vocabInfographic/seoTypes";
import { vocabSeoPath } from "@/lib/vocabInfographic/seo";
import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";
import { VocabSeoPlayButton } from "@/components/vocab-infographic/VocabSeoPlayButton";

export function VocabSeoHubCard({ page }: { page: VocabSeoPage }) {
  const href = vocabSeoPath(page.bundleId, page.slug);
  return (
    <Link
      href={href}
      className="flex gap-4 px-4 py-4 transition hover:bg-[var(--quiz-surface-muted)] sm:px-5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={page.imageThumbUrl || page.imageUrl}
        alt=""
        width={72}
        height={72}
        className="h-[72px] w-[72px] shrink-0 rounded-xl border border-[var(--quiz-border)] object-cover bg-[var(--quiz-canvas)]"
        loading="lazy"
        decoding="async"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-[var(--quiz-text)]">
          {page.titleEn}
        </span>
        <span className="mt-1 block text-sm text-[var(--quiz-text-sub)] line-clamp-2">
          {page.words.length > 0
            ? page.words
                .slice(0, 4)
                .map((w) => w.hangul)
                .join(" · ")
            : page.intro}
        </span>
      </span>
    </Link>
  );
}

export function VocabSeoArticle({ page }: { page: VocabSeoPage }) {
  const playHref = vocabQuizPlayPath(`vocab-${page.slug}`);
  const explanation = page.explanationEn?.trim() || "";
  const examples = page.examples?.filter((ex) => ex.korean && ex.english) ?? [];

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text-muted)]">
          {page.format.replace(/_/g, " ")}
          {page.tags.length > 0 ? ` · ${page.tags.slice(0, 3).join(", ")}` : ""}
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
          src={page.imageUrl}
          alt={page.imageAlt}
          width={1024}
          height={1024}
          className="mx-auto w-full max-w-xl object-contain bg-[var(--quiz-canvas)]"
          loading="eager"
          decoding="async"
        />
        <figcaption className="border-t border-[var(--quiz-border)] px-4 py-3 text-center text-sm text-[var(--quiz-text-sub)]">
          {page.title}
        </figcaption>
      </figure>

      {explanation ? (
        <section className="space-y-3" aria-labelledby="vocab-explain">
          <h2
            id="vocab-explain"
            className="text-lg font-semibold text-[var(--quiz-text)]"
          >
            How these words work together
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--quiz-text-sub)]">
            {explanation}
          </p>
        </section>
      ) : null}

      {page.words.length > 0 ? (
        <section className="space-y-4" aria-labelledby="vocab-words">
          <h2
            id="vocab-words"
            className="text-lg font-semibold text-[var(--quiz-text)]"
          >
            Words in this chart
          </h2>
          <div className="overflow-hidden rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] text-[var(--quiz-text-muted)]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Korean</th>
                  <th className="px-4 py-2.5 font-semibold">Romanization</th>
                  <th className="px-4 py-2.5 font-semibold">English</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--quiz-border)]">
                {page.words.map((w) => (
                  <tr key={`${w.hangul}-${w.english}`}>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-base font-semibold text-[var(--quiz-text)]">
                        {w.hangul}
                        {w.ttsUrl ? (
                          <VocabSeoPlayButton
                            src={w.ttsUrl}
                            label={`Play pronunciation of ${w.hangul}`}
                          />
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--quiz-text-sub)]">
                      {w.romanization || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--quiz-text-sub)]">
                      {w.english}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {examples.length > 0 ? (
        <section className="space-y-4" aria-labelledby="vocab-examples">
          <h2
            id="vocab-examples"
            className="text-lg font-semibold text-[var(--quiz-text)]"
          >
            Example sentences
          </h2>
          <ol className="space-y-4">
            {examples.map((example, index) => (
              <li
                key={`${example.korean}-${index}`}
                className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-[var(--quiz-text)]">
                      {example.korean}
                    </p>
                    <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
                      {example.english}
                    </p>
                  </div>
                  {example.ttsUrl ? (
                    <VocabSeoPlayButton
                      src={example.ttsUrl}
                      label={`Play example ${index + 1}`}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-5 py-5">
        <p className="text-sm text-[var(--quiz-text-sub)]">
          Practice these words in context?{" "}
          <Link
            href={playHref}
            className="font-semibold text-[var(--quiz-primary)] underline-offset-2 hover:underline"
          >
            Open the vocab quiz
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
