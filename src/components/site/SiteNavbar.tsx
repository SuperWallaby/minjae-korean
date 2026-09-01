"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BookmarkNavIcon } from "@/components/article/BookmarkNavIcon";
import * as React from "react";
import { createPortal } from "react-dom";

import styles from "@/components/site/home-blog.module.css";
import { cn } from "@/lib/utils";
import { useMockSession } from "@/lib/mock/MockSessionProvider";
import { useEducationMode } from "@/lib/EducationModeProvider";

function NavTextLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-[15px] text-[#242424] transition-opacity hover:opacity-70",
        active && "font-medium",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteNavbar() {
  const { state } = useMockSession();
  const { enabled: eduMode } = useEducationMode();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [headerVisible, setHeaderVisible] = React.useState(false);
  const [navMounted, setNavMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setNavMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (eduMode) {
      setHeaderVisible(true);
      return;
    }
    setHeaderVisible(false);
    const handleMouseMove = (e: MouseEvent) => {
      setHeaderVisible(e.clientY < 80);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [eduMode]);

  const hideOnVocabQuiz = pathname?.startsWith("/vocab-quiz") ?? false;
  if (hideOnVocabQuiz) return null;

  const onBlog =
    pathname === "/blog" || (pathname?.startsWith("/blog/") ?? false);
  const onBook = pathname?.startsWith("/book") ?? false;
  const onHome = pathname === "/";

  return (
    <>
      <header
        className={cn(
          "site-navbar sticky top-0 z-40 border-b border-[#f2f2f2] bg-white",
          eduMode && !headerVisible && "-translate-y-full transition-transform duration-200",
        )}
      >
        <div
          className={cn(
            styles.shell,
            "flex h-[57px] items-center justify-between gap-4",
          )}
        >
          <div className="flex min-w-0 items-center gap-6 md:gap-8">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#1a8917]/40"
              aria-label="Kaja Korean home"
            >
              <Image
                src="/brand/logo.webp"
                alt=""
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-serif text-[1.35rem] font-semibold leading-none tracking-[-0.02em] text-[#242424]">
                Kaja Korean
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <NavTextLink href="/" label="About" active={onHome} />
              <NavTextLink href="/blog" label="Notes" active={onBlog} />
              <NavTextLink
                href="/book/korean-beyond-translation"
                label="Book"
                active={onBook}
              />
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <BookmarkNavIcon />
            </div>
            <NavTextLink href="/vocab-quiz" label="Play Game" />
            {state.user ? (
              <NavTextLink href="/account" label="Account" />
            ) : (
              <span className="hidden md:inline">
                <NavTextLink href="/login" label="Sign in" />
              </span>
            )}
            <Link href="/subscribe" className={styles.headerCta}>
              Get free book
            </Link>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full text-[#242424] md:hidden"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="size-5" strokeWidth={2} />
              ) : (
                <Menu className="size-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {navMounted && mobileOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-200 flex flex-col bg-white md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
              <div className="flex h-[57px] shrink-0 items-center justify-between border-b border-[#f2f2f2] px-5">
                <span className="font-serif text-xl font-semibold text-[#242424]">
                  Kaja Korean
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-full"
                  aria-label="Close menu"
                >
                  <X className="size-5" strokeWidth={2} />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 px-5 py-6 text-lg text-[#242424]">
                {[
                  { href: "/", label: "About" },
                  { href: "/blog", label: "Notes" },
                  {
                    href: "/book/korean-beyond-translation",
                    label: "Book",
                  },
                  { href: "/vocab-quiz", label: "Play Game" },
                  {
                    href: state.user ? "/account" : "/login",
                    label: state.user ? "Account" : "Sign in",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg py-3"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/subscribe"
                  onClick={() => setMobileOpen(false)}
                  className={cn(styles.headerCta, "mt-4")}
                >
                  Get free book
                </Link>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
