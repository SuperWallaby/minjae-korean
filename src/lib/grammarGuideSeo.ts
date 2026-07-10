import { filterConfidentExamples } from "@/lib/grammarComparisonExamples";
import type { GrammarGuide, GrammarGuideType } from "@/lib/grammarGuidesRepo";
import { guideBasePath } from "@/lib/grammarGuidesRepo";
import {
  formatGrammarPatternDisplay,
} from "@/lib/grammarPatternDisplay";
import {
  formatKoreanWithRomanization,
  grammarRomanizationVariants,
  romanizeGrammarSentence,
} from "@/lib/grammarRomanization";

export type FaqItem = {
  question: string;
  answer: string;
};

const INDEX_LABELS: Record<GrammarGuideType, string> = {
  meaning: "What does it mean?",
  usage: "How to use",
  "how-to-say": "How to say it",
};

export function buildGuideFaqItems(guide: GrammarGuide): FaqItem[] {
  const items: FaqItem[] = [];
  const displayWord =
    guide.type === "usage"
      ? formatGrammarPatternDisplay(guide.wordName)
      : guide.wordName;
  const wordSeo = formatKoreanWithRomanization(displayWord);
  const romHint = grammarRomanizationVariants(guide.wordName).join(", ");
  const english = guide.englishPhrase?.trim() || guide.titleEn;

  if (guide.type === "meaning") {
    items.push({
      question: `What does ${wordSeo} mean in Korean?`,
      answer: `${guide.meaningEn} ${guide.ruleEn}${romHint ? ` Pronunciation: ${romHint}.` : ""}`,
    });
    items.push({
      question: `${wordSeo}는 무슨 뜻이에요?`,
      answer: `${guide.meaningKo} ${guide.ruleKo}${romHint ? ` 발음: ${romHint}.` : ""}`,
    });
    if (guide.nuancesEn.length > 0) {
      items.push({
        question: `What are the nuances of ${wordSeo}?`,
        answer: guide.nuancesEn.join(" "),
      });
    }
  } else if (guide.type === "usage") {
    items.push({
      question: `How do you use ${wordSeo} in Korean?`,
      answer: `${guide.ruleEn} Typical situations: ${guide.situationsEn.join(", ")}.${romHint ? ` Pronunciation: ${romHint}.` : ""}`,
    });
    items.push({
      question: `${wordSeo}는 어떻게 써요?`,
      answer: `${guide.ruleKo} 대표 상황: ${guide.situationsKo.join(", ")}.${romHint ? ` 발음: ${romHint}.` : ""}`,
    });
  } else {
    items.push({
      question: `How do you say "${english}" in Korean?`,
      answer: `Say ${wordSeo}. ${guide.meaningEn} ${guide.ruleEn}${romHint ? ` Pronunciation: ${romHint}.` : ""}`,
    });
    items.push({
      question: `"${english}"는 한국어로 어떻게 말해요?`,
      answer: `${guide.meaningKo} ${guide.ruleKo}${romHint ? ` 발음: ${romHint}.` : ""}`,
    });
    if (guide.nuancesEn.length > 0) {
      items.push({
        question: `Are there other ways to say "${english}" in Korean?`,
        answer: guide.nuancesEn.join(" "),
      });
    }
  }

  for (const ex of filterConfidentExamples(guide.examples)) {
    const verdict = ex.isCorrect ? "Correct" : "Incorrect";
    const rom = romanizeGrammarSentence(ex.sentence);
    items.push({
      question: `Is this sentence ${verdict}? ${ex.sentence}${rom ? ` (${rom})` : ""}`,
      answer: ex.reasonEn,
    });
  }

  for (const quiz of guide.quizzes) {
    items.push({
      question: quiz.questionEn,
      answer: `${quiz.answer}. ${quiz.explanationEn}`,
    });
  }

  return items;
}

export function buildGuideFaqJsonLd(guide: GrammarGuide, canonicalUrl: string) {
  const mainEntity = buildGuideFaqItems(guide).map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
    url: canonicalUrl,
  };
}

export function buildGuideBreadcrumbJsonLd(
  guide: GrammarGuide,
  baseUrl: string,
  canonicalUrl: string,
) {
  const indexPath = guideBasePath(guide.type);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Grammar",
        item: `${baseUrl}/grammar`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: INDEX_LABELS[guide.type],
        item: `${baseUrl}${indexPath}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: guide.titleEn,
        item: canonicalUrl,
      },
    ],
  };
}
