#!/usr/bin/env npx tsx
/**
 * Hanja hub audit CLI (optional manual / CI).
 * Audit is ALREADY automatic when:
 *   - bundle-catalog.ts loads (gen / publish / Next import)
 *   - batch-generate starts
 *   - hub() constructors in catalog waves
 *
 *   yarn vocab:audit-hanja
 *   npx tsx scripts/audit-hanja-hubs.ts --images   # also check local image word dumps
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog";
import {
  auditHanjaHub,
  formatHanjaAuditReport,
  type HanjaAuditIssue,
} from "../src/lib/vocabInfographic/hanjaHubAudit";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GEN = path.join(ROOT, ".tmp/vocab-infographic-gen");
const checkImages = process.argv.includes("--images");

type Row = { id: string; issues: HanjaAuditIssue[]; kind: "catalog" | "image" };

function main() {
  const rows: Row[] = [];

  for (const b of ALL_VOCAB_BUNDLES) {
    if (b.format !== "hanja_hub" || !b.hanjaHub) continue;
    const issues = auditHanjaHub(b.id, b.hanjaHub, { allowlistStrict: true });
    rows.push({ id: b.id, issues, kind: "catalog" });
  }

  if (checkImages) {
    const scheduledPath = path.join(GEN, "vocab-x-scheduled.json");
    const scheduled = existsSync(scheduledPath)
      ? (JSON.parse(readFileSync(scheduledPath, "utf8")) as Record<
          string,
          { imageWords?: Array<{ hangul?: string }> }
        >)
      : {};
    for (const b of ALL_VOCAB_BUNDLES) {
      if (b.format !== "hanja_hub" || !b.hanjaHub) continue;
      const wordsPath = path.join(GEN, `${b.id}.words.json`);
      let words: Array<{ hangul?: string }> = [];
      if (existsSync(wordsPath)) {
        try {
          const raw = JSON.parse(readFileSync(wordsPath, "utf8"));
          words = raw.words || [];
        } catch {
          words = [];
        }
      } else if (scheduled[b.id]?.imageWords) {
        words = scheduled[b.id].imageWords || [];
      }
      if (!words.length) continue;
      // strip hub syllable alone if present
      const sats = words
        .map((w) => ({ hangul: String(w.hangul || "").trim() }))
        .filter((w) => w.hangul && w.hangul !== b.hanjaHub!.syllable);
      const issues = auditHanjaHub(
        b.id,
        {
          ...b.hanjaHub,
          satellites: sats,
        },
        { allowlistStrict: true },
      );
      if (issues.length) {
        rows.push({ id: `${b.id}#image`, issues, kind: "image" });
      }
    }
  }

  const report = formatHanjaAuditReport(
    rows.map((r) => ({ id: `${r.kind}:${r.id}`, issues: r.issues })),
  );
  console.log(report);

  const fail = rows.filter((r) => r.issues.length);
  const outDir = path.join(GEN, "logs");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(outDir, `hanja-audit-${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        failed: fail.length,
        total: rows.length,
        fail: fail.map((r) => ({
          id: r.id,
          kind: r.kind,
          issues: r.issues,
        })),
      },
      null,
      2,
    ),
  );
  console.log(`log=${outPath}`);

  // List image-only fails as regen candidates
  const regen = [
    ...new Set(
      fail
        .filter((r) => r.kind === "image")
        .map((r) => r.id.replace(/#image$/, "")),
    ),
  ];
  if (regen.length) {
    console.log("\nregen candidates (image words off allowlist):");
    for (const id of regen) console.log(`  ${id}`);
  }

  if (fail.some((r) => r.kind === "catalog")) process.exitCode = 1;
}

main();
