"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Check, Download } from "lucide-react";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import {
  LAST_STRIPE_PURCHASE_STORAGE_KEY,
  type LastStripePurchaseStored,
} from "@/lib/stripePurchase";

type VerifyOk = {
  ok: true;
  product: string;
  emailMasked: string | null;
};

type VerifyErr = {
  ok: false;
  error: string;
  paymentStatus?: string;
};

export function PaymentSuccessView({ sessionId }: { sessionId: string }) {
  const [state, setState] = React.useState<
    { kind: "loading" } | { kind: "error"; message: string } | { kind: "ok"; data: VerifyOk }
  >({ kind: "loading" });
  const [ebookAction, setEbookAction] = React.useState<null | "read" | "download">(null);
  const [ebookError, setEbookError] = React.useState<string | null>(null);

  const openEbook = React.useCallback(
    async (mode: "read" | "download") => {
      setEbookError(null);
      setEbookAction(mode);
      try {
        const res = await fetch(
          `/api/public/ebook/signed-url?session_id=${encodeURIComponent(sessionId)}&mode=${mode}`,
          { cache: "no-store" },
        );
        const json = (await res.json().catch(() => null)) as {
          ok?: boolean;
          url?: string;
          error?: string;
        };
        if (res.status === 503 && json?.error === "ebook_not_configured") {
          setEbookError(
            "eBook download is not configured yet. Check your email for the PDF or contact support.",
          );
          return;
        }
        if (!res.ok || !json?.ok || !json?.url) {
          if (res.status === 403) {
            setEbookError("This link is not valid for the eBook.");
            return;
          }
          setEbookError("Couldn’t get a download link. Try again in a moment.");
          return;
        }
        if (mode === "read") {
          window.open(json.url, "_blank", "noopener,noreferrer");
        } else {
          window.location.assign(json.url);
        }
      } catch {
        setEbookError("Couldn’t get a download link. Check your connection and try again.");
      } finally {
        setEbookAction(null);
      }
    },
    [sessionId],
  );

  React.useEffect(() => {
    if (!sessionId) {
      setState({ kind: "error", message: "Missing payment session." });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/public/stripe/verify-checkout-session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const json = (await res.json().catch(() => null)) as VerifyErr | VerifyOk;
        if (cancelled) return;
        if (!res.ok || !json || (json as { ok?: boolean }).ok !== true) {
          const e = json as VerifyErr;
          if (e?.error === "not_paid") {
            setState({
              kind: "error",
              message: "This checkout is not completed yet. If you just paid, wait a few seconds and refresh.",
            });
            return;
          }
          setState({
            kind: "error",
            message: "We couldn’t verify this payment link. Open the link from your email receipt or try again from the product page.",
          });
          return;
        }
        const data = json as VerifyOk;
        setState({ kind: "ok", data });

        try {
          const payload: LastStripePurchaseStored = {
            sessionId,
            product: data.product,
            savedAt: Date.now(),
          };
          window.localStorage.setItem(
            LAST_STRIPE_PURCHASE_STORAGE_KEY,
            JSON.stringify(payload),
          );
        } catch {
          // ignore
        }
      } catch {
        if (!cancelled) {
          setState({ kind: "error", message: "Couldn’t load payment details. Please try again." });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state.kind === "loading") {
    return (
      <section className="py-10 sm:py-14">
        <Container className="max-w-2xl">
          <div className="rounded-3xl border border-[#edd4c7]/60 bg-gradient-to-b from-[#fff8f4] to-white p-8 text-center text-sm text-[#7a564a]">
            <div className="font-serif text-lg font-medium text-[#28140d]">
              One moment
            </div>
            <p className="mt-2 text-muted-foreground">Confirming your order…</p>
          </div>
        </Container>
      </section>
    );
  }

  if (state.kind === "error") {
    return (
      <section className="py-10 sm:py-14">
        <Container className="max-w-2xl">
          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="font-serif text-2xl font-semibold tracking-tight">
              Something went wrong
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const { product, emailMasked } = state.data;
  const isBook = product === "book_launch";

  if (isBook) {
    return (
      <section className="pt-4 pb-12 sm:pt-6 sm:pb-16">
        <Container className="max-w-[min(100%,58rem)]">
          <div className="book-success-card-anim overflow-hidden rounded-3xl border border-[rgba(210,180,145,0.38)] bg-[linear-gradient(165deg,#fff8f4_0%,#fffefc_45%,#f3ebe3_100%)] shadow-[0_20px_45px_rgba(38,28,20,0.07),0_3px_10px_rgba(38,28,20,0.04)]">
            <div className="grid items-start gap-8 p-10 sm:gap-10 sm:px-12 sm:py-12 md:px-16 md:py-14 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
              <div className="book-success-cover-anim relative mx-auto w-full max-w-[300px] self-start sm:max-w-[320px] lg:mx-0">
                <div
                  className="relative aspect-[1985/2807] w-full overflow-hidden rounded-[10px] bg-[#1f1413] shadow-[0_22px_38px_rgba(38,28,20,0.18),0_6px_12px_rgba(38,28,20,0.10)]"
                >
                  <Image
                    src="/book-samples/book-cover.png"
                    alt="Korean, Beyond Translation"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 80vw, 320px"
                    priority
                  />
                </div>
                <div className="mt-4 sm:mt-5">
                  <blockquote
                    className="rounded-2xl border border-[#e0c9b6]/80 bg-white/60 px-4 py-3.5 text-center text-[0.8rem] leading-[1.55] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] sm:text-[0.8125rem] sm:leading-[1.6] lg:text-left"
                    cite="Korean, Beyond Translation"
                  >
                    <p className="font-serif font-medium text-[#4a2f25]">
                      &ldquo;Learn the Korean people actually use — not textbook
                      translations.&rdquo;
                    </p>
                  </blockquote>
                </div>
              </div>

              <div className="min-w-0 lg:-translate-y-2.5">
                <div className="book-success-head-anim">
                  <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#1f1410] sm:text-[1.7rem] md:text-[2.1rem] md:leading-tight text-balance">
                    <span className="inline-flex w-full min-w-0 max-w-[min(100%,26ch)] flex-wrap items-start gap-2 sm:max-w-none sm:flex-nowrap sm:items-center sm:gap-2.5">
                      <Check
                        className="mt-0.5 size-7 shrink-0 self-start text-emerald-600 sm:mt-0.5 sm:size-8 md:size-9"
                        strokeWidth={2.6}
                        aria-hidden
                      />
                      <span>
                        Your Korean eBook is{" "}
                        <span className="whitespace-nowrap text-[#0f6b4a]">ready</span>
                      </span>
                    </span>
                  </h1>
                </div>
                <p className="book-success-sub-anim mt-4 text-base leading-[1.55] text-[#3d2a22] sm:text-lg sm:leading-relaxed text-balance">
                  {emailMasked ? (
                    <>
                      Start reading now. Your PDF is saved here, and your
                      receipt has been sent to{" "}
                      <span className="font-medium text-[#2a1e18]">
                        {emailMasked}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      Start reading now. Your PDF is saved here, and your
                      receipt is on the way to the email you used at checkout.
                    </>
                  )}
                </p>

                <div className="book-success-sub-anim mt-5 space-y-2.5 sm:mt-6">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#c4a99a]/55 bg-white/60 px-3.5 py-1.5 text-sm font-medium leading-tight text-[#3d271d] sm:px-4 sm:py-2 sm:text-[0.95rem]">
                    <Check
                      className="size-3.5 shrink-0 text-emerald-600"
                      strokeWidth={2.75}
                      aria-hidden
                    />
                    <span>
                      Early reader promo{" "}
                      <span className="text-[#0f6b4a]">applied</span>
                    </span>
                  </span>
                  <p className="text-sm leading-relaxed text-[#5c4237] sm:text-base">
                    2–3 hours · Printable PDF · Yours to keep
                  </p>
                </div>

                <div className="book-success-cta-anim mt-9 w-full max-w-md space-y-0 sm:mt-10">
                  <Button
                    type="button"
                    size="lg"
                    className="h-14 w-full min-w-0 text-base font-semibold sm:text-lg"
                    variant="primary"
                    disabled={ebookAction !== null}
                    onClick={() => void openEbook("read")}
                  >
                    <BookOpen
                      className="size-6 shrink-0 sm:size-7"
                      aria-hidden
                      strokeWidth={2.25}
                    />
                    {ebookAction === "read" ? "Opening…" : "Read now"}
                  </Button>

                  <div className="pt-2">
                    <Button
                      type="button"
                      className="h-[42px] w-full min-w-0 border-[#6b5c52]/50 bg-white/75 text-sm font-medium text-[#2c221c] transition-[border-color,background-color] hover:border-[#3d3330] hover:bg-white/95"
                      variant="outline"
                      disabled={ebookAction !== null}
                      onClick={() => void openEbook("download")}
                    >
                      <Download
                        className="size-[0.95rem] shrink-0 opacity-90 sm:size-4"
                        aria-hidden
                        strokeWidth={2.1}
                      />
                      {ebookAction === "download" ? "Preparing…" : "Download PDF"}
                    </Button>
                  </div>
                  {ebookError ? (
                    <p className="pt-2 text-sm text-red-600" role="alert">
                      {ebookError}
                    </p>
                  ) : null}

                  <div className="pt-2.5">
                    <details className="w-full text-left">
                      <summary className="flex w-full cursor-pointer list-none items-baseline gap-1.5 text-left text-xs text-[#5c4237] select-none marker:hidden [&::-webkit-details-marker]:hidden sm:text-sm">
                        <span className="border-b border-[#5c4237]/30 pb-0.5 hover:border-[#5c4237]/55">
                          Receipt &amp; access details
                        </span>
                        <span
                          className="shrink-0 text-[0.7rem] text-[#5c4237]/70"
                          aria-hidden
                        >
                          ▾
                        </span>
                      </summary>
                      <dl className="mt-3 space-y-2.5 rounded-lg border border-[#e4d0c3]/50 bg-white/30 px-3.5 py-3 text-sm text-[#3d2a22] sm:px-4 sm:py-3.5">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-[#6b4f42]/80">
                          Email
                        </dt>
                        <dd className="mt-0.5 break-all text-foreground/90">
                          {emailMasked || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-[#6b4f42]/80">
                          Product
                        </dt>
                        <dd className="mt-0.5">
                          Korean, Beyond Translation — PDF eBook
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-[#6b4f42]/80">
                          Access
                        </dt>
                        <dd className="mt-0.5">
                          File is in private storage; a short link is created
                          here only after we confirm this checkout
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-[#6b4f42]/80">
                          Receipt
                        </dt>
                        <dd className="mt-0.5">Sent to your email</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-[#6b4f42]/80">
                          Order reference
                        </dt>
                        <dd className="mt-1.5 break-all font-mono text-xs leading-relaxed text-muted-foreground">
                          {sessionId}
                        </dd>
                      </div>
                      </dl>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-2xl">
        <div className="rounded-3xl border border-border bg-white p-6">
          <div className="font-serif text-2xl font-semibold tracking-tight">
            Payment successful
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Thanks! Your credits will appear in your account shortly
            {emailMasked ? ` (receipt: ${emailMasked})` : ""}.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/booking">Book a time</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account">Account</Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Reference: <span className="font-mono">{sessionId}</span>
          </p>
        </div>
      </Container>
    </section>
  );
}

export function PaymentSuccessGeneric() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-2xl">
        <div className="rounded-3xl border border-border bg-white p-6">
          <div className="font-serif text-2xl font-semibold tracking-tight">
            Payment successful
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Thanks! If you don’t see updates in your account, check the email
            you used at checkout for your receipt.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/booking">Book a time</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account">Account</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
