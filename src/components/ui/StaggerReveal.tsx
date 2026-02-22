"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type StaggerRevealProps<E extends React.ElementType> = {
  as?: E;
  className?: string;
  children: React.ReactNode;
  /** Reveal only once (default: true) */
  once?: boolean;
  /** IntersectionObserver threshold (default: 0.12) */
  threshold?: number;
  /** Root margin (default: "0px 0px -10% 0px") */
  rootMargin?: string;
  /** Base delay before first item reveals (ms) */
  delayMs?: number;
  /** Delay between items (ms) */
  staggerMs?: number;
  /** Transition duration (ms) */
  durationMs?: number;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | "className" | "children">;

function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (child == null || child === false) return;
    if (
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      child.type === React.Fragment
    ) {
      out.push(...flattenChildren(child.props.children));
      return;
    }
    out.push(child);
  });
  return out;
}

export function StaggerReveal<E extends React.ElementType = "div">(
  props: StaggerRevealProps<E>,
) {
  const {
    as,
    className,
    children,
    once = true,
    threshold = 0.12,
    rootMargin = "0px 0px -10% 0px",
    delayMs = 0,
    staggerMs = 90,
    durationMs = 700,
    ...rest
  } = props;

  const id = React.useId();
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

  const flat = React.useMemo(() => flattenChildren(children), [children]);

  return (
    <Comp
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={className}
      {...rest}
    >
      {flat.map((child, idx) => {
        const itemClass = cn(
          "will-change-transform will-change-opacity transition ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        );
        const itemStyle: React.CSSProperties = {
          transitionDelay: `${Math.max(0, delayMs + idx * staggerMs)}ms`,
          transitionDuration: `${Math.max(0, durationMs)}ms`,
        };

        if (React.isValidElement(child)) {
          const el =
            child as React.ReactElement<{
              className?: string;
              style?: React.CSSProperties;
            }>;
          const prevClass = el.props.className;
          const prevStyle = el.props.style;
          return React.cloneElement(el, {
            key: el.key ?? `${id}-${idx}`,
            className: cn(itemClass, prevClass),
            style: { ...itemStyle, ...prevStyle },
          });
        }

        // Fallback for text nodes (rare at this level).
        return (
          <span
            key={id + idx}
            className={cn("block", itemClass)}
            style={itemStyle}
          >
            {child}
          </span>
        );
      })}
    </Comp>
  );
}
