import { comparisonWordsFromSlug } from "../src/lib/grammarComparisonSlug.ts";
import { isDefiniteLowQuality, isLearnerQualityComparison } from "./lib/grammar-batch-quality.ts";

function classify(slug: string) {
  const words = comparisonWordsFromSlug(slug);
  return {
    slug,
    words,
    definite: isDefiniteLowQuality(words),
    learner: isLearnerQualityComparison(words),
  };
}

for (const slug of [
  "하지만-그런데-그렇지만",
  "프론트-vs-백엔드",
  "수도-vs-인터넷",
  "갑자기운동하다-vs-운동하다",
  "많이-너무-아주",
  "이해하다-vs-이해되다",
]) {
  console.log(classify(slug));
}
