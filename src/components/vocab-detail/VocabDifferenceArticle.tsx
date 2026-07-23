import Image from "next/image";
import Link from "next/link";

import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";
import type { VocabCompareListItem, VocabComparePage } from "@/lib/vocabCompare/types";
import { vocabDifferencePath } from "@/lib/vocabDetail/slug";

type Props = {
  page: VocabComparePage;
};

function WordPanel({
  korean,
  english,
  imageUrl,
  imageAlt,
  explanation,
}: {
  korean: string;
  english: string;
  imageUrl: string;
  imageAlt: string;
  explanation: string;
}) {
  return (
    <figure className="overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={imageAlt}
        width={640}
        height={640}
        className="aspect-square w-full object-contain bg-[var(--quiz-canvas)]"
        loading="eager"
        decoding="async"
      />
      <figcaption className="space-y-2 border-t border-[var(--quiz-border)] px-4 py-4">
        <p className="text-lg font-semibold text-[var(--quiz-text)]">
          {korean}
          <span className="ml-2 text-sm font-medium text-[var(--quiz-text-sub)]">
            {english}
          </span>
        </p>
        <p className="text-sm leading-relaxed text-[var(--quiz-text-sub)] line-clamp-4">
          {explanation}
        </p>
      </figcaption>
    </figure>
  );
}

export function VocabDifferenceArticle({ page }: Props) {
  const playHref = vocabQuizPlayPath(`vocab-difference-${page.slug}`);

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
          {page.titleEn}
        </h1>
        <p className="text-base text-[var(--quiz-text-sub)]">
          {page.left.korean}
          <span className="mx-2 text-[var(--quiz-text-muted)]">·</span>
          {page.right.korean}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <WordPanel
          korean={page.left.korean}
          english={page.left.english}
          imageUrl={page.left.imageUrl}
          imageAlt={page.left.imageAlt}
          explanation={page.left.explanation}
        />
        <WordPanel
          korean={page.right.korean}
          english={page.right.english}
          imageUrl={page.right.imageUrl}
          imageAlt={page.right.imageAlt}
          explanation={page.right.explanation}
        />
      </div>

      <section className="space-y-3" aria-labelledby="vocab-difference-body">
        <h2
          id="vocab-difference-body"
          className="text-lg font-semibold text-[var(--quiz-text)]"
        >
          The difference
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--quiz-text-sub)] whitespace-pre-wrap">
          {page.contrast}
        </p>
      </section>

      <aside className="rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] px-5 py-5">
        <p className="text-sm font-semibold text-[var(--quiz-text)]">
          Practice with a picture quiz
        </p>
        <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
          Same illustrations in the free vocab quiz — listen, pick the answer, keep going.
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

export function VocabDifferenceHubCard(props: VocabCompareListItem) {
  return (
    <Link
      href={vocabDifferencePath(props.leftId, props.rightId, props.slug)}
      className="flex gap-4 px-4 py-4 transition-colors hover:bg-[var(--quiz-surface-muted)]"
    >
      <div className="flex shrink-0 gap-1">
        <div className="relative size-14 overflow-hidden rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)]">
          <Image
            src={props.left.imageUrl}
            alt={props.left.imageAlt}
            fill
            sizes="56px"
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="relative size-14 overflow-hidden rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)]">
          <Image
            src={props.right.imageUrl}
            alt={props.right.imageAlt}
            fill
            sizes="56px"
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[var(--quiz-text)]">{props.titleEn}</p>
        <p className="mt-0.5 text-sm text-[var(--quiz-text-sub)]">
          {props.left.korean}
          <span className="text-[var(--quiz-text-muted)]"> · </span>
          {props.right.korean}
        </p>
      </div>
    </Link>
  );
}
