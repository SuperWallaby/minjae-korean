"use client";

import * as React from "react";

type Props = {
  children: React.ReactNode;
  /** HTML tag to render as. For tables, use \"tr\". Default: \"div\" */
  as?: "div" | "tr";
  className?: string;
  /** IntersectionObserver rootMargin. Default: \"200px\" (preload 살짝 앞에서). */
  rootMargin?: string;
};

export function RenderIfVisible({
  children,
  as = "div",
  className,
  rootMargin = "200px",
}: Props) {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    // 서버/지원 안 되는 환경에서는 그냥 바로 렌더
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, as]);

  const Tag: any = as;

  return (
    <Tag ref={ref} className={className}>
      {visible ? children : null}
    </Tag>
  );
}

