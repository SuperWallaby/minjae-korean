import Image from "next/image";
import Link from "next/link";

import { whenToUsePath } from "@/lib/whenToUse/slug";

export type WhenToUseRelatedItem = {
  id: string;
  slug: string;
  korean: string;
  english: string;
  imageUrl: string;
  imageAlt: string;
  comparePath?: string;
};

type Props = {
  items: WhenToUseRelatedItem[];
};

export function WhenToUseRelated({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="when-to-use-related">
      <h2
        id="when-to-use-related"
        className="text-lg font-semibold text-[var(--quiz-text)]"
      >
        Related words
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-3"
          >
            <Link
              href={whenToUsePath(item.id, item.slug)}
              className="flex gap-3 transition-opacity hover:opacity-90"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)]">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  sizes="64px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--quiz-text)]">
                  {item.english}
                </p>
                <p className="text-sm text-[var(--quiz-text-sub)]">{item.korean}</p>
              </div>
            </Link>
            {item.comparePath ? (
              <Link
                href={item.comparePath}
                className="mt-2 inline-block text-xs font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
              >
                Compare with this word
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
