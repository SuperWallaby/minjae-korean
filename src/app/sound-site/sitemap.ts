import type { MetadataRoute } from "next";
import { listSoundPins, soundSiteBase } from "@/lib/soundSite/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = soundSiteBase();
  const now = new Date();
  const pins = listSoundPins();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...pins.map((p) => ({
      url: `${base}/pin/${encodeURIComponent(p.id)}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
