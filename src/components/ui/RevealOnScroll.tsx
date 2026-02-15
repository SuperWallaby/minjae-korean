"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type RevealOnScrollProps<E extends React.ElementType> = {
  as?: E;
  className?: string;
  children: React.ReactNode;
  /** Reveal only once (default: true) */
  once?: boolean;
  /** IntersectionObserver threshold (default: 0.12) */
  threshold?: number;
  /** Root margin (default: "0px 0px -10% 0px") */
  rootMargin?: string;
  /** Transition delay in ms */
  delayMs?: number;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | "className" | "children">;

export function RevealOnScroll<E extends React.ElementType = "div">(
  props: RevealOnScrollProps<E>,
) {
  const {
    as,
    className,
    children,
    once = true,
    threshold = 0.12,
    rootMargin = "0px 0px -10% 0px",
    delayMs = 0,
    ...rest
  } = props;

  const Comp = (as ?? "div") as React.ElementType;
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Respect reduced motion.
    if (typeof window !== "undefined") {
      try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setVisible(true);
          return;
        }
      } catch {
        // ignore
      }
    }

    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) {
          if (!cancelled) setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          if (!cancelled) setVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    obs.observe(el);
    return () => {
      cancelled = true;
      obs.disconnect();
    };
  }, [once, rootMargin, threshold]);

  return (
    <Comp
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={(node: any) => {
        ref.current = node;
      }}
      className={cn(
        "will-change-transform will-change-opacity transition duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
      style={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(rest as any).style,
        transitionDelay: delayMs ? `${delayMs}ms` : undefined,
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

