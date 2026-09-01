"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { BookOpen, FileText, Mail, Puzzle } from "lucide-react";

import { SubscribeWelcome } from "@/components/subscribe/SubscribeWelcome";
import { BlogInnerPage } from "@/components/site/BlogInnerPage";
import homeStyles from "@/components/site/home-blog.module.css";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { trackNewsletterSubscribe } from "@/lib/ga";

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
      trackNewsletterSubscribe("subscribe_page");
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
    <BlogInnerPage containerClassName="max-w-2xl">
          <div className="text-center">
              {sent ? (
                <SubscribeWelcome
                  email={email}
                  onSubscribeAgain={resetSubscribe}
                />
              ) : (
                <>
                  <Image
                    src="/brand/logo.webp"
                    alt="Kaja Korean logo"
                    width={72}
                    height={72}
                    className="mx-auto rounded-full"
                  />
                  <p className={`${homeStyles.sectionLabel} mt-5`}>
                    How to study Korean
                  </p>
                  <h1 className={homeStyles.sectionTitle}>
                    Get a free study PDF
                  </h1>
                  <p className={`${homeStyles.sectionBody} mx-auto`}>
                    Join for a Korean study PDF and short notes on how to study
                    Korean — methods and weekly practice from Minjae.
                  </p>

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
                    <label className="grid gap-2.5">
                      <span className="text-sm font-semibold tracking-tight text-[var(--quiz-text)]">
                        Email address
                      </span>
                      <div className="relative">
                        <span
                          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--quiz-primary)]"
                          aria-hidden
                        >
                          <Mail className="size-5" strokeWidth={2.25} />
                        </span>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          inputMode="email"
                          autoComplete="email"
                          disabled={loading}
                          className="h-14 rounded-2xl border-2 border-[color-mix(in_srgb,var(--quiz-primary)_42%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-primary)_6%,var(--quiz-surface))] pl-12 pr-4 text-base font-medium text-[var(--quiz-text)] shadow-[0_10px_28px_color-mix(in_srgb,var(--quiz-primary)_16%,transparent)] placeholder:text-[var(--quiz-text-muted)] focus-visible:border-[var(--quiz-primary)] focus-visible:ring-[var(--quiz-primary)] focus-visible:ring-offset-2"
                        />
                      </div>
                    </label>
                    <Button
                      className="mt-4 w-full shadow-[0_8px_22px_color-mix(in_srgb,var(--quiz-primary)_28%,transparent)]"
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
          </div>
    </BlogInnerPage>
  );
}
