"use client";

import * as React from "react";
import {
  formatNewsDate,
  formatNewsDateAbsolute,
} from "@/lib/levelDisplay";

type Props = {
  iso?: string;
  className?: string;
};

/**
 * SSR/하이드레이션 시에는 절대 날짜를 보여 주고,
 * 마운트 후에는 방문자 기준 "지금"으로 "Today" / "X days ago" 표시.
 * (빌드 시점이 아닌 방문 시점 기준으로 표시되도록 함)
 */
export function RelativeDate({ iso, className }: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const text = !iso
    ? ""
    : mounted
      ? formatNewsDate(iso)
      : formatNewsDateAbsolute(iso);
  if (!text) return null;
  return <span className={className}>{text}</span>;
}
