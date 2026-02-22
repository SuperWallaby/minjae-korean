"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, UserRound, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { useMockSession } from "@/lib/mock/MockSessionProvider";
import { useEducationMode } from "@/lib/EducationModeProvider";

type NavLinkProps = {
  href: string;
  label: string;
  activeOverride?: boolean;
};

function NavLink({ href, label, activeOverride }: NavLinkProps) {
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
        "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active && "bg-muted text-foreground",
        {
          "hover:bg-muted/20": !active,
        },
      )}
    >
      {label}
    </Link>
  );
}

const ASSETS_LINKS = [
  { href: "/grammar", label: "Grammar", icon: "/book-open.webp" },
  { href: "/expressions", label: "Expressions", icon: "/talk.webp" },
  { href: "/news", label: "News", icon: "/news.webp" },
  // { href: "/fundamental", label: "Fundamental", icon: "/cubs.webp" },
  // { href: "/songs", label: "Song", icon: "/music.webp" },
] as const;

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
  const pathname = usePathname();
  const isAssetsActive = ASSETS_LINKS.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + "/"),
  );

  React.useEffect(() => {
    if (!eduMode) {
      setHeaderVisible(false);
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      setHeaderVisible(e.clientY < 80);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [eduMode]);

  React.useEffect(() => {
    const ids = ["approach", "ways-to-use"];
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
              "md:rounded-full md:border md:shadow-(--shadow-navbar) h-[60px]",
            )}
          >
            <div className="flex w-full flex-1 items-center justify-between gap-3 pl-0 md:pl-2 px-2">
              <div className="flex items-center gap-4">
                <Logo className="px-2" />
                <nav className="hidden items-center gap-1 md:flex">
                  <NavLink
                    href="/#approach"
                    label="Approach"
                    activeOverride={activeHash === "approach"}
                  />
                  <NavLink
                    href="/#ways-to-use"
                    label="Class pass"
                    activeOverride={activeHash === "ways-to-use"}
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAssetsOpen((v) => !v)}
                      onBlur={() => setTimeout(() => setAssetsOpen(false), 150)}
                      className={cn(
                        "inline-flex items-center gap-1 -mr-px rounded-md px-4 py-2.5 text-sm font-medium transition",
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
                      Library
                      <ChevronDown
                        className={cn(
                          "size-5 transition mt-1 -mr-1",
                          assetsOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {assetsOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[200px] rounded-xl border border-border bg-white py-2 shadow-lg">
                        {ASSETS_LINKS.map((link) => {
                          const active = isAssetLinkActive(
                            pathname ?? "",
                            link.href,
                          );
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 text-base hover:bg-muted/40",
                                active
                                  ? "bg-muted text-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                              onClick={() => setAssetsOpen(false)}
                            >
                              <Image
                                src={link.icon}
                                alt=""
                                width={24}
                                height={24}
                                className="size-6 shrink-0 opacity-80"
                              />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <NavLink href="/booking" label="Pick a time" />
                </nav>
              </div>

              <div className="flex items-center gap-2">
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

            {/* Mobile: hamburger menu */}
            <div className="mt-1 flex items-center justify-between gap-2 px-2 pb-1 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition",
                  "bg-white text-foreground hover:bg-muted/40",
                )}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </button>

              {/* <div className="text-xs text-muted-foreground pr-2">
                {state.user ? "Signed in" : "Signed out"}
              </div> */}
            </div>

            {mobileOpen ? (
              <div className="md:hidden">
                <div
                  className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Mobile menu"
                  onClick={() => setMobileOpen(false)}
                />
                <div className="fixed inset-0 z-50">
                  <div className="flex h-full flex-col bg-(--bg-canvas)">
                    <div className="flex items-center justify-between border-b border-border px-4 py-2 h-[60px]">
                      <Logo className="text-foreground [&_span:last-child]:text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground"
                        aria-label="Close menu"
                      >
                        <X className="size-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-6">
                      <div className="grid gap-2">
                        <Link
                          href="/#approach"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                        >
                          Home
                        </Link>
                        <Link
                          href="/#ways-to-use"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                        >
                          Class pass
                        </Link>
                        <Link
                          href="/booking"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                        >
                          Pick a time
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
                        <span className="text-xs font-medium text-muted-foreground px-1 pt-2">
                          Library
                        </span>
                        {ASSETS_LINKS.map((link) => {
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
                              )}
                            >
                              <Image
                                src={link.icon}
                                alt=""
                                width={24}
                                height={24}
                                className="size-6 shrink-0 opacity-80"
                              />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
                      Tap anywhere outside to close.
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
