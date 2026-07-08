import { synthesizeEdgeTtsMp3 } from "@/lib/edgeTtsServer";
import {
  getR2LastModified,
  isR2Configured,
  uploadToR2,
} from "@/lib/koreanQuiz/objectStorage";
import {
  publicUrlForR2Key,
  quizCdnOriginFromImageUrl,
} from "@/lib/koreanQuiz/quizMedia";
import type { GrammarGuide, GrammarGuideType } from "@/lib/grammarGuidesRepo";

export function buildGrammarGuidePronunciationR2Key(
  type: GrammarGuideType,
  id: number,
): string {
  return `grammar-guides/${type}/${id}/pronunciation.mp3`;
}

/** Korean text to speak — strips textbook notation when present. */
export function grammarGuideSpeakableText(wordName: string): string {
  const s = wordName.trim();
  if (!s) return s;
  if (!s.startsWith("-") && !/[()]/.test(s)) return s;

  const stripped = s
    .replace(/^-+/, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return stripped || s;
}

function resolveCdnOrigin(imageUrl?: string): string | undefined {
  return (
    quizCdnOriginFromImageUrl(imageUrl) ||
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "")
  );
}

export function getCachedGrammarGuidePronunciationUrl(
  guide: Pick<
    GrammarGuide,
    "type" | "id" | "imageUrl" | "pronunciationUrl"
  >,
): string | undefined {
  if (guide.pronunciationUrl?.trim()) {
    return guide.pronunciationUrl.trim();
  }
  if (!isR2Configured()) return undefined;

  const origin = resolveCdnOrigin(guide.imageUrl);
  const key = buildGrammarGuidePronunciationR2Key(guide.type, guide.id);
  return publicUrlForR2Key(key, origin) ?? undefined;
}

export async function ensureGrammarGuidePronunciation(
  guide: Pick<
    GrammarGuide,
    "type" | "id" | "slug" | "wordName" | "imageUrl" | "pronunciationUrl"
  >,
): Promise<string | null> {
  if (guide.type !== "meaning") return null;

  if (guide.pronunciationUrl?.trim()) {
    return guide.pronunciationUrl.trim();
  }

  if (isR2Configured()) {
    const key = buildGrammarGuidePronunciationR2Key(guide.type, guide.id);
    const modified = await getR2LastModified(key);
    if (modified) {
      const origin = resolveCdnOrigin(guide.imageUrl);
      return publicUrlForR2Key(key, origin);
    }
  } else {
    return null;
  }

  const text = grammarGuideSpeakableText(guide.wordName);
  let audio: Buffer;
  try {
    audio = await synthesizeEdgeTtsMp3(text);
  } catch {
    return null;
  }

  const key = buildGrammarGuidePronunciationR2Key(guide.type, guide.id);
  await uploadToR2({
    key,
    body: audio,
    contentType: "audio/mpeg",
    cacheControl: "public, max-age=31536000, immutable",
  });

  const origin = resolveCdnOrigin(guide.imageUrl);
  return publicUrlForR2Key(key, origin);
}
