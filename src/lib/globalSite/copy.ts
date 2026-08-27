/** First sentence only — pin ledes stay short on mobile. */
export function firstSentence(text: string | null | undefined): string {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = t.match(/^[\s\S]+?[.!?。！？](?=\s|$)/);
  return (m?.[0] || t).trim();
}
