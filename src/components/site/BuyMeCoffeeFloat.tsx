"use client";

import { Coffee } from "lucide-react";

import styles from "./buy-me-coffee-float.module.css";

const BMC_URL = "https://buymeacoffee.com/kajakorean";

/** Tiny floating coffee button — bottom-right. */
export function BuyMeCoffeeFloat() {
  return (
    <a
      href={BMC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.float}
      aria-label="Buy me a coffee"
      title="Buy me a coffee"
    >
      <Coffee className="size-4" strokeWidth={2.25} aria-hidden />
    </a>
  );
}
