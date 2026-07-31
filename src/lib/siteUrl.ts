const DEFAULT_SITE_ORIGIN = "https://kajakorean.com";

function resolvePublicSiteOrigin(value: string | undefined): string {
  const candidate = value?.trim();
  if (!candidate) return DEFAULT_SITE_ORIGIN;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    const isCanonicalHost =
      hostname === "kajakorean.com" || hostname === "www.kajakorean.com";

    if (url.protocol !== "https:" || !isCanonicalHost) {
      return DEFAULT_SITE_ORIGIN;
    }

    return DEFAULT_SITE_ORIGIN;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

/** Canonical origin for public pages and metadata. */
export const SITE_ORIGIN = resolvePublicSiteOrigin(
  process.env.NEXT_PUBLIC_SITE_URL,
);

/** Builds an absolute public URL from a root-relative path. */
export function siteUrl(path = "/"): string {
  return new URL(path, `${SITE_ORIGIN}/`).toString();
}
