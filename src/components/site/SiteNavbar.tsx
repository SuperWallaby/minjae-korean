"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/site/Container";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { useMockSession } from "@/lib/mock/MockSessionProvider";

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
        "hover:bg-muted/20",
        active && "bg-muted text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteNavbar() {
  const { state } = useMockSession();
  const [activeHash, setActiveHash] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

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
    <header className="mb-5 sticky top-5 z-40">
      <Container>
        <div className="mx-auto w-fit">
          <div className="rounded-2xl border flex  w-full border-border bg-white px-2 py-2 shadow-(--shadow-navbar) md:rounded-full">
            <div className="flex items-center justify-between gap-3 px-2">
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
                  <NavLink href="/grammar" label="Grammar" />
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
                    className="w-[115px]"
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link
                      href="/account"
                      className="inline-flex items-center gap-2"
                    >
                      <UserRound className="size-4" />
                      Account
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-[115px]"
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
                Menu
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
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
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
                          href="/grammar"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-2xl border border-border bg-white px-4 py-4 text-lg font-semibold"
                        >
                          Grammar
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
      </Container>
    </header>
  );
}
