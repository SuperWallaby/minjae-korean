/** Live atlas pin URLs on getpronounce.net (legacy global.kajakorean.com 301s here). */

export const PRONOUNCE_ORIGIN = (
  process.env.PRONOUNCE_SITE_URL || "https://getpronounce.net"
).replace(/\/+$/, "");

const PREFIX_LANGS = new Set(["es", "fr", "de", "it", "ar", "ja", "ko"]);

export function langFromPinId(id) {
  const m = String(id || "").match(/__([a-z]{2})$/i);
  return m ? m[1].toLowerCase() : "";
}

export function pronouncePinPath(id, lang) {
  const pinId = String(id || "").trim();
  const code = String(lang || langFromPinId(pinId) || "")
    .trim()
    .toLowerCase();
  const enc = encodeURIComponent(pinId);
  if (!code || code === "zh") return `/pin/${enc}`;
  if (PREFIX_LANGS.has(code)) return `/${code}/pin/${enc}`;
  return `/pin/${enc}`;
}

export function pronouncePinUrl(id, lang, campaign = "global-lang-pin") {
  const u = new URL(pronouncePinPath(id, lang), `${PRONOUNCE_ORIGIN}/`);
  u.searchParams.set("utm_source", "pinterest");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}
