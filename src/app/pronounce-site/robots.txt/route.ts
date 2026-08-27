import { globalSiteBase } from "@/lib/globalSite/catalog";

export const runtime = "nodejs";
export const revalidate = 3600;

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
