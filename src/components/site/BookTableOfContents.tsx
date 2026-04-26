import {
  BOOK_SELECTION_CRITERIA,
  BOOK_SELECTION_CRITERIA_INTRO,
  BOOK_TOC_PARTS,
  BOOK_TOC_SUBTITLE,
  wordNumberForPart,
} from "@/data/bookTableOfContents";
import { cn } from "@/lib/utils";

export function BookTableOfContents({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-4xl border border-border bg-card px-6 py-8 shadow-(--shadow-card) sm:px-10 sm:py-10",
        className
      )}
    >
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
        Table of contents
      </div>
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        Korean, Beyond Translation
      </h2>
      <p className="mt-2 text-base leading-7 text-muted-foreground sm:text-lg">
        {BOOK_TOC_SUBTITLE}
      </p>

      <div className="mt-10 divide-y divide-border/80">
        {BOOK_TOC_PARTS.map((part, partIndex) => (
          <div key={part.id} className="py-8 first:pt-2 last:pb-0">
            <h3 className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {part.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
              {part.intro}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-foreground sm:text-[0.9375rem]">
              {part.words.map((word, wordIndex) => (
                <li
                  key={`${part.id}-${wordIndex}`}
                  className="rounded-md bg-muted/50 px-2 py-1 font-medium tabular-nums"
                >
                  <span className="text-muted-foreground">
                    {wordNumberForPart(partIndex, wordIndex)}.
                  </span>{" "}
                  {word}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-10">
        <p className="text-base font-semibold text-foreground">
          {BOOK_SELECTION_CRITERIA_INTRO}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          How each entry earned a place in the 100:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-7 text-muted-foreground sm:text-base">
          {BOOK_SELECTION_CRITERIA.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
