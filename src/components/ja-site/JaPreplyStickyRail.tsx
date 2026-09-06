"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { globalGoPath } from "@/lib/globalSite/affiliate";
import { trackAffiliateClick } from "@/lib/ga";

import styles from "./ja-preply-sticky.module.css";

const SKIP = new Set(["/go/preply", "/go/italki"]);
const MIN_LEFT_GUTTER_PX = 176;

export function JaPreplyStickyRail() {
  const pathname = usePathname();
  const [hasRoom, setHasRoom] = React.useState(false);

  React.useEffect(() => {
    if (SKIP.has(pathname)) {
      setHasRoom(false);
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = document.querySelector(".global-shell.global-main");
        setHasRoom((el?.getBoundingClientRect().left ?? 0) >= MIN_LEFT_GUTTER_PX);
      });
    };

    update();
    window.addEventListener("resize", update);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    const main = document.querySelector(".global-shell.global-main");
    if (main && ro) ro.observe(main);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [pathname]);

  if (SKIP.has(pathname) || !hasRoom) return null;

  const href = globalGoPath("preply", { lang: "en-ja" });

  return (
    <aside
      className={styles.rail}
      aria-label="Preplyで英語講師を予約 — 初回50% OFF"
      data-affiliate="preply"
    >
      <a
        href={href}
        className={styles.link}
        data-placement="ja_sticky_rail"
        onClick={() =>
          trackAffiliateClick({ partner: "preply", placement: "sticky_rail" })
        }
      >
        <Image
          src="/brand/affiliate/preply-en-tutor-300x600.webp"
          alt="Preply — Learn English with a live tutor. Book a lesson, 50% off"
          width={300}
          height={600}
          className={styles.image}
          sizes="152px"
        />
      </a>
    </aside>
  );
}
