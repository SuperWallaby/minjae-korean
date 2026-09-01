import { globalPinCdnOrigin } from "@/lib/mediaUrl";

/** Listing thumb: CDN `/global/pins/{id}.card.webp` (top-cropped; bust when crop changes) */
export function globalPinCardImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".card.webp");
  const bust = "v=top";
  if (/^https?:\/\//i.test(path)) {
    return path.includes("?") ? `${path}&${bust}` : `${path}?${bust}`;
  }
  const abs = `${globalPinCdnOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
  return `${abs}?${bust}`;
}

/** Detail / OG: CDN `/global/pins/{id}.webp` */
export function globalPinPageImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".webp");
  if (/^https?:\/\//i.test(path)) return path;
  return `${globalPinCdnOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}
