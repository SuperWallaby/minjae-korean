#!/usr/bin/env node
/**
 * Rebuild vocab catalog master list:
 *  1) Format-by-format inventory
 *  2) Exact + semantic dedupe
 *  3) Audit pass (drop / merge / reformat / review)
 *  4) Write KEEP master + DROPPED + per-format lists
 *
 *   npx tsx scripts/rebuild-vocab-catalog-list.ts
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALL_VOCAB_BUNDLES,
  type VocabBundle,
} from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { DROP_IDS as LEGACY_DROP_IDS } from "./lib/vocab-batch-config.mjs";
import type { VocabInfographicFormatId } from "../src/lib/vocabInfographic/formats.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "vocab-catalog-rebuild");
const GEN = join(ROOT, ".tmp", "vocab-infographic-gen");

type Severity = "drop" | "merge" | "reformat" | "rename" | "review" | "dedupe";

type Flag = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  severity: Severity;
  reason: string;
  suggestion: string;
};

type MasterEntry = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  count: number;
  priority: string;
  tags: string[];
  fit: string;
  hasPng: boolean;
  pinned: boolean;
  status: "keep" | "drop" | "merge_into" | "reformat";
  notes?: string[];
  mergeInto?: string;
};

const GRID_ABSTRACT = new Set([
  "animal-groups",
  "eco-green-living",
  "mental-health-words",
  "meeting-business",
  "email-words",
  "presentation-words",
  "remote-work",
  "software-ui",
  "internet-terms",
  "streaming-media",
  "cybersecurity-basic",
  "ecommerce-shopping",
  "coding-basics",
  "kpop-fan-words",
  "kdrama-words",
  "video-game-terms",
  "attitudes-mindset",
  "mood-swings",
  "historical-figures-korea",
  "seasonal-festivals-korea",
  "korean-etiquette",
]);

const GRID_16_DUP: Record<string, string> = {
  "grid-office-supplies-16": "grid-office-supplies",
  "grid-kitchen-16": "grid-kitchen-tools",
  "grid-school-16": "grid-classroom-objects",
  "grid-clothing-16": "grid-tops-clothing",
  "grid-nature-16": "grid-landscape-features",
};

const WEAK_ANTONYM = new Set([
  "borrow-return",
  "early-bird-night-owl",
  "literary-spoken",
  "singular-plural",
  "thirsty-hydrated",
  "loud-silent-place",
  "success-fail",
  "honest-dishonest",
  "employed-unemployed",
  "married-single",
  "urban-rural",
  "north-south",
  "east-west",
  "public-private",
  "local-foreign",
]);

const SUPER_DROP = new Set([
  "list-weekdays",
  "list-seasons",
  "list-hangul-double-consonants",
  "list-seoul-districts",
  "list-kpop-generations",
  "list-zodiac-signs-western",
  "list-currency-world-major",
  "list-math-symbols-words",
  "list-percent-fraction-words",
  "list-romanization-guide",
  "list-keyboard-hangul-layout",
  "list-shopping-phrases-short",
  "list-decades-centuries",
]);

/** Known near-duplicate families: keep first id, drop/merge rest. */
const MERGE_FAMILIES: string[][] = [
  ["grid-pet-supplies", "grid-pet-home-items", "grid-pet-furniture"],
  ["grid-beach-nature", "grid-beach-travel", "grid-beach-items-extra"],
  ["grid-camping-outdoors", "grid-camping-hobby", "grid-camping-gear-extra", "grid-camping-cooking"],
  ["grid-photography-digital", "grid-photography-hobby", "grid-camera-photo-words"],
  ["grid-daily-routine-verbs", "grid-morning-routine-verbs"],
  ["grid-chuseok-words", "grid-chuseok-foods", "grid-holidays-korean", "grid-seollal-words", "grid-newyear-words"],
  ["grid-insects-garden", "grid-insects-household", "grid-insects-extra", "grid-bugs-kids-learn"],
  ["grid-taste-flavor-adj", "grid-taste-adj-extra"],
  ["list-numbers-tens", "list-numbers-powers-ten"],
  ["list-counting-practice-1-12", "list-numbers-1-20"],
  ["list-colors-basic", "list-colors-extended"],
  ["list-counters-people-objects", "list-counters-common"],
];

