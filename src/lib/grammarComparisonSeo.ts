import type { Comparison } from "@/lib/grammarComparisonsRepo";
import { filterConfidentExamples } from "@/lib/grammarComparisonExamples";
import {
  formatKoreanWithRomanization,
  grammarRomanizationVariants,
  romanizeGrammarSentence,
} from "@/lib/grammarRomanization";

export type FaqItem = {
  question: string;
  answer: string;
};

export function buildComparisonFaqItems(comparison: Comparison): FaqItem[] {
  const items: FaqItem[] = [];

  for (const item of comparison.items) {
    const wordSeo = formatKoreanWithRomanization(item.wordName);
    const romHint = grammarRomanizationVariants(item.wordName).join(", ");
    items.push({
      question: `When should I use ${wordSeo}? (${comparison.titleEn})`,
      answer: `${item.meaningEn} — ${item.ruleEn}. Typical situations: ${item.situationsEn.join(", ")}.${romHint ? ` Pronunciation: ${romHint}.` : ""}`,
    });
    items.push({
      question: `${wordSeo}는 언제 쓰나요?`,
      answer: `${item.meaningKo}. ${item.ruleKo} 대표 상황: ${item.situationsKo.join(", ")}.${romHint ? ` 발음: ${romHint}.` : ""}`,
    });
  }

  for (const ex of filterConfidentExamples(comparison.examples)) {
    const verdict = ex.isCorrect ? "Correct" : "Incorrect";
    const rom = romanizeGrammarSentence(ex.sentence);
    items.push({
      question: `Is this sentence ${verdict}? ${ex.sentence}${rom ? ` (${rom})` : ""}`,
      answer: ex.reasonEn,
    });
  }

  for (const quiz of comparison.quizzes) {
    items.push({
      question: quiz.questionEn,
      answer: `${quiz.answer}. ${quiz.explanationEn}`,
    });
  }

  return items;
}

export function buildComparisonFaqJsonLd(
  comparison: Comparison,
  canonicalUrl: string,
) {
  const mainEntity = buildComparisonFaqItems(comparison).map((item) => ({
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

export function buildComparisonBreadcrumbJsonLd(
  comparison: Comparison,
  baseUrl: string,
  canonicalUrl: string,
) {
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
        name: "Comparisons",
        item: `${baseUrl}/grammar/compare`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: comparison.titleEn,
        item: canonicalUrl,
      },
    ],
  };
}
