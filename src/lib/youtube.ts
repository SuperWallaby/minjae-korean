/**
 * Extract YouTube video ID from URL or return as-is if it looks like an ID.
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, and plain ID (11 chars).
 */
export function parseYouTubeId(urlOrId: string): string | null {
  const s = String(urlOrId ?? "").trim();
  if (!s) return null;
  // Plain video ID (11 chars, alphanumeric + _-)
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/^\/(?:embed|v)\/([\w-]{11})/);
      return m ? m[1] : null;
    }
  } catch {
    // invalid URL
  }
  return null;
}
