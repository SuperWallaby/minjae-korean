import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./home-blog.module.css";

type Props = {
  children: React.ReactNode;
  /**
   * Legacy Tailwind max-width class. Applied as real CSS max-width
   * (Tailwind arbitrary utilities are unreliable here).
   */
  containerClassName?: string;
  /** White card around children. Default false. */
  card?: boolean;
  className?: string;
};

function maxWidthFromClass(className?: string): string | undefined {
  if (!className) return undefined;
  if (className.includes("58rem")) return "58rem";
  if (className.includes("max-w-6xl")) return "72rem";
  if (className.includes("max-w-5xl")) return "64rem";
  if (className.includes("max-w-4xl")) return "56rem";
  if (className.includes("max-w-3xl")) return "48rem";
  if (className.includes("max-w-2xl")) return "42rem";
  if (className.includes("max-w-xl")) return "36rem";
  return undefined;
}

/** Medium-style white inner page used by subscribe, legal, quiz, etc. */
export function BlogInnerPage({
  children,
  containerClassName,
  card = false,
  className,
}: Props) {
  const maxWidth = maxWidthFromClass(containerClassName);
  return (
    <div className={cn(styles.innerPage, className)}>
      <div
        className={styles.column}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {card ? <div className={styles.articleCard}>{children}</div> : children}
      </div>
    </div>
  );
}
