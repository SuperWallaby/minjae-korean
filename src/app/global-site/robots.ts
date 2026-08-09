import type { MetadataRoute } from "next";
import { globalSiteBase } from "@/lib/globalSite/catalog";

export default function robots(): MetadataRoute.Robots {
  const base = globalSiteBase();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