function slugOf(id: string) {
  return id.replace(/^(grid|ant|list|quiz|concept|phrase)-/, "");
}

function normalizeTitle(t: string) {
  return t
    .toLowerCase()
    .replace(/\s+in korean$/i, "")
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .trim();
}

function hasPng(id: string) {
  return existsSync(join(GEN, `${id}.png`));
}

function loadPinned(): Set<string> {
  const p = join(GEN, "pinterest-pinned.json");
  if (!existsSync(p)) return new Set();
  try {
    return new Set(Object.keys(JSON.parse(readFileSync(p, "utf8"))));
  } catch {
    return new Set();
  }
}

function flag(
  flags: Flag[],
  b: VocabBundle,
  severity: Severity,
  reason: string,
  suggestion: string,
) {
  flags.push({
    id: b.id,
    format: b.format,
    title: b.title,
    severity,
    reason,
    suggestion,
  });
}

function auditAll(bundles: VocabBundle[]): Flag[] {
  const flags: Flag[] = [];
  const byId = new Map(bundles.map((b) => [b.id, b]));

  // Exact id dupes
  const seenIds = new Map<string, number>();
  for (const b of bundles) {
    seenIds.set(b.id, (seenIds.get(b.id) || 0) + 1);
  }
  for (const [id, n] of seenIds) {
    if (n > 1) {
      const b = byId.get(id)!;
      flag(flags, b, "dedupe", `duplicate id appears ${n} times`, "keep one definition");
    }
  }

  // Exact title dupes
  const byTitle = new Map<string, VocabBundle[]>();
  for (const b of bundles) {
    const k = normalizeTitle(b.title);
    if (!byTitle.has(k)) byTitle.set(k, []);
    byTitle.get(k)!.push(b);
  }
  for (const [, group] of byTitle) {
    if (group.length < 2) continue;
    const keep = group.find((g) => hasPng(g.id)) || group[0]!;
    for (const b of group) {
      if (b.id === keep.id) continue;
      flag(
        flags,
        b,
        "dedupe",
        `duplicate title with ${keep.id}`,
        `merge into ${keep.id}`,
      );
    }
  }

  for (const b of bundles) {
    const slug = slugOf(b.id);

    if (LEGACY_DROP_IDS.has(b.id)) {
      flag(flags, b, "drop", "legacy DROP_IDS (prior audit)", "exclude from keep master");
    }

    if (b.format === "grid_cluster") {
      if (GRID_ABSTRACT.has(slug)) {
        flag(flags, b, "drop", "abstract/meta — weak for 9-icon grid", "drop");
      }
      if (GRID_16_DUP[b.id]) {
        flag(
          flags,
          b,
          "drop",
          `16-cell duplicate of ${GRID_16_DUP[b.id]}`,
          `keep ${GRID_16_DUP[b.id]} only`,
        );
      }
      if (/\bAdj in Korean$/i.test(b.title) || /\bVerbs in Korean$/i.test(b.title)) {
        flag(flags, b, "rename", "awkward auto title", "hand-write title");
      }
    }

    if (b.format === "antonym_split" && WEAK_ANTONYM.has(slug)) {
      flag(flags, b, "drop", "weak antonym for IG card", "drop");
    }

    if (b.format === "super_list") {
      if (b.count < 9) {
        flag(
          flags,
          b,
          "reformat",
          `super_list count ${b.count} < 9`,
          "pad, merge, or move to grid/phrase_stack",
        );
      }
      if (SUPER_DROP.has(b.id)) {
        flag(flags, b, "drop", "niche / text-heavy / weak order key", "drop");
      }
    }

    if (b.format === "phrase_stack" && (b.count < 6 || b.count > 10)) {
      flag(
        flags,
        b,
        "review",
        `phrase_stack count ${b.count} outside 6–10 sweet spot`,
        "trim or split",
      );
    }

    if (b.format === "concept_rows" && (b.count < 3 || b.count > 5)) {
      flag(
        flags,
        b,
        "review",
        `concept_rows count ${b.count} outside 3–5`,
        "adjust panels",
      );
    }
  }

  for (const family of MERGE_FAMILIES) {
    const present = family.filter((id) => byId.has(id));
    if (present.length < 2) continue;
    const keep =
      present.find((id) => hasPng(id)) ||
      present.find((id) => !LEGACY_DROP_IDS.has(id)) ||
      present[0]!;
    for (const id of present) {
      if (id === keep) continue;
      flag(
        flags,
        byId.get(id)!,
        "merge",
        `near-duplicate family of ${keep}`,
        `merge into ${keep}`,
      );
    }
  }

  return flags;
}

