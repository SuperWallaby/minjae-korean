"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Download } from "lucide-react";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import {
  BOOK_PDF_HREF,
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
          <div className="overflow-hidden rounded-3xl border border-[rgba(210,180,145,0.38)] bg-[linear-gradient(165deg,#fff8f4_0%,#fffefc_45%,#f3ebe3_100%)] shadow-[0_20px_45px_rgba(38,28,20,0.07),0_3px_10px_rgba(38,28,20,0.04)]">
            <div className="grid items-start gap-10 p-10 sm:gap-12 sm:px-12 sm:py-12 md:px-16 md:py-14 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
              <div className="relative mx-auto w-full max-w-[300px] self-start sm:max-w-[320px] lg:mx-0 lg:pt-1.5">
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
                <p className="mt-6 text-center font-serif text-[0.8rem] leading-[1.82] text-[#5b3427]/58 sm:mt-7 sm:text-[0.8125rem] sm:leading-[1.9] lg:text-left">
                  &ldquo;Learn the Korean people actually use — not textbook
                  translations.&rdquo;
                </p>
              </div>

              <div className="min-w-0 lg:-translate-y-2.5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#9d786d] sm:text-xs">
                  EBOOK READY
                </p>
                <h1 className="mt-2 font-serif text-3xl font-semibold leading-[1.2] tracking-tight text-[#1f1410] sm:text-4xl lg:text-[2.4rem] lg:leading-[1.1]">
                  Your Korean eBook
                  <br />
                  is ready
                </h1>
                <p className="mt-4 text-base leading-relaxed text-[#3d2a22] sm:text-lg sm:leading-8">
                  Start reading now. Your PDF is saved in this browser
                  {emailMasked
                    ? ` and a receipt was sent to ${emailMasked}.`
                    : " and a receipt is on the way to your email."}
                </p>

                <div className="mt-5 space-y-2.5 sm:mt-6">
                  <span className="inline-block max-w-full rounded-full border border-[#c4a99a]/55 bg-white/60 px-3.5 py-1.5 text-sm font-medium leading-none text-[#3d271d] sm:px-4 sm:py-2 sm:text-[0.95rem]">
                    Early reader edition
                  </span>
                  <p className="text-sm leading-relaxed text-[#5c4237] sm:text-base">
                    2–3 hours · Printable PDF · Yours to keep
                  </p>
                </div>

                <div className="mt-9 w-full max-w-md space-y-0 sm:mt-10">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 w-full min-w-0 text-base font-semibold sm:text-lg"
                    variant="primary"
                  >
                    <a
                      href={BOOK_PDF_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BookOpen
                        className="size-6 shrink-0 sm:size-7"
                        aria-hidden
                        strokeWidth={2.25}
                      />
                      Read now
                    </a>
                  </Button>

                  <div className="pt-2">
                    <Button
                      asChild
                      className="h-[42px] w-full min-w-0 border-[rgba(40,36,32,0.28)] bg-white/70 text-sm font-medium text-[#2c221c] transition-[border-color,background-color] hover:border-[rgba(40,36,32,0.4)] hover:bg-white/90"
                      variant="outline"
                    >
                      <a href={BOOK_PDF_HREF} download>
                        <Download
                          className="size-[0.95rem] shrink-0 opacity-90 sm:size-4"
                          aria-hidden
                          strokeWidth={2.1}
                        />
                        Download PDF
                      </a>
                    </Button>
                  </div>

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
                        <dd className="mt-0.5">Saved in this browser</dd>
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
