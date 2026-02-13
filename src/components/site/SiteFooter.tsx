import Link from "next/link";
import { Instagram, Youtube, Twitter } from "lucide-react";

import { Container } from "@/components/site/Container";
import { Logo } from "@/components/site/Logo";

export function SiteFooter() {
  return (
    <footer className="bg-[#14110d] text-white">
      <Container className="grid gap-8 py-10 md:grid-cols-2 md:items-start">
        <div className="text-sm text-white/70">
          <Logo
            mode="v1"
            className="text-white [&_span:last-child]:text-white/60"
          />
          <div className="mt-3 max-w-sm text-xs leading-6 text-white/60">
            Real-life Korean practice with Minjae. Join as a member and book a
            time when it fits.
          </div>

          <div className="mt-5 grid gap-1 text-xs">
            <div className="font-semibold text-white/80">Contact</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <a
                href="tel:+821052374492"
                className="underline underline-offset-4 decoration-white/25 hover:text-white"
              >
                +82 10 5237 4492
              </a>
              <span className="text-white/30">•</span>
              <span>Kakao: @Kaja</span>
              <span className="text-white/30">•</span>
              <span>WhatsApp: @kaja</span>
              <span className="text-white/30">•</span>
              <a
                href="mailto:kaja95@gmail.com"
                className="underline underline-offset-4 decoration-white/25 hover:text-white"
              >
                kaja95@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70 md:justify-self-end md:text-right">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-end">
            <Link href="/#ways-to-use" className="hover:text-white">
              Ways to use Korean
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
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition hover:text-white"
              aria-label="Instagram"
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
