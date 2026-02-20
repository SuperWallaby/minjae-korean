/**
 * Smart Unsplash search with AI fallback.
 * Searches Unsplash for the given word. If no results, uses Gemini to translate
 * and try related words (up to 3 attempts total).
 * @returns Image URL or null if not found
 */
export async function smartUnsplashSearch(word: string): Promise<string | null> {
  const trimmed = word.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `/api/admin/unsplash/smart-search?q=${encodeURIComponent(trimmed)}`,
    );
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok && json?.url) {
      return String(json.url);
    }
    return null;
  } catch {
    return null;
  }
}
