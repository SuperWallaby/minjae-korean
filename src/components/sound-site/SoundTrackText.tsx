"use client";

import {
  trackHighlightClass,
  useSoundPlayback,
} from "@/components/sound-site/SoundPlayback";

type Props = {
  highlightKey: string;
  className: string;
  lang?: string;
  as?: "span" | "p";
  children: React.ReactNode;
};

export function SoundTrackText({
  highlightKey,
  className,
  lang,
  as = "span",
  children,
}: Props) {
  const { activeHighlightKey, highlightPace } = useSoundPlayback();
  const active = activeHighlightKey === highlightKey;
  const cls = `${className}${trackHighlightClass(active, highlightPace)}`;
  if (as === "p") {
    return (
      <p className={cls} lang={lang}>
        {children}
      </p>
    );
  }
  return (
    <span className={cls} lang={lang}>
      {children}
    </span>
  );
}
