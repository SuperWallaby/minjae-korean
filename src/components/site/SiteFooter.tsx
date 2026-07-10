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
    <footer className="site-footer border-t border-[var(--quiz-border)] bg-[var(--quiz-canvas)] text-[var(--quiz-text)]">
      <Container className="grid gap-8 py-10 md:grid-cols-2 md:items-start">
        <div className="text-sm text-[var(--quiz-text-sub)]">
          <Logo mode="footer" />
          <div className="mt-0 max-w-sm text-xs leading-6 text-[var(--quiz-text-muted)]">
            Learn Korean with nuance — quizzes, news, grammar, and more.
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

        <div className="text-sm text-[var(--quiz-text-sub)] md:justify-self-end md:text-right">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-end">
            <Link href="/news" className="hover:text-[var(--quiz-text)]">
              News
            </Link>
            <Link href="/grammar" className="hover:text-[var(--quiz-text)]">
              Grammar
            </Link>
            <Link href="/grammar/compare" className="hover:text-[var(--quiz-text)]">
              Word & grammar comparisons
            </Link>
            <Link href="/grammar/meaning" className="hover:text-[var(--quiz-text)]">
              Meaning guides
            </Link>
            <Link href="/grammar/usage" className="hover:text-[var(--quiz-text)]">
              Usage guides
            </Link>
            <Link href="/grammar/how-to-say" className="hover:text-[var(--quiz-text)]">
              How to say it
            </Link>
            {/* 1:1 booking hidden while sessions are paused */}
            <Link href="/account" className="hover:text-[var(--quiz-text)]">
              Account
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-3 md:justify-end">
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
            © {new Date().getFullYear()} What is this in Korean. All rights reserved.
          </div>
        </div>
      </Container>
    </footer>
  );
}
