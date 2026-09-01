/**
 * Build-time scope for dual deploy (Kaja vs Eigopin) from one Next app.
 * When true, skip Kaja/Global static params so Vercel doesn't prerender ~5k Korean SEO pages.
 */

/** Strip accidental trailing `\n` from Vercel env values (literal or real newline). */
function siteMode(): string {
  return String(process.env.NEXT_PUBLIC_SITE_MODE || "")
    .trim()
    .replace(/\\n$/g, "")
    .trim();
}

export function isJaOnlyBuild(): boolean {
  const mode = siteMode();
  return (
    mode === "eigopin" ||
    mode === "eigochart" ||
    mode === "pronounce" ||
    mode === "sound" ||
    mode === "global" ||
    mode === "worksheet"
  );
}

/**
 * Cloudflare OpenNext kaja builds: vocab is noindex + mostly redirected to
 * getpronounce. Prerendering ~5k vocab pages dominates build time for no SEO.
 * Pages still work on-demand via dynamicParams.
 */
export function skipVocabStaticParams(): boolean {
  return process.env.OPENNEXT_CF === "1";
}

/** Use at the top of generateStaticParams outside ja-site. */
export function kajaStaticParamsOrEmpty<T>(params: T[]): T[] {
  if (isJaOnlyBuild() || skipVocabStaticParams()) return [];
  return params;
}

/** Pronounce / atlas lang hubs — only on getpronounce (or full local) builds. */
export function pronounceStaticParamsOrEmpty<T>(params: T[]): T[] {
  const mode = siteMode();
  if (!mode || mode === "pronounce" || mode === "global") return params;
  return [];
}

/**
 * Pin / chart detail pages: never prerender the full catalog at build.
 * First hit generates + R2 ISR caches (revalidate on the page). Lang hubs/home stay SSG.
 */
export function pinStaticParamsOrEmpty<T>(_params: T[]): T[] {
  return [];
}
