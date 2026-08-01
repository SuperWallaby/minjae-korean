/**
 * Compact share token for set-result pages.
 * v1 is URL-safe base64 JSON `{ c, t, d? }` — spoofable by design for fast ship.
 */

export type ShareResultPayload = {
  /** Correct count */
  c: number;
  /** Total questions */
  t: number;
  /** Optional day streak */
  d?: number;
};

function toBase64Url(raw: string): string {
  return Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(token: string): string {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLen), "base64").toString("utf8");
}

export function encodeShareResultToken(payload: ShareResultPayload): string {
  const body: ShareResultPayload = {
    c: Math.max(0, Math.round(payload.c)),
    t: Math.max(1, Math.round(payload.t)),
  };
  if (payload.d != null && payload.d > 0) {
    body.d = Math.round(payload.d);
  }
  return toBase64Url(JSON.stringify(body));
}

export function decodeShareResultToken(token: string): ShareResultPayload | null {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length > 200) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(trimmed)) as Partial<ShareResultPayload>;
    const c = Number(parsed.c);
    const t = Number(parsed.t);
    if (!Number.isFinite(c) || !Number.isFinite(t) || t < 1 || c < 0 || c > t) {
      return null;
    }
    const d = parsed.d == null ? undefined : Number(parsed.d);
    return {
      c: Math.round(c),
      t: Math.round(t),
      ...(d != null && Number.isFinite(d) && d > 0 ? { d: Math.round(d) } : {}),
    };
  } catch {
    return null;
  }
}

export function shareResultSupportiveLine(correct: number, total: number): string {
  if (correct >= total) return "Perfect run";
  if (correct >= total - 2) return "Nice run";
  if (correct >= Math.ceil(total / 2)) return "Good effort";
  return "Finished the set";
}
