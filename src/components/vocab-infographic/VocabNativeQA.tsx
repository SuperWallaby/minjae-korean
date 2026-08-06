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
    <section className="space-y-3" aria-labelledby="native-qa-heading">
      <div className="space-y-1">
        <h2
          id="native-qa-heading"
          className="text-lg font-semibold text-[var(--quiz-text)]"
        >
          Native Q&amp;A
        </h2>
        <p className="text-sm text-[var(--quiz-text-sub)]">
          Write a question — Minjae (native Korean, site owner) will answer when
          he can.
        </p>
      </div>

      {status === "sent" ? (
        <div
          className="text-sm text-[var(--quiz-text)]"
          role="status"
        >
          Sent. You can write another anytime.
          <button
            type="button"
            className="ml-2 font-semibold text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            onClick={() => setStatus("idle")}
          >
            Ask again
          </button>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
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

          <textarea
            name="question"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Write your question…"
            className="w-full resize-y rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-3.5 py-3 text-sm leading-relaxed text-[var(--quiz-text)] outline-none placeholder:text-[var(--quiz-text-muted)] focus:border-[var(--quiz-primary)]"
          />

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={status === "sending" || question.trim().length < 3}
          >
            {status === "sending" ? "Posting…" : "Post"}
          </Button>
        </form>
      )}
    </section>
  );
}
