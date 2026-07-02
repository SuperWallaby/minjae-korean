"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { BookOpen, FileText, MailCheck, Puzzle } from "lucide-react";

import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

export function SubscribeClient() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "subscribe_page" }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingPage containerClassName="max-w-2xl">
      <RevealOnScroll>
        <StaggerReveal>
          <MarketingShell>
            <MarketingShellBody className="text-center">
              <Image
                src="/brand/logo.webp"
                alt="Kaja logo"
                width={72}
                height={72}
                className="mx-auto rounded-full"
              />
              <MarketingHeader
                eyebrow="Free book"
                title="Subscribe to Kaja"
                lead="Join the list and we'll email you a Korean learning PDF made by Kaja Korean — plus Korean quizzes and challenges you can practice with by email."
                centered
                className="mt-5"
              />

              <ul className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm text-[var(--quiz-text-sub)]">
                <li className="flex items-start gap-3 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
                  <span>Free Korean study PDF, straight to your inbox</span>
                </li>
                <li className="flex items-start gap-3 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3">
                  <Puzzle className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
                  <span>Korean quizzes and challenges sent by email</span>
                </li>
                <li className="flex items-start gap-3 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3">
                  <BookOpen className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
                  <span>
                    Practical material from a professional Korean teacher
                  </span>
                </li>
              </ul>

              <form
                className="mx-auto mt-8 max-w-md text-left"
                onSubmit={(e) => {
                  e.preventDefault();
                  void subscribe();
                }}
              >
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--quiz-text)]">
                    Email address
                  </span>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    inputMode="email"
                    autoComplete="email"
                    disabled={loading || sent}
                    className="border-[var(--quiz-border)] bg-[var(--quiz-surface)]"
                  />
                </label>
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  variant="primary"
                  type="submit"
                  disabled={loading || sent || !email.trim()}
                >
                  {sent
                    ? "Subscribed"
                    : loading
                      ? "Subscribing…"
                      : "Get Free Book"}
                </Button>

                {sent ? (
                  <div className="mt-4 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-4">
                    <div className="flex items-start gap-3 text-left">
                      <div className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-canvas)]">
                        <MailCheck className="size-4 text-[var(--quiz-primary)]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--quiz-text)]">
                          Check your inbox
                        </div>
                        <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
                          Your PDF link is on the way — and you&apos;ll get
                          Korean quizzes and challenges by email too. If you
                          don&apos;t see it, check spam or promotions.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <div className="mt-4 rounded-[1.125rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
              </form>

              <p className="mx-auto mt-8 max-w-md text-xs leading-relaxed text-[var(--quiz-text-muted)]">
                By subscribing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-[var(--quiz-primary)] underline underline-offset-2 hover:no-underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[var(--quiz-primary)] underline underline-offset-2 hover:no-underline"
                >
                  Privacy Policy
                </Link>
                . Unsubscribe anytime from the email footer.
              </p>
            </MarketingShellBody>
          </MarketingShell>
        </StaggerReveal>
      </RevealOnScroll>
    </MarketingPage>
  );
}
