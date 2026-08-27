/** getpronounce.net — Chinese pronunciation charts (Sound-like). */

export const PRONOUNCE_SITE_NAME = "GetPronounce";
export const PRONOUNCE_SITE_TAGLINE = "Hear how Chinese sounds";
export const PRONOUNCE_SITE_DESCRIPTION =
  "Hear how Mandarin and Cantonese words sound — CN / TW / HK accents with female & male voices, slow and normal speed.";

export const PRONOUNCE_SITE_DEFAULT_ORIGIN = "https://getpronounce.net";

export function isPronounceSiteDeployment(): boolean {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim();
  return mode === "pronounce" || mode === "getpronounce";
}

export function pronounceSiteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_PRONOUNCE_SITE_ORIGIN?.trim();
  if (env) return env.replace(/\/+$/, "");
  return PRONOUNCE_SITE_DEFAULT_ORIGIN;
}

export function pronounceSiteHomeTitle(): string {
  return `${PRONOUNCE_SITE_NAME} · ${PRONOUNCE_SITE_TAGLINE}`;
}

export function pronounceSiteTitleTemplate(): string {
  return `%s · ${PRONOUNCE_SITE_NAME}`;
}
