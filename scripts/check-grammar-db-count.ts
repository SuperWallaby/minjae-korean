import { loadEnvLocal } from "./lib/env_local.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";

async function main() {
  loadEnvLocal(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

  const { comparisonWordsFromSlug } = await import("../src/lib/grammarComparisonSlug.ts");
  const { isDefiniteLowQuality, isLearnerQualityComparison } = await import(
    "./lib/grammar-batch-quality.ts"
  );
  const { listAllComparisonSlugs } = await import("../src/lib/grammarComparisonsRepo.ts");

  const rows = await listAllComparisonSlugs();
  let definite = 0;
  let review = 0;
  let keep = 0;
  for (const row of rows) {
    const words = comparisonWordsFromSlug(row.slug);
    if (isDefiniteLowQuality(words)) definite++;
    else if (!isLearnerQualityComparison(words)) review++;
    else keep++;
  }
  console.log({ db: rows.length, definite, review, keep, has1001: rows.some((r) => r.id === 1001) });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
