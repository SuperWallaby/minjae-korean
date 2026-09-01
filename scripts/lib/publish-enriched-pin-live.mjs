/**
 * TTS/copy just written → R2 lang shard + ISR warm for that pin.
 * Do not wait for the end-of-round auto-push.
 */
import { uploadGlobalCatalogJson } from "./upload-global-catalog-r2.mjs";
import { warmGlobalPins } from "../warm-global-pin-isr.mjs";

export async function publishEnrichedPinLive(page, opts = {}) {
  if (process.env.GLOBAL_ENRICH_LIVE_PUBLISH === "0") return false;
  const id = String(page?.id || "").trim();
  const lang = String(page?.lang || "").trim().toLowerCase();
  if (!id) return false;

  const ok = await uploadGlobalCatalogJson({
    langs: lang ? [lang] : undefined,
    skipMonolith: true,
    skipIndex: opts.skipIndex !== false,
  });
  if (!ok) {
    console.warn("  live catalog skip (R2)");
    return false;
  }
  if (process.env.GLOBAL_ISR_SKIP_WARM === "1") return true;

  await warmGlobalPins({
    ids: [id],
    langs: lang ? [lang] : [],
    source: id,
    skipHub: true,
    skipInvalidate: Boolean(opts.skipInvalidate),
  });
  return true;
}
