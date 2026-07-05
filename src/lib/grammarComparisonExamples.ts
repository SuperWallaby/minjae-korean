import type { ComparisonExample } from "@/lib/grammarComparisonsRepo";

/** Skip examples whose explanation sounds hedged or debatable. */
const UNCERTAIN_REASON_RE =
  /\b(might|maybe|sometimes|could|arguably|depends|not always|often|in some cases|debatable|ambiguous|unclear|borderline|perhaps|somewhat|kind of|sort of|can work|may work|either works|both work|either way|it depends|context-dependent|hard to say|not wrong|not necessarily)\b/i;

export function isConfidentExample(ex: ComparisonExample): boolean {
  const sentence = ex.sentence.trim();
  const reasonEn = ex.reasonEn.trim();
  if (!sentence || !reasonEn) return false;
  if (UNCERTAIN_REASON_RE.test(reasonEn)) return false;
  if (UNCERTAIN_REASON_RE.test(ex.reasonKo)) return false;
  return true;
}

export function filterConfidentExamples(
  examples: ComparisonExample[],
): ComparisonExample[] {
  return examples.filter(isConfidentExample);
}
