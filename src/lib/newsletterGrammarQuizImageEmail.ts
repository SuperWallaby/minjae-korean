import sharp from "sharp";

import {
  getR2LastModified,
  isR2Configured,
  uploadToR2,
} from "@/lib/koreanQuiz/objectStorage";
import { publicUrlForR2Key } from "@/lib/koreanQuiz/quizMedia";
import type { GrammarQuizDigest } from "@/lib/newsletterGrammarQuiz";

import { NEWSLETTER_EMAIL_IMAGE } from "@/lib/newsletterEmailImage";

const EMAIL_IMAGE_BG = { r: 255, g: 255, b: 255, alpha: 1 as const };
const DEFAULT_PUBLIC_BASE = "https://file.kajakorean.com";
const { maxWidth: EMAIL_MAX_WIDTH, quality: EMAIL_JPEG_QUALITY } =
  NEWSLETTER_EMAIL_IMAGE.grammarQuiz;

function resolvePublicBase(): string {
  const fromEnv =
    process.env.NEWSLETTER_QUIZ_IMAGE_PUBLIC_BASE_URL?.trim() ||
    process.env.R2_PUBLIC_BASE_URL?.trim();
  return fromEnv?.replace(/\/+$/, "") || DEFAULT_PUBLIC_BASE;
}

function emailImageKey(weekKey: string, trialId: string): string {
  const safeWeek = weekKey.replace(/[^0-9A-Za-z-]/g, "");
  const safeId = trialId.replace(/[^0-9A-Za-z_-]/g, "").slice(0, 80);
  // v2: tighter progressive JPEG for inboxes (~720px)
  return `newsletter/grammar-quiz/v2/${safeWeek}/${safeId}.jpg`;
}

function isAllowedImageUrl(imageUrl: string): boolean {
  const url = imageUrl.trim();
  if (!url || url.startsWith("data:")) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const allowed = [
      DEFAULT_PUBLIC_BASE,
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

async function flattenJpeg(sourceUrl: string): Promise<Buffer> {
  const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    throw new Error(`Grammar quiz image fetch failed: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return sharp(buf)
    .rotate()
    .resize(EMAIL_MAX_WIDTH, null, {
      fit: "inside",
      withoutEnlargement: true,
      background: EMAIL_IMAGE_BG,
    })
    .flatten({ background: EMAIL_IMAGE_BG })
    .jpeg({
      quality: EMAIL_JPEG_QUALITY,
      progressive: true,
      mozjpeg: true,
      chromaSubsampling: "4:2:0",
    })
    .toBuffer();
}

export async function flattenGrammarQuizForEmail(
  digest: GrammarQuizDigest,
): Promise<GrammarQuizDigest> {
  const sourceUrl = digest.trial.imageUrl.trim();
  if (!sourceUrl || !isAllowedImageUrl(sourceUrl)) {
    return digest;
  }

  const key = emailImageKey(digest.weekKey, digest.trial.id);
  const publicBase = resolvePublicBase();
  const publicUrl = publicUrlForR2Key(key, publicBase);
  if (!publicUrl) return digest;

  const existing = await getR2LastModified(key);
  if (existing) {
    return { ...digest, trial: { ...digest.trial, imageUrl: publicUrl } };
  }
  if (await publicObjectExists(publicUrl)) {
    return { ...digest, trial: { ...digest.trial, imageUrl: publicUrl } };
  }

  if (!isR2Configured()) {
    return digest;
  }

  const jpeg = await flattenJpeg(sourceUrl);
  await uploadToR2({
    key,
    body: jpeg,
    contentType: "image/jpeg",
    cacheControl: "public, max-age=604800",
  });

  return { ...digest, trial: { ...digest.trial, imageUrl: publicUrl } };
}
