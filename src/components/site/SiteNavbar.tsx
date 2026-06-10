"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, UserRound, X } from "lucide-react";
import { BookmarkNavIcon } from "@/components/article/BookmarkNavIcon";
import * as React from "react";
import { createPortal } from "react-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { useMockSession } from "@/lib/mock/MockSessionProvider";
import { useEducationMode } from "@/lib/EducationModeProvider";
import { LIBRARY_LINKS, NEWS_RESOURCE } from "@/data/libraryLinks";

type NavLinkProps = {
  href: string;
  label: string;
  activeOverride?: boolean;
  /** e.g. NEWS_RESOURCE.icon — shows before label */
  iconSrc?: string;
};

function NavLink({ href, label, activeOverride, iconSrc }: NavLinkProps) {
  const pathname = usePathname() ?? "";
  let active = false;
  // Anchor links (/#something) are controlled by activeOverride (intersection observer)
  if (href.startsWith("/#")) {
    // Only use scroll-based active state when we're on the main page.
    // This avoids anchors appearing active on other routes (e.g. /booking).
    active = pathname === "/" ? (activeOverride ?? false) : false;
  } else {
    // Normal page links: match exact pathname or prefix (for subpaths)
    active =
      activeOverride ?? (pathname === href || pathname.startsWith(href + "/"));
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active && "bg-muted text-foreground",
        {
          "hover:bg-muted/20": !active,
        },
      )}
    >
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 opacity-85"
        />
      ) : null}
      {label}
    </Link>
  );
}

function isAssetLinkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteNavbar() {
  const { state } = useMockSession();
  const { enabled: eduMode } = useEducationMode();
  const [activeHash, setActiveHash] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [assetsOpen, setAssetsOpen] = React.useState(false);
  const [headerVisible, setHeaderVisible] = React.useState(false);
  const [navMounted, setNavMounted] = React.useState(false);
  const pathname = usePathname();
  const isAssetsActive = LIBRARY_LINKS.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + "/"),
  );

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

  React.useEffect(() => {
    const ids = ["approach"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          );
        if (visible[0]?.target?.id) setActiveHash(visible[0].target.id);
      },
      // Include threshold 0 so tall sections still trigger updates.
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.08, 0.15, 0.25] },
    );

    for (const el of elements) obs.observe(el);
    return () => obs.disconnect();
  }, [pathname]);

  return (
    <>
    <header
      className={cn(
        "site-navbar  sticky z-40 transition-transform duration-200",
        "top-0 mb-0 md:top-5 md:mb-5",
        eduMode && !headerVisible && "-translate-y-[calc(100%+1.25rem)]",
      )}
    >
      <div className="w-full md:container md:mx-auto md:max-w-6xl md:px-4 lg:px-8">
        <div className="mx-auto w-full md:w-fit">
          <div
            className={cn(
              " flex w-full border border-border bg-background md:bg-white px-2 py-2",
              "rounded-none border-x-0 border-t-0 shadow-none",
              "md:rounded-full md:border md:shadow-(--shadow-navbar) min-h-[60px] md:h-[60px]",
            )}
          >
            <div className="flex w-full flex-1 items-center justify-between gap-2 pl-0 md:gap-3 md:pl-2 px-2 sm:gap-3">
              <div className="flex items-center gap-4">
                <Logo className="px-2" />
                <nav className="hidden items-center gap-1 md:flex">
                  <NavLink
                    href="/#approach"
                    label="Approach"
                    activeOverride={activeHash === "approach"}
                  />
                  <NavLink
                    href="/news"
                    label="News"
                    iconSrc={NEWS_RESOURCE.icon}
                  />
                  {/* <NavLink href="/coaching" label="Class pass" /> */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAssetsOpen((v) => !v)}
                      onBlur={() => setTimeout(() => setAssetsOpen(false), 150)}
                      className={cn(
                        "inline-flex group items-center gap-1 -mr-px rounded-xl px-4 py-2.5 text-sm font-medium transition",
                        "text-muted-foreground cursor-pointer",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isAssetsActive && "bg-muted text-foreground",
                        {
                          "hover:text-foreground hover:bg-muted/20":
                            !isAssetsActive,
                        },
                      )}
                      aria-expanded={assetsOpen}
                      aria-haspopup="true"
                    >
                      <Image
                        src="/icons/light-bulb.webp"
                        width={24}
                        height={24}
                        alt=""
                        className="size-6 shrink-0 -mx-1 group-hover:opacity-100 opacity-80"
                      />
                      Library
                      <ChevronDown
                        className={cn(
                          "size-5 transition mt-1 -mr-1",
                          assetsOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {assetsOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[332px] rounded-xl border border-border bg-white p-1 py-2 shadow-lg grid grid-cols-2">
                        {LIBRARY_LINKS.map((link) => {
                          const active = isAssetLinkActive(
                            pathname ?? "",
                            link.href,
                          );
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 mx-1.5 text-base group",
                                active
                                  ? "bg-muted text-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                                link.emphasized &&
                                  !active &&
                                  "bg-muted/55 font-semibold text-foreground hover:bg-muted/70",
                              )}
                              onClick={() => setAssetsOpen(false)}
                            >
                              <Image
                                src={link.icon}
                                alt={link.label}
                                width={24}
                                height={24}
                                className={cn("size-6 shrink-0 ", {
                                  "opacity-100": active,
                                  "opacity-80 group-hover:opacity-100": !active,
                                  "size-7": link.emphasized,
                                })}
                              />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </nav>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <BookmarkNavIcon />
                <button
                  type="button"
                  className={cn(
                    "inline-flex md:hidden h-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:bg-muted/40 active:bg-muted/55",
                  )}
                  aria-expanded={mobileOpen}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMobileOpen((v) => !v);
                  }}
                >
                  {mobileOpen ? (
                    <X className="size-5" strokeWidth={2} />
                  ) : (
                    <Menu className="size-5" strokeWidth={2} />
                  )}
                </button>
                <div className="hidden items-center gap-2 lg:flex">
                  {state.subscriptionPlan ? (
                    <Badge variant="default">
                      Subscription{" "}
                      {state.subscriptionPlan === "weekly1"
                        ? "Weekly (1)"
                        : "Weekly (2)"}
                    </Badge>
                  ) : null}
                  {state.passRemaining > 0 ? (
                    <Badge variant="muted">{state.passRemaining} passes</Badge>
                  ) : null}
                </div>

                {state.user ? (
                  <Button
                    className="w-fit w-[101px]"
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link
                      href="/account"
                      className="inline-flex items-center gap-2"
                    >
                      <UserRound className="size-4" />
                      Profile
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-[101px]"
                    variant="primary"
                    size="sm"
                    asChild
                  >
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2"
                    >
                      <UserRound className="size-4" />
                      Sign in
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    {navMounted && mobileOpen
      ? createPortal(
          <div
            className="md:hidden fixed inset-0 z-200 flex flex-col bg-(--bg-canvas) shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <div className="flex h-14 min-h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <Logo className="text-foreground [&_span:last-child]:text-muted-foreground" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground active:bg-muted/50"
                aria-label="Close menu"
              >
                <X className="size-6" strokeWidth={2} />
              </button>
            </div>

            <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 py-6">
                <div className="grid gap-2">
                  <Link
                    href="/#approach"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                  >
                    Home
                  </Link>
                  <Link
                    href="/news"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                  >
                    <Image
                      src={NEWS_RESOURCE.icon}
                      alt=""
                      width={24}
                      height={24}
                      className="size-6 shrink-0 opacity-90"
                    />
                    News
                  </Link>
                  {state.user ? (
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                    >
                      Account
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                    >
                      Sign in
                    </Link>
                  )}
                  <span className="px-1 pt-2 text-xs font-medium text-muted-foreground">
                    Library
                  </span>
                  {LIBRARY_LINKS.map((link) => {
                    const active = isAssetLinkActive(
                      pathname ?? "",
                      link.href,
                    );
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold",
                          active && "bg-muted ring-1 ring-border",
                          link.emphasized &&
                            "bg-muted/40 shadow-sm shadow-black/5",
                        )}
                      >
                        <Image
                          src={link.icon}
                          alt={link.label}
                          width={24}
                          height={24}
                          className={cn(
                            "shrink-0 opacity-80",
                            link.emphasized ? "size-7" : "size-6",
                          )}
                        />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 border-t border-border px-5 py-4 text-sm text-muted-foreground">
                Close with the button above, Escape, or open a page.
              </div>
            </div>,
          document.body,
        )
      : null}
    </>
  );
}
