"use client";

import * as React from "react";
import type { Quote } from "@/lib/quotesRepo";
import { Button } from "@/components/ui/Button";
import { Describe } from "@/components/article/Describe";

const QUOTO_HINT_KEY = "quoto-describe-seen";

type Props = {
  initialQuote: Quote | null;
};

export function QuotoPageClient({ initialQuote }: Props) {
  const [quote, setQuote] = React.useState<Quote | null>(initialQuote);
  const [loading, setLoading] = React.useState(false);
  const [bulkText, setBulkText] = React.useState("");
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [bulkMessage, setBulkMessage] = React.useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showRegister, setShowRegister] = React.useState(false);
  const [showHint, setShowHint] = React.useState(true);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(QUOTO_HINT_KEY)) {
        setShowHint(false);
      }
    } catch {
      setShowHint(false);
    }
  }, []);

  const handleDescribeReveal = React.useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(QUOTO_HINT_KEY, "1");
      }
    } catch {
      // ignore
    }
    setShowHint(false);
  }, []);

  const showAnother = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/quoto/random");
      const data = await res.json().catch(() => ({}));
      if (data?.ok && data?.quote) setQuote(data.quote);
    } finally {
      setLoading(false);
    }
  };

  const onBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkMessage(null);
    const lines = bulkText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setBulkMessage({ type: "err", text: "한 줄에 하나씩 명언을 입력해 주세요." });
      return;
    }
    setBulkLoading(true);
    try {
      const res = await fetch("/api/public/quoto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: lines }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && data?.created > 0) {
        setBulkMessage({ type: "ok", text: `${data.created}건 등록되었어요.` });
        setBulkText("");
        if (!quote && data?.quotes?.[0]) setQuote(data.quotes[0]);
      } else {
        setBulkMessage({ type: "err", text: data?.error ?? "등록에 실패했어요." });
      }
    } catch {
      setBulkMessage({ type: "err", text: "등록에 실패했어요." });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <>
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {!quote ? (
          <p className="text-center text-lg text-muted-foreground sm:text-xl">
            아직 등록된 명언이 없어요.
          </p>
        ) : (
          <blockquote className="w-full max-w-2xl text-center">
            <p className="text-2xl font-medium leading-relaxed text-foreground sm:text-3xl md:text-4xl">
              <Describe onReveal={handleDescribeReveal}>{quote.text}</Describe>
            </p>
            {showHint && (
              <p className="mt-4 text-xs text-muted-foreground">
                Click to see meaning
              </p>
            )}
          </blockquote>
        )}
        <div className="mt-10">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={showAnother}
            disabled={loading}
          >
            {loading ? "…" : "Another quote"}
          </Button>
        </div>
      </section>

      {process.env.NODE_ENV === "development" && (
        <section className="border-t border-border bg-muted/20 px-4 py-4">
          <button
            type="button"
            onClick={() => setShowRegister((v) => !v)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {showRegister ? "명언 일괄 등록 접기" : "명언 일괄 등록"}
          </button>
          {showRegister && (
            <form onSubmit={onBulkSubmit} className="mt-3 space-y-2">
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="한 줄에 하나씩 명언 입력"
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={bulkLoading}
              />
              {bulkMessage && (
                <p
                  className={
                    bulkMessage.type === "ok"
                      ? "text-sm text-green-600 dark:text-green-400"
                      : "text-sm text-destructive"
                  }
                >
                  {bulkMessage.text}
                </p>
              )}
              <Button type="submit" variant="secondary" size="sm" disabled={bulkLoading}>
                {bulkLoading ? "등록 중…" : "일괄 등록"}
              </Button>
            </form>
          )}
        </section>
      )}
    </>
  );
}