function worstSeverity(flags: Flag[]): Severity | null {
  const order: Severity[] = ["drop", "dedupe", "merge", "reformat", "rename", "review"];
  for (const s of order) {
    if (flags.some((f) => f.severity === s)) return s;
  }
  return null;
}

function buildMaster(bundles: VocabBundle[], flags: Flag[], pinned: Set<string>) {
  const byIdFlags = new Map<string, Flag[]>();
  for (const f of flags) {
    if (!byIdFlags.has(f.id)) byIdFlags.set(f.id, []);
    byIdFlags.get(f.id)!.push(f);
  }

  const entries: MasterEntry[] = [];
  const seen = new Set<string>();

  for (const b of bundles) {
    if (seen.has(b.id)) continue;
    seen.add(b.id);

    const fl = byIdFlags.get(b.id) || [];
    const sev = worstSeverity(fl);
    const mergeInto = fl.find((f) => f.suggestion.startsWith("merge into "))?.suggestion
      .replace(/^merge into\s+/, "")
      .replace(/\s+only$/, "");

    let status: MasterEntry["status"] = "keep";
    if (sev === "drop" || sev === "dedupe") status = "drop";
    else if (sev === "merge") status = "merge_into";
    else if (sev === "reformat") status = "reformat";

    entries.push({
      id: b.id,
      format: b.format,
      title: b.title,
      count: b.count,
      priority: b.priority,
      tags: b.tags,
      fit: b.fit,
      hasPng: hasPng(b.id),
      pinned: pinned.has(b.id),
      status,
      notes: fl.map((f) => `[${f.severity}] ${f.reason}`),
      mergeInto: status === "merge_into" ? mergeInto : undefined,
    });
  }

  return entries;
}

