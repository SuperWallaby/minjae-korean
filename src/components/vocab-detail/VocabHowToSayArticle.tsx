import Image from "next/image";
import Link from "next/link";

import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";
import type { WhenToUsePage } from "@/lib/whenToUse/types";
import { vocabHowToSayPath } from "@/lib/vocabDetail/slug";

type Props = {
  page: WhenToUsePage;
};

export function VocabHowToSayArticle({ page }: Props) {
  const playHref = vocabQuizPlayPath(`vocab-how-to-say-${page.slug}`);

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
          {page.titleEn}
        </h1>
        <p className="text-base text-[var(--quiz-text-sub)]">
          Korean:{" "}
          <span className="font-semibold text-[var(--quiz-text)]">{page.korean}</span>
          {page.romanization ? (
            <span className="ml-2 font-mono text-sm">{page.romanization}</span>
          ) : null}
        </p>
      </header>

      <figure className="overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.imageUrl}
          alt={page.imageAlt}
          width={640}
          height={640}
          className="mx-auto aspect-square w-full max-w-md object-contain bg-[var(--quiz-canvas)]"
          loading="eager"
          decoding="async"
        />
        <figcaption className="border-t border-[var(--quiz-border)] px-4 py-3 text-center text-sm text-[var(--quiz-text-sub)]">
          {page.english} — {page.korean}
          {page.answerTtsUrl ? (
            <audio
              className="mx-auto mt-3 block w-full max-w-sm"
              controls
              preload="none"
              src={page.answerTtsUrl}
            >
              <track kind="captions" />
            </audio>
          ) : null}
        </figcaption>
      </figure>

      <section className="space-y-3" aria-labelledby="vocab-how-to-say-meaning">
        <h2
          id="vocab-how-to-say-meaning"
          className="text-lg font-semibold text-[var(--quiz-text)]"
        >
          Meaning
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--quiz-text-sub)] whitespace-pre-wrap">
          {page.explanation}
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="vocab-how-to-say-examples">
        <h2
          id="vocab-how-to-say-examples"
          className="text-lg font-semibold text-[var(--quiz-text)]"
        >
          Example sentences
        </h2>
        <ol className="space-y-4">
          {page.examples.map((example, index) => (
            <li
              key={`${example.korean}-${index}`}
              className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-4"
            >
              <p className="text-lg font-semibold text-[var(--quiz-text)]">
                {example.korean}
              </p>
              <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
                {example.english}
              </p>
              {example.ttsUrl ? (
                <audio
                  className="mt-3 w-full max-w-md"
                  controls
                  preload="none"
                  src={example.ttsUrl}
                >
                  <track kind="captions" />
                </audio>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <aside className="rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] px-5 py-5">
        <p className="text-sm font-semibold text-[var(--quiz-text)]">
          Practice with a picture quiz
        </p>
        <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
          See this word in the free vocab quiz — listen, pick the answer, and keep going.
        </p>
        <Link
          href={playHref}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--quiz-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          More Quiz
        </Link>
      </aside>
    </article>
  );
}

type HubCardProps = {
  id: string;
  slug: string;
  titleEn: string;
  korean: string;
  english: string;
  imageUrl: string;
  imageAlt: string;
};

export function VocabHowToSayHubCard(props: HubCardProps) {
  return (
    <Link
      href={vocabHowToSayPath(props.id, props.slug)}
      className="flex gap-4 px-4 py-4 transition-colors hover:bg-[var(--quiz-surface-muted)]"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)]">
        <Image
          src={props.imageUrl}
          alt={props.imageAlt}
          fill
          sizes="64px"
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[var(--quiz-text)]">{props.titleEn}</p>
        <p className="mt-0.5 text-sm text-[var(--quiz-text-sub)]">
          {props.korean}
          <span className="text-[var(--quiz-text-muted)]"> · {props.english}</span>
        </p>
      </div>
    </Link>
  );
}
