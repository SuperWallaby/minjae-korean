"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  freeKoreanClassPath,
  isFreeKoreanClassPath,
  isPronounceKoreanPath,
} from "@/lib/trial/localhostOnly";
import styles from "./MinjaeTrialBanner.module.css";

type Surface = "kaja" | "pronounce";

export function MinjaeTrialBanner({ surface }: { surface: Surface }) {
  const pathname = usePathname() || "/";
  const titleId = useId();
  const [open, setOpen] = useState(true);

  const allowed =
    !isFreeKoreanClassPath(pathname) &&
    (surface !== "pronounce" || isPronounceKoreanPath(pathname));

  if (!allowed || !open) return null;

  return (
    <aside className={styles.banner} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id={titleId} className={styles.title}>
            30-minute free trial
          </h2>
          <p>
            Learn Korean 1-on-1 with Minjae. Try your first 30-minute Korean
            lesson for free. After the trial, tutoring is $5 per session.
          </p>
        </div>
        <Link className={styles.more} href={freeKoreanClassPath(surface)}>
          Learn more
        </Link>
        <button
          type="button"
          className={styles.close}
          aria-label="Dismiss"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>
    </aside>
  );
}
