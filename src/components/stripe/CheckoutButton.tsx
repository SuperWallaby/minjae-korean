"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useMockSession } from "@/lib/mock/MockSessionProvider";

export type CheckoutProduct = "trial" | "single" | "monthly";

type Props = {
  product: CheckoutProduct;
  children: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
};

const pendingKey = "mj_pending_checkout_v1";
const emailOverrideKey = "mj_checkout_email_override_v1";
let pendingConsumed = false;

function safeGetReturnTo(pathname: string, search: string) {
  if (typeof window === "undefined") return `${pathname}${search}`;
  return `${pathname}${search}${window.location.hash ?? ""}`;
}

function setPendingCheckout(product: CheckoutProduct) {
  try {
    window.sessionStorage.setItem(
      pendingKey,
      JSON.stringify({ product, ts: Date.now() }),
    );
  } catch {
    // ignore
  }
}

function consumePendingCheckout(): {
  product: CheckoutProduct;
  ts: number;
} | null {
  if (pendingConsumed) return null;
  pendingConsumed = true;
  try {
    const raw = window.sessionStorage.getItem(pendingKey);
    window.sessionStorage.removeItem(pendingKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const obj =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    const product = obj?.product;
    const ts = obj?.ts;
    if (
      (product !== "trial" && product !== "single" && product !== "monthly") ||
      typeof ts !== "number"
    )
      return null;
    return { product, ts };
  } catch {
    return null;
  }
}

function readEmailOverride(): string {
  try {
    const v = window.localStorage.getItem(emailOverrideKey) ?? "";
    return v.trim();
  } catch {
    return "";
  }
}

function writeEmailOverride(email: string) {
  try {
    window.localStorage.setItem(emailOverrideKey, email.trim());
  } catch {
    // ignore
  }
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function CheckoutButton({
  product,
  children,
  className,
  size,
  variant,
}: Props) {
  const session = useMockSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const returnTo = React.useMemo(
    () => safeGetReturnTo(pathname, search),
    [pathname, search],
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState("");
  const [trialStatus, setTrialStatus] = React.useState<
    "unknown" | "available" | "used"
  >("unknown");

  React.useEffect(() => {
    if (product !== "trial") return;
    if (!session.ready) return;
    if (!session.state.user) {
      setTrialStatus("unknown");
      return;
    }
    const sid = (session.state.user.studentId ?? "").trim();
    if (!sid) {
      setTrialStatus("unknown");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/public/students/upsert?id=${encodeURIComponent(sid)}`,
          { cache: "no-store" },
        );
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        const credits = (json?.data?.student?.credits ?? []) as Array<{
          product?: string;
        }> | null;
        const couponRedemptions = (json?.data?.student?.couponRedemptions ??
          []) as Array<{ code?: string }> | null;
        const used =
          (Array.isArray(credits) &&
            credits.some((c) => c?.product === "trial")) ||
          (Array.isArray(couponRedemptions) && couponRedemptions.length > 0);
        setTrialStatus(used ? "used" : "available");
      } catch {
        if (!cancelled) setTrialStatus("unknown");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [product, session.ready, session.state.user]);

  const startCheckout = React.useCallback(
    async ({ email }: { email: string }) => {
      if (loading) return;
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            product,
            studentId: (session.state.user?.studentId ?? "").trim(),
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok || !json?.url)
          throw new Error(json?.error ?? "Checkout failed");
        window.location.href = json.url as string;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Checkout failed");
        setLoading(false);
      }
    },
    [loading, product, session.state.user?.studentId],
  );

  const start = React.useCallback(async () => {
    if (loading) return;
    setError(null);

    if (!session.state.user) {
      setPendingCheckout(product);
      setLoginOpen(true);
      return;
    }

    const override = typeof window !== "undefined" ? readEmailOverride() : "";
    const email = (override || session.state.user?.email || "").trim();
    if (!email || !isEmail(email)) {
      setEmailInput(email);
      setEmailOpen(true);
      return;
    }

    await startCheckout({ email });
  }, [loading, product, session.state.user, startCheckout]);

  React.useEffect(() => {
    if (!session.state.user) return;
    if (loading) return;
    if (typeof window === "undefined") return;

    const pending = consumePendingCheckout();
    if (!pending) return;
    if (pending.product !== product) return;

    const override = readEmailOverride();
    const email = (override || session.state.user?.email || "").trim();
    if (!email || !isEmail(email)) {
      setEmailInput(email);
      setEmailOpen(true);
      return;
    }

    void startCheckout({ email });
  }, [loading, product, session.state.user, startCheckout]);

  const loginHref = `/login?next=${encodeURIComponent(returnTo)}`;

  return (
    <div className="w-full">
      <Button
        onClick={() => void start()}
        className={className}
        size={size}
        variant={variant}
        disabled={
          loading ||
          !session.ready ||
          (product === "trial" && trialStatus === "used")
        }
      >
        {loading ? "Starting…" : children}
      </Button>
      {error && (
        <div className="mt-2 text-xs text-muted-foreground">{error}</div>
      )}
      {product === "trial" &&
      session.state.student &&
      trialStatus === "used" ? (
        <div className="mt-2 text-xs text-muted-foreground">
          First time offer is available once per account.
        </div>
      ) : null}

      <Modal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        title="Sign in required"
        description="Please sign in to continue."
        footer={
          <>
            <Button variant="outline" onClick={() => setLoginOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href={loginHref}>Sign in with Google</Link>
            </Button>
          </>
        }
      >
        <div className="text-sm text-muted-foreground">
          After signing in, you’ll return to this page and we’ll continue
          checkout.
        </div>
      </Modal>

      <Modal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Email required"
        description="Stripe checkout requires an email address."
        footer={
          <>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const next = emailInput.trim();
                if (!isEmail(next)) return;
                writeEmailOverride(next);
                setEmailOpen(false);
                void startCheckout({ email: next });
              }}
              disabled={!isEmail(emailInput.trim()) || loading}
            >
              Continue
            </Button>
          </>
        }
      >
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <input
              className="h-11 rounded-md border border-border bg-white px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
              autoComplete="email"
            />
          </label>
          {!emailInput.trim() ? (
            <div className="text-xs text-muted-foreground">
              We’ll use this email for your receipt and credits.
            </div>
          ) : !isEmail(emailInput.trim()) ? (
            <div className="text-xs text-muted-foreground">
              Please enter a valid email address.
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
