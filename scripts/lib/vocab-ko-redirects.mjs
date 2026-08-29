import fs from "node:fs";
import path from "node:path";

export function vocabKoRedirectPath(root) {
  return path.join(root, "src/data/vocabInfographic/redirectToGetpronounce.json");
}

export function loadVocabKoRedirects(root) {
  const file = vocabKoRedirectPath(root);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { mappings: {} };
  }
}

/** @returns {string} pin id or "" */
export function koPinIdForVocab(root, bundleId, slug) {
  const mappings = loadVocabKoRedirects(root).mappings || {};
  const bid = String(bundleId || "").trim();
  const sl = String(slug || "").trim();
  if (bid && sl) {
    const hit = mappings[`${bid}/${sl}`];
    if (hit) return String(hit).trim();
  }
  if (bid) {
    const hit = mappings[bid];
    if (hit) return String(hit).trim();
  }
  return "";
}
