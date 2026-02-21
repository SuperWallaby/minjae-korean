"use client";

import { useEffect } from "react";
import type { FundamentalSection } from "@/data/fundamentalTypes";

import { FundamentalChapterCard } from "./FundamentalChapterCard";
import { useFundamentalProgress } from "./useFundamentalProgress";

type Props = {
  sections: FundamentalSection[];
};

export function FundamentalChapterListClient({ sections }: Props) {
  const { getProgress, isVisited } = useFundamentalProgress();

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
                <FundamentalChapterCard
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
