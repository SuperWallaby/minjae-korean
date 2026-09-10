import type { ReactNode } from "react";
import styles from "./Quoter.module.css";

type Props = { children: ReactNode; className?: string };

/**
 * Medium pull-quote: large light sans, muted gray, left rule.
 * (Not body-size serif — that reads as a random bordered paragraph.)
 */
export function Quoter({ children, className = "" }: Props) {
  return (
    <blockquote className={`${styles.quote}${className ? ` ${className}` : ""}`}>
      {children}
    </blockquote>
  );
}
