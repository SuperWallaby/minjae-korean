#!/usr/bin/env node
import { loadEnvLocal } from "./lib/env_local.mjs";

async function main() {
  loadEnvLocal();
  const word = process.argv[2]?.trim() || "화가";
  const english = process.argv[3]?.trim() || "painter";
  const { generateWeeklyQuizExamples } = await import(
    "../src/lib/newsletterQuizExamples.ts"
  );
  const examples = await generateWeeklyQuizExamples({ word, english });
  console.log(JSON.stringify({ word, english, examples }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
