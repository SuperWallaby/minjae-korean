"use client";

import { useState } from "react";
import { trackNewsletterSubscribe } from "@/lib/ga";
import {
  MIXUPS_LIST,
  mixupsCopyForLang,
  resolveMixupsLang,
} from "@/lib/pronounceMixups";

type Props = {
  source: string;
  lang: string;
  compact?: boolean;
};

export function MixupsSubscribeForm({
  source,
  lang,
  compact = false,
}: Props) {
  const copy = mixupsCopyForLang(lang);
  const resolvedLang = resolveMixupsLang(lang);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          lang: resolvedLang,
          list: MIXUPS_LIST,
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Something went wrong. Please try again.");
        return;
      }
      trackNewsletterSubscribe(source);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <p className="mixups-form-ok" role="status">
        {copy.confirm}
      </p>
    );
  }

  return (
    <form
      className={compact ? "mixups-form mixups-form-compact" : "mixups-form"}
      onSubmit={(e) => {
        e.preventDefault();
        void subscribe();
      }}
    >
      <label className="mixups-form-label">
        <span className="visually-hidden">Email</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          inputMode="email"
          required
          disabled={loading}
        />
      </label>
      <button
        className="global-btn"
        type="submit"
        disabled={loading || !email.trim()}
      >
        {loading ? "Sending…" : copy.cta}
      </button>
      {error ? (
        <p className="mixups-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
