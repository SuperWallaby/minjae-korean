"use client";

import { useEffect } from "react";

import { useGrammarProgress } from "./useGrammarProgress";

export function GrammarRecordVisit({ chapterId }: { chapterId: string }) {
  const { markVisited } = useGrammarProgress();
  useEffect(() => {
    markVisited(chapterId);
  }, [chapterId, markVisited]);
  return null;
}
