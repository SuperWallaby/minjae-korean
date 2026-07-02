import sharp from "sharp";

import type { WeeklyPictureQuiz } from "@/lib/newsletterWeeklyQuiz";
import { quizCdnOriginFromImageUrl } from "@/lib/koreanQuiz/quizMedia";

/** Off-white cell background used in weekly quiz emails. */
const EMAIL_QUIZ_IMAGE_BG = { r: 244, g: 244, b: 245, alpha: 1 as const };

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

/** Flatten transparent quiz WebP/PNG onto #f4f4f5 for email clients (Gmail renders alpha as black). */
export async function quizImageDataUriForEmail(sourceUrl: string): Promise<string> {
  const url = sourceUrl.trim();
  if (!url || url.startsWith("data:")) return url;
  if (!isAllowedQuizImageUrl(url)) return url;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return url;
    const buf = Buffer.from(await res.arrayBuffer());
    const jpeg = await sharp(buf)
      .resize(296, 296, {
        fit: "contain",
        background: EMAIL_QUIZ_IMAGE_BG,
      })
      .flatten({ background: EMAIL_QUIZ_IMAGE_BG })
      .jpeg({ quality: 86 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return url;
  }
}

export async function flattenQuizImagesForEmail(
  quiz: WeeklyPictureQuiz,
): Promise<WeeklyPictureQuiz> {
  const options = await Promise.all(
    quiz.options.map(async (option) => ({
      ...option,
      imageUrl: await quizImageDataUriForEmail(option.imageUrl),
    })),
  );
  return { ...quiz, options };
}
