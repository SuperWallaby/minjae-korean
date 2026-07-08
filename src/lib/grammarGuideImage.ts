import sharp from "sharp";

import { renderCapybaraDialogueImage } from "@/lib/capybaraDialogueImage";

import type { GrammarGuideType } from "@/lib/grammarGuidesRepo";
import {
  formatGrammarPatternDisplay,
  formatUsageGuideHeadline,
} from "@/lib/grammarPatternDisplay";

const IMAGE_MAX_QUESTION_CHARS = 52;
const IMAGE_MAX_ANSWER_CHARS = 120;

/** English question; Korean appears only as the target word name. */
export function compactQuestionForGuide(
  questionEn: string,
  wordName: string,
  type: GrammarGuideType,
): string {
  const displayWord =
    type === "usage" ? formatGrammarPatternDisplay(wordName) : wordName.trim();
  const fallback =
    type === "meaning"
      ? `What does ${displayWord} mean?`
      : formatUsageGuideHeadline(wordName);

  const q = questionEn.trim();
  if (!q) return fallback;

  const hasHangulOutsideWord = q
    .replace(
      new RegExp(
        wordName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g",
      ),
      "",
    )
    .replace(
      new RegExp(
        displayWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g",
      ),
      "",
    )
    .match(/[\u3131-\uD79D]/);

  if (
    !hasHangulOutsideWord &&
    q.length <= IMAGE_MAX_QUESTION_CHARS &&
    q.split(/\s+/).length <= 12
  ) {
    const cleaned = type === "usage" ? stripGrammarNotationFromQuestion(q) : q;
    return cleaned.endsWith("?") ? cleaned : `${cleaned}?`;
  }

  return fallback;
}

/** Replace textbook notation inside an English question with display form. */
function stripGrammarNotationFromQuestion(question: string): string {
  return question.replace(
    /-\([^)]+\)[가-힣/]+(?:\s+[가-힣/]+)*/g,
    (match) => formatGrammarPatternDisplay(match),
  );
}

/** One punchy sentence for the capybara answer — never a comma-separated keyword list. */
export function compactAnswerForGuide(
  imageAnswerEn: string,
  meaningEn: string,
  summaryEn: string,
): string {
  const normalize = (s: string) => s.trim().replace(/\s+/g, " ");
  const clip = (s: string) => s.slice(0, IMAGE_MAX_ANSWER_CHARS).trim();

  const direct = normalize(imageAnswerEn);
  if (direct && !looksLikeKeywordList(direct)) {
    return clip(direct);
  }

  const meaning = normalize(meaningEn);
  if (meaning) return clip(meaning);

  const summary = normalize(summaryEn);
  const firstSentence =
    summary.match(/^[^.!?]+[.!?]?/)?.[0]?.trim() ?? summary;
  if (firstSentence) return clip(firstSentence);

  return clip(direct || meaning || summary);
}

function looksLikeKeywordList(text: string): boolean {
  const commaParts = text.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
  if (commaParts.length < 2) return false;
  return commaParts.every(
    (p) => p.length <= 36 && !/[.!?]/.test(p) && p.split(/\s+/).length <= 5,
  );
}

export type RenderGrammarGuideImageInput = {
  type: GrammarGuideType;
  questionEn: string;
  wordName: string;
  imageAnswerEn: string;
  meaningEn?: string;
  summaryEn?: string;
  outputWidth?: number;
  webpQuality?: number;
};

/**
 * Render a capybara Q&A guide image as optimized WebP (~960px wide).
 * Answer is always one wrapped sentence — not a per-word keyword list.
 */
export async function renderGrammarGuideImage(
  input: RenderGrammarGuideImageInput,
): Promise<Buffer> {
  const wordName = input.wordName.trim();
  const displayWord =
    input.type === "usage"
      ? formatGrammarPatternDisplay(wordName)
      : wordName;
  const question = compactQuestionForGuide(
    input.questionEn,
    wordName,
    input.type,
  );
  const answer = compactAnswerForGuide(
    input.imageAnswerEn,
    input.meaningEn ?? "",
    input.summaryEn ?? "",
  );

  const png = await renderCapybaraDialogueImage({
    question,
    questionWords: [displayWord],
    answers: answer,
    answerFormat: "sentence",
    textProfile: "guide",
    outputWidth: 1600,
  });

  const width = input.outputWidth ?? 960;
  const quality = input.webpQuality ?? 85;

  return sharp(png)
    .resize(width, undefined, { kernel: sharp.kernel.lanczos3 })
    .webp({ quality, effort: 4 })
    .toBuffer();
}

export function defaultGrammarGuideImageAlt(
  type: GrammarGuideType,
  wordName: string,
): string {
  const word = wordName.trim();
  const display = type === "usage" ? formatGrammarPatternDisplay(word) : word;
  return type === "meaning"
    ? `Korean meaning guide: What does ${display} mean?`
    : `Korean usage guide: When to use ${display}`;
}
