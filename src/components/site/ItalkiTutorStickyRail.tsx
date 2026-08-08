"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { getAffiliateTutorCreative } from "@/lib/affiliateTutor";

import styles from "./italki-tutor-sticky.module.css";

/** Square sticky width (~168px) + edge padding. */
const MIN_LEFT_GUTTER_PX = 196;

const SKIP_PREFIXES = [
  "/admin",
  "/login",
  "/account",
  "/payment",
  "/en/payment",
  "/call",
  "/booking",
  "/join",
  "/subscribe",
  "/support",
] as const;

function shouldSkipPath(pathname: string): boolean {
  // Home already has the Find Tutor section — no sticky rail there.
  if (pathname === "/") return true;
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function measureLeftGutter(): number {
  const el = document.querySelector(".site-container");
  if (!el) return 0;
  return el.getBoundingClientRect().left;
}

/** Left sticky rail always uses italki ($10 OFF creative), not Preply. */
export function ItalkiTutorStickyRail() {
  const pathname = usePathname();
  const [hasRoom, setHasRoom] = React.useState(false);

  React.useEffect(() => {
    if (shouldSkipPath(pathname)) {
      setHasRoom(false);
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setHasRoom(measureLeftGutter() >= MIN_LEFT_GUTTER_PX);
      });
    };

    update();
    window.addEventListener("resize", update);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    const container = document.querySelector(".site-container");
    if (container && ro) ro.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [pathname]);

  if (shouldSkipPath(pathname) || !hasRoom) return null;

  const creative = getAffiliateTutorCreative("italki");

  return (
    <aside
      className={styles.rail}
      aria-label="Find a Korean tutor on italki — $10 OFF"
      data-affiliate="italki"
    >
      <a
        href={creative.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={styles.link}
      >
        <Image
          src={creative.square.src}
          alt={creative.alt}
          width={creative.square.width}
          height={creative.square.height}
          className={styles.image}
          sizes="168px"
        />
      </a>
    </aside>
  );
}
