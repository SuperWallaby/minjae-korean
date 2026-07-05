#!/usr/bin/env node
/**
 * Preview capybara Q&A overlay (question left, answer list right, line connectors).
 *
 *   node scripts/render_capybara_dialogue.mjs
 *   node scripts/render_capybara_dialogue.mjs "what are other words for reply?" "response,answer,respond,rejoinder,retort"
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const question =
    process.argv[2]?.trim() || "what are other words for reply?";
  const answers =
    process.argv[3]?.trim() ||
    "response, answer, respond, rejoinder, retort, return, riposte, rejoin, react, counter";

  const { renderCapybaraDialogueImage } = await import(
    "../src/lib/capybaraDialogueImage.ts"
  );

  const png = await renderCapybaraDialogueImage({ question, answers });
  const outDir = join(ROOT, ".tmp");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "capybara-dialogue-preview.png");
  writeFileSync(outPath, png);
  console.log(JSON.stringify({ ok: true, out: outPath, question, answers }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
