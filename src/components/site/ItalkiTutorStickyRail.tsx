"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  getAffiliateTutorCreative,
  pickAffiliateTutorPartner,
  type AffiliateTutorPartner,
} from "@/lib/affiliateTutor";

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
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function measureLeftGutter(): number {
  const el = document.querySelector(".site-container");
  if (!el) return 0;
  return el.getBoundingClientRect().left;
}

export function ItalkiTutorStickyRail() {
  const pathname = usePathname();
  const [hasRoom, setHasRoom] = React.useState(false);
  const [partner, setPartner] = React.useState<AffiliateTutorPartner | null>(
    null,
  );

  React.useEffect(() => {
    setPartner(pickAffiliateTutorPartner());
  }, []);

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

  if (shouldSkipPath(pathname) || !hasRoom || !partner) return null;

  const creative = getAffiliateTutorCreative(partner);

  return (
    <aside
      className={styles.rail}
      aria-label="Find a Korean tutor — affiliate offer"
      data-affiliate={partner}
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
