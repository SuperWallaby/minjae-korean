import sharp from "sharp";

import {
  getR2LastModified,
  isR2Configured,
  uploadToR2,
} from "@/lib/koreanQuiz/objectStorage";
import { publicUrlForR2Key, quizCdnOriginFromImageUrl } from "@/lib/koreanQuiz/quizMedia";
import type { WeeklyPictureQuiz } from "@/lib/newsletterWeeklyQuiz";

/** Off-white cell background used in weekly quiz emails. */
const EMAIL_QUIZ_IMAGE_BG = { r: 244, g: 244, b: 245, alpha: 1 as const };

const NEWSLETTER_QUIZ_IMAGE_PUBLIC_BASE_DEFAULT =
  "https://file.kajakorean.com";

function resolveNewsletterQuizImagePublicBase(): string {
  const fromEnv =
    process.env.NEWSLETTER_QUIZ_IMAGE_PUBLIC_BASE_URL?.trim() ||
    process.env.R2_PUBLIC_BASE_URL?.trim();
  return (
    fromEnv?.replace(/\/+$/, "") || NEWSLETTER_QUIZ_IMAGE_PUBLIC_BASE_DEFAULT
  );
}

function newsletterQuizEmailImageKey(weekKey: string, letter: string): string {
  const safeWeek = weekKey.replace(/[^0-9A-Za-z-]/g, "");
  const safeLetter = letter.trim().toUpperCase().replace(/[^A-D]/g, "X");
  return `newsletter/weekly-quiz/${safeWeek}/${safeLetter}.jpg`;
}

function isAllowedQuizImageUrl(imageUrl: string): boolean {
  const url = imageUrl.trim();
  if (!url || url.startsWith("data:")) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const allowedOrigins = [
      quizCdnOriginFromImageUrl(url),
      process.env.KOREAN_QUIZ_R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, ""),
      process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, ""),
    ].filter(Boolean);
    return allowedOrigins.some((origin) => parsed.origin === origin);
  } catch {
    return false;
  }
}

async function flattenQuizImageJpeg(sourceUrl: string): Promise<Buffer> {
  const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    throw new Error(`Quiz image fetch failed: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return sharp(buf)
    .resize(296, 296, {
      fit: "contain",
      background: EMAIL_QUIZ_IMAGE_BG,
    })
    .flatten({ background: EMAIL_QUIZ_IMAGE_BG })
    .jpeg({ quality: 86 })
    .toBuffer();
}

/** Upload flattened quiz JPEG to public R2 and return a trusted HTTPS URL for email `<img>`. */
export async function quizImageR2UrlForEmail(args: {
  sourceUrl: string;
  weekKey: string;
  letter: string;
}): Promise<string> {
  const sourceUrl = args.sourceUrl.trim();
  if (!sourceUrl || sourceUrl.startsWith("data:")) return sourceUrl;
  if (!isAllowedQuizImageUrl(sourceUrl)) return sourceUrl;

  if (!isR2Configured()) {
    throw new Error(
      "R2 is not configured — weekly quiz emails need R2 upload for trusted image URLs",
    );
  }

  const key = newsletterQuizEmailImageKey(args.weekKey, args.letter);
  const publicBase = resolveNewsletterQuizImagePublicBase();
  const publicUrl = publicUrlForR2Key(key, publicBase);
  if (!publicUrl) {
    throw new Error("Missing newsletter quiz image public base URL");
  }

  const existing = await getR2LastModified(key);
  if (existing) return publicUrl;

  const jpeg = await flattenQuizImageJpeg(sourceUrl);
  await uploadToR2({
    key,
    body: jpeg,
    contentType: "image/jpeg",
    cacheControl: "public, max-age=604800",
  });

  return publicUrl;
}

export async function flattenQuizImagesForEmail(
  quiz: WeeklyPictureQuiz,
): Promise<WeeklyPictureQuiz> {
  const options = await Promise.all(
    quiz.options.map(async (option) => ({
      ...option,
      imageUrl: await quizImageR2UrlForEmail({
        sourceUrl: option.imageUrl,
        weekKey: quiz.weekKey,
        letter: option.letter,
      }),
    })),
  );
  return { ...quiz, options };
}