function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(join(OUT, "by-format"), { recursive: true });

  const pinned = loadPinned();
  const flags = auditAll(ALL_VOCAB_BUNDLES);
  const master = buildMaster(ALL_VOCAB_BUNDLES, flags, pinned);

  const formats: VocabInfographicFormatId[] = [
    "grid_cluster",
    "antonym_split",
    "similar_split",
    "super_list",
    "quiz_comment",
    "concept_rows",
    "phrase_stack",
    "topik_upgrade",
    "cute_cast",
    "hanja_hub",
    "pronunciation_grid",
    "grammar_spotlight",
    "compound_word",
    "phrase_square",
  ];

  const byFormat: Record<string, MasterEntry[]> = {};
  for (const fmt of formats) {
    const list = master.filter((m) => m.format === fmt);
    byFormat[fmt] = list;
    writeFileSync(
      join(OUT, "by-format", `${fmt}.json`),
      JSON.stringify(list, null, 2),
    );
    const md = [
      `# ${fmt}`,
      "",
      `| status | count |`,
      `|---|---|`,
      ...["keep", "drop", "merge_into", "reformat"].map((s) => {
        const n = list.filter((x) => x.status === s).length;
        return `| ${s} | ${n} |`;
      }),
      "",
      `## KEEP`,
      "",
      ...list
        .filter((x) => x.status === "keep")
        .map(
          (x) =>
            `- \`${x.id}\` — ${x.title} (n=${x.count}${x.hasPng ? ", png" : ""}${x.pinned ? ", pinned" : ""})`,
        ),
      "",
      `## DROP / MERGE / REFORMAT`,
      "",
      ...list
        .filter((x) => x.status !== "keep")
        .map(
          (x) =>
            `- **${x.status}** \`${x.id}\` — ${x.title}${x.mergeInto ? ` → ${x.mergeInto}` : ""}${x.notes?.length ? ` · ${x.notes[0]}` : ""}`,
        ),
      "",
    ].join("\n");
    writeFileSync(join(OUT, "by-format", `${fmt}.md`), md);
  }

  const keep = master.filter((m) => m.status === "keep");
  const dropped = master.filter((m) => m.status !== "keep");

  writeFileSync(join(OUT, "MASTER_KEEP.json"), JSON.stringify(keep, null, 2));
  writeFileSync(join(OUT, "MASTER_ALL.json"), JSON.stringify(master, null, 2));
  writeFileSync(join(OUT, "DROPPED.json"), JSON.stringify(dropped, null, 2));
  writeFileSync(join(OUT, "AUDIT_FLAGS.json"), JSON.stringify(flags, null, 2));

  const dropIds = dropped.filter((d) => d.status === "drop").map((d) => d.id);
  writeFileSync(
    join(OUT, "DROP_IDS.suggested.txt"),
    dropIds.sort().join("\n") + "\n",
  );

  const summary = {
    catalogTotal: ALL_VOCAB_BUNDLES.length,
    uniqueIds: master.length,
    keep: keep.length,
    drop: dropped.filter((d) => d.status === "drop").length,
    merge_into: dropped.filter((d) => d.status === "merge_into").length,
    reformat: dropped.filter((d) => d.status === "reformat").length,
    keepWithPng: keep.filter((k) => k.hasPng).length,
    keepPinned: keep.filter((k) => k.pinned).length,
    keepMissingPng: keep.filter((k) => !k.hasPng).length,
    byFormat: Object.fromEntries(
      formats.map((fmt) => {
        const list = master.filter((m) => m.format === fmt);
        return [
          fmt,
          {
            total: list.length,
            keep: list.filter((x) => x.status === "keep").length,
            drop: list.filter((x) => x.status === "drop").length,
            merge_into: list.filter((x) => x.status === "merge_into").length,
            reformat: list.filter((x) => x.status === "reformat").length,
            keepMissingPng: list.filter((x) => x.status === "keep" && !x.hasPng)
              .length,
          },
        ];
      }),
    ),
    outDir: OUT,
  };

  writeFileSync(join(OUT, "SUMMARY.json"), JSON.stringify(summary, null, 2));

  const summaryMd = [
    `# Vocab catalog rebuild summary`,
    "",
    `- Catalog rows: **${summary.catalogTotal}**`,
    `- Unique ids: **${summary.uniqueIds}**`,
    `- KEEP: **${summary.keep}** (png ${summary.keepWithPng}, missing ${summary.keepMissingPng}, pinned ${summary.keepPinned})`,
    `- DROP: **${summary.drop}** · MERGE: **${summary.merge_into}** · REFORMAT: **${summary.reformat}**`,
    "",
    `## By format`,
    "",
    `| format | total | keep | drop | merge | reformat | keep missing png |`,
    `|---|---:|---:|---:|---:|---:|---:|`,
    ...formats.map((fmt) => {
      const s = summary.byFormat[fmt] as {
        total: number;
        keep: number;
        drop: number;
        merge_into: number;
        reformat: number;
        keepMissingPng: number;
      };
      return `| ${fmt} | ${s.total} | ${s.keep} | ${s.drop} | ${s.merge_into} | ${s.reformat} | ${s.keepMissingPng} |`;
    }),
    "",
    `Files: \`${OUT}\``,
    "",
  ].join("\n");
  writeFileSync(join(OUT, "SUMMARY.md"), summaryMd);

  console.log(summaryMd);
}

main();
