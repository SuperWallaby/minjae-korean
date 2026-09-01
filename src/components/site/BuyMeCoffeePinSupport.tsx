import { Coffee } from "lucide-react";

const DEFAULT_BMC_URL = "https://buymeacoffee.com/kajakorean";

type Props = {
  href?: string;
  className?: string;
  variant?: "kaja" | "atlas" | "eigochart";
};

const COPY: Record<
  NonNullable<Props["variant"]>,
  { line: string; sub: string; cta: string }
> = {
  kaja: {
    line: "If you like these contents ❤️",
    sub: "Charts stay free — a coffee helps make the next one.",
    cta: "Buy me a coffee",
  },
  atlas: {
    line: "If you like these charts ❤️",
    sub: "Charts stay free — a coffee helps make the next one.",
    cta: "Buy me a coffee",
  },
  eigochart: {
    line: "このチャートが役立ったら ❤️",
    sub: "無料のまま続けます。コーヒー1杯が次のチャートに繋がります。",
    cta: "コーヒーをご馳走する",
  },
};

/**
 * Soft support strip for pin / chart detail pages (not the home hero block).
 */
export function BuyMeCoffeePinSupport({
  href = DEFAULT_BMC_URL,
  className,
  variant = "kaja",
}: Props) {
  const copy = COPY[variant];
  const isKaja = variant === "kaja";

  if (!isKaja) {
    return (
      <aside
        className={className || "bmc-pin-support"}
        aria-label="Optional support"
        style={
          className
            ? undefined
            : {
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.85rem",
                marginTop: "1.25rem",
                padding: "0.95rem 1.1rem",
                border: "1px solid rgba(27, 21, 17, 0.12)",
                borderRadius: 8,
                background: "rgba(255, 253, 249, 0.9)",
              }
        }
      >
        <p style={{ margin: 0, maxWidth: "28rem", lineHeight: 1.45 }}>
          <span style={{ display: "block", fontWeight: 600 }}>{copy.line}</span>
          <span
            style={{
              display: "block",
              marginTop: 4,
              fontSize: "0.82rem",
              opacity: 0.72,
            }}
          >
            {copy.sub}
          </span>
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            padding: "0.5rem 0.95rem",
            borderRadius: 999,
            border: "1px solid rgba(230, 184, 0, 0.85)",
            background: "#ffdd00",
            color: "#1a1400",
            fontWeight: 650,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          <Coffee className="size-4" aria-hidden />
          {copy.cta}
        </a>
      </aside>
    );
  }

  return (
    <aside
      className={
        className ||
        "flex flex-col items-start gap-3 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      }
      aria-label="Optional support"
    >
      <p className="text-sm leading-relaxed text-[var(--quiz-text-sub)] sm:text-[0.95rem]">
        {copy.line}
        <span className="mt-1 block text-[0.8rem] text-[var(--quiz-text-muted)]">
          {copy.sub}
        </span>
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e6b800]/80 bg-[#ffdd00] px-4 py-2 text-sm font-semibold text-[#1a1400] shadow-sm transition hover:brightness-95"
      >
        <Coffee className="size-4" aria-hidden />
        {copy.cta}
      </a>
    </aside>
  );
}
