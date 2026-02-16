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
    "cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30";

  return (
    <footer className="bg-[#14110d] text-white">
      <Container className="grid gap-8 py-10 md:grid-cols-2 md:items-start">
        <div className="text-sm text-white/70">
          <Logo mode="footer" />
          <div className="mt-0 max-w-sm text-xs leading-6 text-white/60">
            Korean 1:1 practice with Minjae.
          </div>

          <div className="mt-5 grid gap-1 text-xs">
            <div className="font-semibold text-white/80">Contact</div>
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
                <span className="text-white/55">@kaja_korean</span>
                {copiedKey === "kakao" ? (
                  <Check className="size-3.5 text-white/90" />
                ) : (
                  <Copy className="size-3.5 text-white/55" />
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
                <span className="text-white/55">@kaja_korean</span>
              </a>
              <a
                href="mailto:minjae@kajakorean.com"
                className={pillClassName}
                aria-label="Email minjae@kajakorean.com"
              >
                <Mail className="size-3.5" />
                <span className="tabular-nums">minjae@kajakorean.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70 md:justify-self-end md:text-right">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-end">
            <Link href="/#ways-to-use" className="hover:text-white">
              Class pass
            </Link>
            <Link href="/posts" className="hover:text-white">
              Posts
            </Link>
            <Link href="/booking" className="hover:text-white">
              Pick a time
            </Link>
            <Link href="/account" className="hover:text-white">
              Account
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-3 md:justify-end">
            <a
              href="https://instagram.com/kaja_minjae"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition hover:text-white"
              aria-label="Instagram @kaja_minjae"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition hover:text-white"
              aria-label="YouTube"
            >
              <Youtube className="size-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition hover:text-white"
              aria-label="X"
            >
              <Twitter className="size-4" />
            </a>
          </div>
          <div className="mt-3 text-xs text-white/55">
            © {new Date().getFullYear()} Minjae Korean. All rights reserved.
          </div>
        </div>
      </Container>
    </footer>
  );
}
