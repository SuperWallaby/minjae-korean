/**
 * Build-time scope for dual deploy (Kaja vs Eigopin) from one Next app.
 * When true, skip Kaja/Global static params so Vercel doesn't prerender ~5k Korean SEO pages.
 */
export function isJaOnlyBuild(): boolean {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim();
  return (
    mode === "eigopin" ||
    mode === "eigochart" ||
    mode === "pronounce" ||
    mode === "sound" ||
    mode === "global" ||
    mode === "worksheet"
  );
}

/** Use at the top of generateStaticParams outside ja-site. */
export function kajaStaticParamsOrEmpty<T>(params: T[]): T[] {
  return isJaOnlyBuild() ? [] : params;
}
