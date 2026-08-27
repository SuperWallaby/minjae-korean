import { hangulWritingSample } from "@/lib/worksheetSite/samples/hangul-writing";
import { matchFoodSample } from "@/lib/worksheetSite/samples/match-food";
import { wordBankAdjectivesSample } from "@/lib/worksheetSite/samples/word-bank-adjectives";
import type { WorksheetRecord } from "@/lib/worksheetSite/types";

const WORKSHEETS: WorksheetRecord[] = [
  matchFoodSample,
  wordBankAdjectivesSample,
  hangulWritingSample,
];

const BY_SLUG = new Map(WORKSHEETS.map((w) => [w.slug, w]));

export function listWorksheets(): WorksheetRecord[] {
  return WORKSHEETS;
}

export function getWorksheetBySlug(slug: string): WorksheetRecord | undefined {
  return BY_SLUG.get(slug.trim());
}
