import type { QuizBundleData, VocabBundle } from "@/lib/vocabInfographic/bundle-catalog";

export type VocabCaptionLines = {
  line1: string;
  line2: string;
};

export function buildQuizAnswerReply(quiz: QuizBundleData): string {
  const idx = quiz.correctIndex;
  const opt = quiz.options[idx - 1];
  if (!opt) throw new Error(`Invalid correctIndex: ${idx}`);
  return `Answer: ${idx}) ${opt.hangul} [${opt.romanization}]`.slice(0, 280);
}

export function fallbackVocabCaption(
  bundle: Pick<VocabBundle, "title" | "format" | "fit" | "quiz" | "count">,
): VocabCaptionLines {
  if (bundle.format === "quiz_comment" && bundle.quiz) {
    return {
      line1: `Quick quiz — pick the Korean word that matches the English meaning.`,
      line2: `Reply 1–4 below, then check the answer in the comments!`,
    };
  }

  const topic = bundle.title.replace(/ in Korean$/i, "").trim();

  if (bundle.format === "antonym_split") {
    return {
      line1: `Two opposite Korean words — one card, easy to compare.`,
      line2: `Read the Hangul and try saying both sides out loud.`,
    };
  }
  if (bundle.format === "super_list") {
    return {
      line1: `A scannable Korean list: ${topic}.`,
      line2: `Save it and drill the order + pronunciation today.`,
    };
  }
  return {
    line1: `${topic} — ${bundle.count} useful words in one save-worthy card.`,
    line2: `Each item has English, Hangul, and romanization. Practice aloud!`,
  };
}

export function buildVocabXTweetText(input: {
  title: string;
  line1: string;
  line2: string;
  quizQuestion?: string;
}): string {
  const headline =
    input.quizQuestion?.trim() ||
    input.title.trim().replace(/ quiz$/i, "").slice(0, 80);
  const line1 = input.line1.trim().slice(0, 100);
  const line2 = input.line2.trim().slice(0, 100);
  return `🇰🇷 ${headline}\n\n${line1}\n${line2}\n\n#koreanvocab #learnkorean #kajakorean #한국어`.slice(
    0,
    280,
  );
}
