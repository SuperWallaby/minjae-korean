/**
 * Sidecar of pin ids from the last global enrich round.
 * ISR warm reads this (or the pipeline log) after R2 catalog upload.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { langFromPinId } from "./atlas-pin-destination.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function lastRoundPaths(root = ROOT) {
  return [
    path.join(root, ".tmp", "global-pin-enrich", "last-round.json"),
    path.join(
      os.homedir(),
      "Library",
      "Application Support",
      "kaja",
      "global-pin-enrich",
      "last-round.json",
    ),
  ];
}

export function pipelineLatestPath() {
  return path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "kaja",
    "global-pin-enrich",
    "logs",
    "pipeline.latest",
  );
}

export function writeLastEnrichRound(pages, root = ROOT) {
  const rows = (pages || []).filter((p) => p?.id);
  const ids = [...new Set(rows.map((p) => String(p.id).trim()))];
  const langs = [
    ...new Set(
      rows
        .map((p) =>
          String(p.lang || langFromPinId(p.id) || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  ];
  const payload = JSON.stringify(
    { at: new Date().toISOString(), ids, langs },
    null,
    2,
  );
  for (const file of lastRoundPaths(root)) {
    try {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, `${payload}\n`, "utf8");
    } catch {
      /* Desktop .tmp may be TCC-blocked from launchd */
    }
  }
  return { ids, langs };
}

export function readLastEnrichRound({
  root = ROOT,
  maxAgeMs = 4 * 60 * 60 * 1000,
} = {}) {
  for (const file of lastRoundPaths(root)) {
    if (!existsSync(file)) continue;
    try {
      const j = JSON.parse(readFileSync(file, "utf8"));
      const at = Date.parse(j?.at || "") || 0;
      if (maxAgeMs > 0 && at && Date.now() - at > maxAgeMs) continue;
      const ids = Array.isArray(j?.ids)
        ? j.ids.map((s) => String(s).trim()).filter(Boolean)
        : [];
      if (!ids.length) continue;
      const langs = Array.isArray(j?.langs)
        ? j.langs.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
        : [...new Set(ids.map((id) => langFromPinId(id)).filter(Boolean))];
      return { ids, langs, at: j.at, source: file };
    } catch {
      /* skip */
    }
  }
  return null;
}

export function parsePipelineIds(logPath = pipelineLatestPath()) {
  if (!existsSync(logPath)) return { ids: [], langs: [] };
  let raw = "";
  try {
    raw = readFileSync(logPath, "utf8");
  } catch {
    return { ids: [], langs: [] };
  }
  const ids = [];
  const seen = new Set();
  for (const line of raw.split("\n")) {
    const m = line.match(/^→\s+(\S+)/);
    if (!m) continue;
    const id = m[1].trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  const langs = [
    ...new Set(ids.map((id) => langFromPinId(id)).filter(Boolean)),
  ];
  return { ids, langs, source: logPath };
}
