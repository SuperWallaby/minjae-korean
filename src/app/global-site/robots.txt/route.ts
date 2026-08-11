import { globalSiteBase } from "@/lib/globalSite/catalog";

export const runtime = "nodejs";
export const revalidate = 3600;

/**
 * Nested `robots.ts` is not supported by Next.js (root-only), but middleware
 * rewrites global.kajakorean.com/robots.txt → /global-site/robots.txt.
 * This route handler is what actually serves that path.
 */
export function GET() {
  const base = globalSiteBase().replace(/\/+$/, "");
  const host = base.replace(/^https?:\/\//, "");
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /go/",
    "",
    `Host: ${host}`,
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
