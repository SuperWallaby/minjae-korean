"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";

type Props = {
  bundleId: string;
  pageTitle: string;
  pagePath: string;
};

type Status = "idle" | "sending" | "sent" | "error";

export function VocabNativeQA({ bundleId, pageTitle, pagePath }: Props) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [website, setWebsite] = React.useState(""); // honeypot
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setError("");
    setStatus("sending");

    try {
      const pageUrl =
        typeof window !== "undefined"
          ? window.location.href
          : `https://kajakorean.com${pagePath}`;

      const res = await fetch("/api/public/vocab-native-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          question,
          website,
          bundleId,
          pageTitle,
          pageUrl,
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Could not send. Try again?");
      }

      setStatus("sent");
      setQuestion("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section
      className="rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-5 py-6 sm:px-6"
      aria-labelledby="native-qa-heading"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text-muted)]">
          Ask a native
        </p>
        <h2
          id="native-qa-heading"
          className="text-lg font-semibold text-[var(--quiz-text)]"
        >
          Native Q&amp;A
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--quiz-text-sub)]">
          Leave a question like a comment below. A native Korean speaker —{" "}
          <span className="font-medium text-[var(--quiz-text)]">
            Minjae (site owner)
          </span>{" "}
          — will answer when he can. No account needed.
        </p>
      </div>

      {status === "sent" ? (
        <div
          className="mt-5 rounded-[1rem] border border-[color-mix(in_srgb,var(--quiz-primary)_25%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-primary)_8%,var(--quiz-surface))] px-4 py-4 text-sm text-[var(--quiz-text)]"
          role="status"
        >
          Thanks — question sent. Minjae will get it by email and answer when he
          can.
          <button
            type="button"
            className="mt-2 block text-sm font-semibold text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            onClick={() => setStatus("idle")}
          >
            Ask another
          </button>
        </div>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          {/* honeypot — hidden from people */}
          <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[var(--quiz-text-muted)]">
                Name <span className="font-normal">(optional)</span>
              </span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="How should we call you?"
                className="w-full rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)] px-3.5 py-2.5 text-sm text-[var(--quiz-text)] outline-none placeholder:text-[var(--quiz-text-muted)] focus:border-[var(--quiz-primary)]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[var(--quiz-text-muted)]">
                Email <span className="font-normal">(optional, for reply)</span>
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)] px-3.5 py-2.5 text-sm text-[var(--quiz-text)] outline-none placeholder:text-[var(--quiz-text-muted)] focus:border-[var(--quiz-primary)]"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--quiz-text-muted)]">
              Your question
            </span>
            <textarea
              name="question"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="e.g. Can I use 괜찮아요 with strangers? What's the difference between these two?"
              className="w-full resize-y rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)] px-3.5 py-3 text-sm leading-relaxed text-[var(--quiz-text)] outline-none placeholder:text-[var(--quiz-text-muted)] focus:border-[var(--quiz-primary)]"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={status === "sending" || question.trim().length < 3}
            >
              {status === "sending" ? "Sending…" : "Post question"}
            </Button>
            <p className="text-xs text-[var(--quiz-text-muted)]">
              Goes to Minjae&apos;s inbox — not shown publicly yet.
            </p>
          </div>
        </form>
      )}
    </section>
  );
}
