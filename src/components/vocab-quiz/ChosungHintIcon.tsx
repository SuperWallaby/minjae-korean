import * as React from "react";

/** Matches Lucide toolbar icons — Hangul ㄱ as the 초성-hint glyph. */
export function ChosungHintIcon({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="currentColor"
        style={{
          fontSize: "15px",
          fontWeight: 700,
          fontFamily:
            '"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
        }}
      >
        ㄱ
      </text>
    </svg>
  );
}
