import sharp from "sharp";

import {
  getR2LastModified,
  isR2Configured,
  uploadToR2,
} from "@/lib/koreanQuiz/objectStorage";
import { publicUrlForR2Key } from "@/lib/koreanQuiz/quizMedia";
import type {
  ExpressionPinCandidate,
  PopularExpressionsDigest,
} from "@/lib/newsletterPopularExpressions";

const EMAIL_PIN_IMAGE_BG = { r: 255, g: 255, b: 255, alpha: 1 as const };

const NEWSLETTER_PIN_IMAGE_PUBLIC_BASE_DEFAULT = "https://file.kajakorean.com";

function resolveNewsletterPinImagePublicBase(): string {
  const fromEnv =
    process.env.NEWSLETTER_QUIZ_IMAGE_PUBLIC_BASE_URL?.trim() ||
    process.env.R2_PUBLIC_BASE_URL?.trim();
  return (
    fromEnv?.replace(/\/+$/, "") || NEWSLETTER_PIN_IMAGE_PUBLIC_BASE_DEFAULT
  );
}

function newsletterExpressionEmailImageKey(
  weekKey: string,
  bundleId: string,
): string {
  const safeWeek = weekKey.replace(/[^0-9A-Za-z-]/g, "");
  const safeId = bundleId.replace(/[^0-9A-Za-z_-]/g, "").slice(0, 80);
  return `newsletter/popular-expressions/${safeWeek}/${safeId}.jpg`;
}

function isAllowedPinImageUrl(imageUrl: string): boolean {
  const url = imageUrl.trim();
  if (!url || url.startsWith("data:")) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const allowed = [
      "https://file.kajakorean.com",
      process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, ""),
      process.env.NEWSLETTER_QUIZ_IMAGE_PUBLIC_BASE_URL?.trim().replace(
        /\/$/,
        "",
      ),
    ].filter(Boolean);
    return allowed.some((origin) => parsed.origin === origin);
  } catch {
    return false;
  }
}

async function publicObjectExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(12_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function flattenPinImageJpeg(sourceUrl: string): Promise<Buffer> {
  const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    throw new Error(`Pin image fetch failed: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return sharp(buf)
    .resize(1120, null, {
      fit: "inside",
      withoutEnlargement: true,
      background: EMAIL_PIN_IMAGE_BG,
    })
    .flatten({ background: EMAIL_PIN_IMAGE_BG })
    .jpeg({ quality: 82 })
    .toBuffer();
}

export async function pinImageR2UrlForEmail(args: {
  sourceUrl: string;
  weekKey: string;
  bundleId: string;
}): Promise<string> {
  const sourceUrl = args.sourceUrl.trim();
  if (!sourceUrl || sourceUrl.startsWith("data:")) return sourceUrl;
  if (!isAllowedPinImageUrl(sourceUrl)) return sourceUrl;

  const key = newsletterExpressionEmailImageKey(args.weekKey, args.bundleId);
  const publicBase = resolveNewsletterPinImagePublicBase();
  const publicUrl = publicUrlForR2Key(key, publicBase);
  if (!publicUrl) {
    throw new Error("Missing newsletter pin image public base URL");
  }

  const existing = await getR2LastModified(key);
  if (existing) return publicUrl;
  if (await publicObjectExists(publicUrl)) return publicUrl;

  if (!isR2Configured()) {
    // Fall back to original CDN URL (webp) when R2 write isn't available.
    return sourceUrl;
  }

  const jpeg = await flattenPinImageJpeg(sourceUrl);
  await uploadToR2({
    key,
    body: jpeg,
    contentType: "image/jpeg",
    cacheControl: "public, max-age=604800",
  });

  return publicUrl;
}

export async function flattenExpressionPinsForEmail(
  digest: PopularExpressionsDigest,
): Promise<PopularExpressionsDigest> {
  const pins: ExpressionPinCandidate[] = await Promise.all(
    digest.pins.map(async (pin) => ({
      ...pin,
      imageUrl: await pinImageR2UrlForEmail({
        sourceUrl: pin.imageUrl,
        weekKey: digest.weekKey,
        bundleId: pin.bundleId,
      }),
    })),
  );
  return { ...digest, pins };
}
