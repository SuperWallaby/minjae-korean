"use client";

import { Share2 } from "lucide-react";
import { useCallback, useState } from "react";

type Props = {
  url: string;
  title: string;
};

/**
 * Web Share with clipboard fallback.
 * Android Chrome often rejects share() when `text` duplicates `title`,
 * or when canShare() fails — never leave the user with a dead button.
 */
export function SoundShareButton({ url, title }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const copyLink = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("failed");
      window.setTimeout(() => setStatus("idle"), 2200);
    }
  }, [url]);

  const onShare = useCallback(async () => {
    const shareData: ShareData = { title, url };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        const can =
          typeof navigator.canShare !== "function" ||
          navigator.canShare(shareData);
        if (can) {
          await navigator.share(shareData);
          return;
        }
      }
    } catch (err) {
      // User dismissed sheet — not an error.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Android WebView / in-app browsers often throw DataError / NotAllowedError.
    }
    await copyLink();
  }, [copyLink, title, url]);

  const label =
    status === "copied"
      ? "Copied"
      : status === "failed"
        ? "Copy failed"
        : "Share";

  return (
    <button
      type="button"
      className="sound-share-btn"
      onClick={() => void onShare()}
      aria-label={status === "copied" ? "Link copied" : "Share this chart"}
    >
      <Share2 size={16} strokeWidth={2.25} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
