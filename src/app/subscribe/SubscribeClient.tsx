"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { BookOpen, FileText, Puzzle } from "lucide-react";

import { SubscribeWelcome } from "@/components/subscribe/SubscribeWelcome";
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

  const resetSubscribe = () => {
    setSent(false);
    setError(null);
    setEmail("");
  };

  return (
    <MarketingPage containerClassName="max-w-2xl">
      <RevealOnScroll>
        <StaggerReveal>
          <MarketingShell>
            <MarketingShellBody className="text-center">
              {sent ? (
                <SubscribeWelcome
                  email={email}
                  onSubscribeAgain={resetSubscribe}
                />
              ) : (
                <>
                  <Image
                    src="/brand/logo.webp"
                    alt="What is this in Korean logo"
                    width={72}
                    height={72}
                    className="mx-auto rounded-full"
                  />
                  <MarketingHeader
                    eyebrow="Free book"
                    title="Subscribe to What is this in Korean"
                    lead="Join the list and we'll email you a Korean learning PDF made by What is this in Korean — plus Korean quizzes and challenges every week!"
                    centered
                    className="mt-5"
                  />

                  <ul className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm">
                    <li className="flex items-start gap-3 rounded-[1.125rem] border border-[color-mix(in_srgb,var(--quiz-primary)_28%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-primary)_7%,var(--quiz-surface))] px-4 py-3.5 shadow-sm">
                      <FileText className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
                      <span className="text-[var(--quiz-text-sub)]">
                        <strong className="font-semibold text-[var(--quiz-text)]">
                          Free Korean study PDF
                        </strong>
                        , straight to your inbox
                      </span>
                    </li>
                    <li className="flex items-start gap-3 rounded-[1.125rem] border border-[color-mix(in_srgb,var(--quiz-primary)_28%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-primary)_7%,var(--quiz-surface))] px-4 py-3.5 shadow-sm">
                      <Puzzle className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
                      <span className="text-[var(--quiz-text-sub)]">
                        <strong className="font-semibold text-[var(--quiz-text)]">
                          Korean quizzes and challenges every week!
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3 rounded-[1.125rem] border border-[color-mix(in_srgb,var(--quiz-primary)_28%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-primary)_7%,var(--quiz-surface))] px-4 py-3.5 shadow-sm">
                      <BookOpen className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
                      <span className="text-[var(--quiz-text-sub)]">
                        Practical material from a{" "}
                        <strong className="font-semibold text-[var(--quiz-text)]">
                          Korean teacher
                        </strong>
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
                        disabled={loading}
                        className="border-[var(--quiz-border)] bg-[var(--quiz-surface)]"
                      />
                    </label>
                    <Button
                      className="mt-4 w-full"
                      size="lg"
                      variant="primary"
                      type="submit"
                      disabled={loading || !email.trim()}
                    >
                      {loading ? "Subscribing…" : "Get Free Book"}
                    </Button>

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
                </>
              )}
            </MarketingShellBody>
          </MarketingShell>
        </StaggerReveal>
      </RevealOnScroll>
    </MarketingPage>
  );
}
