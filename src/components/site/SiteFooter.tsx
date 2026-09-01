"use client";

import Link from "next/link";
import * as React from "react";
import {
  Check,
  Copy,
  Instagram,
  Mail,
  MessageSquare,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/site/Container";
import { Logo } from "@/components/site/Logo";

const LEARN_LINKS = [
  { href: "/blog", label: "Notes" },
  { href: "/book/korean-beyond-translation", label: "Book" },
  { href: "/#approach", label: "About Minjae" },
] as const;

const EXPLORE_LINKS = [
  { href: "/vocab-quiz", label: "Play Game" },
  { href: "/subscribe", label: "Get Free Book" },
] as const;

const ACCOUNT_LINKS = [
  { href: "/account", label: "Account" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

const linkClassName =
  "text-sm text-[var(--quiz-text-sub)] transition hover:text-[var(--quiz-text)]";

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text)]">
        {title}
      </p>
      <ul className="mt-3 grid gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const copyTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const copyText = React.useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      // ignore
    }
  }, []);

  const pillClassName =
    "cursor-pointer inline-flex items-center gap-2 rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-3 py-1.5 text-xs text-[var(--quiz-text-sub)] transition hover:bg-[var(--quiz-surface-soft)] hover:text-[var(--quiz-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--quiz-primary)]/30";

  return (
    <footer className="site-footer border-t border-[#f2f2f2] bg-white text-[#242424]">
      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-start">
        <div className="text-sm text-[var(--quiz-text-sub)]">
          <Logo mode="footer" />
          <div className="mt-0 max-w-sm text-xs leading-6 text-[var(--quiz-text-muted)]">
            Notes on how to study Korean — methods, habits, and what actually
            works.
          </div>

          <div className="mt-5 grid gap-1 text-xs">
            <div className="font-semibold text-[var(--quiz-text)]">Contact</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <a
                href="sms:+821052374492"
                className={pillClassName}
                aria-label="SMS +82 10 5237 4492"
              >
                <MessageSquare className="size-3.5" />
                <span className="tabular-nums">+82 10 5237 4492</span>
              </a>
              <button
                type="button"
                className={pillClassName}
                onClick={() => void copyText("kakao", "@kaja_korean")}
                title="Copy Kakao ID"
                aria-label="Copy Kakao ID @kaja_korean"
              >
                <Image
                  src="/kakao-icon.svg"
                  alt="Kakao"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>Kakao</span>
                <span className="text-[var(--quiz-text-muted)]">@kaja_korean</span>
                {copiedKey === "kakao" ? (
                  <Check className="size-3.5 text-[var(--quiz-primary)]" />
                ) : (
                  <Copy className="size-3.5 text-[var(--quiz-text-muted)]" />
                )}
              </button>
              <a
                href="https://wa.me/821052374492"
                target="_blank"
                rel="noopener noreferrer"
                className={pillClassName}
                aria-label="Open WhatsApp chat"
                title="Open WhatsApp chat"
              >
                <Image
                  src="/ws-icon.svg"
                  alt="WhatsApp"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>WhatsApp</span>
                <span className="text-[var(--quiz-text-muted)]">@kaja_korean</span>
              </a>
              <a
                href="mailto:minjae@kajakorean.com"
                className={pillClassName}
                aria-label="Email minjae@kajakorean.com"
              >
                <Mail className="size-3.5" />
                <span className="tabular-nums">minjae@kajakorean.com</span>
              </a>
              <a
                href="https://instagram.com/kaja_minjae"
                target="_blank"
                rel="noopener noreferrer"
                className={pillClassName}
                aria-label="Instagram @kaja_minjae"
                title="Instagram @kaja_minjae"
              >
                <Instagram className="size-3.5" />
                <span>Instagram</span>
                <span className="text-white/55">@kaja_minjae</span>
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <FooterLinkColumn title="Learn" links={LEARN_LINKS} />
          <FooterLinkColumn title="Explore" links={EXPLORE_LINKS} />
          <div>
            <FooterLinkColumn title="Account" links={ACCOUNT_LINKS} />
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com/kaja_minjae"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-text-sub)] transition hover:text-[var(--quiz-text)]"
                aria-label="Instagram @kaja_minjae"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://www.pinterest.com/kajakorean/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-text-sub)] transition hover:text-[var(--quiz-text)]"
                aria-label="Pinterest @kajakorean"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M12.017 1.5c-5.79 0-9.517 3.9-9.517 8.95 0 2.15.85 4.07 2.67 4.79.15.06.28.02.32-.1.03-.09.2-.8.26-1.1.03-.1.02-.18-.07-.28-.42-.5-.68-1.15-.68-2.07 0-2.67 2-5.06 5.21-5.06 2.84 0 4.4 1.74 4.4 4.06 0 3.05-1.35 5.63-3.36 5.63-.99 0-1.73-.82-1.49-1.83.29-1.2.84-2.5.84-3.37 0-.78-.42-1.42-1.28-1.42-.98 0-1.78 1.02-1.78 2.38 0 .87.29 1.45.29 1.45l-1.18 4.98c-.35 1.48-.05 3.3-.03 3.48.02.1.14.14.21.05.1-.12 1.36-1.65 1.79-3.17.12-.43.69-2.7.69-2.7.34.65 1.34 1.22 2.4 1.22 3.16 0 5.31-2.88 5.31-6.74 0-3.67-3.12-6.7-7.33-6.7z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-text-sub)] transition hover:text-[var(--quiz-text)]"
                aria-label="YouTube"
              >
                <Youtube className="size-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-text-sub)] transition hover:text-[var(--quiz-text)]"
                aria-label="X"
              >
                <Twitter className="size-4" />
              </a>
            </div>
            <div className="mt-3 text-xs text-[var(--quiz-text-muted)]">
              © {new Date().getFullYear()} Kaja Korean. All rights reserved.
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
