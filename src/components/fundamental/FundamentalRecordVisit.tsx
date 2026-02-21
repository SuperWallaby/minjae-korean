"use client";

import { useEffect } from "react";

import { useFundamentalProgress } from "./useFundamentalProgress";

export function FundamentalRecordVisit({ chapterId }: { chapterId: string }) {
  const { markVisited } = useFundamentalProgress();
  useEffect(() => {
    markVisited(chapterId);
  }, [chapterId, markVisited]);
  return null;
}
