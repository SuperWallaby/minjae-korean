"use client";

import { useEffect } from "react";
import type { GrammarSection } from "@/data/grammarTypes";

import { GrammarChapterCard } from "./GrammarChapterCard";
import { useGrammarProgress } from "./useGrammarProgress";

type Props = {
  sections: GrammarSection[];
};

export function GrammarChapterListClient({ sections }: Props) {
  const { getProgress, isVisited } = useGrammarProgress();

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash?.slice(1) : "";
    if (hash && document.getElementById(hash)) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="mt-10 space-y-8">
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} id={section.anchor ?? undefined}>
            <h2 className="font-serif text-base font-semibold tracking-tight text-muted-foreground sm:text-lg">
              {section.displayTitle}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.chapters.map((chapter) => (
                <GrammarChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  progress={getProgress(chapter.id)}
                  isVisited={isVisited(chapter.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
