/**
 * Pinterest topic clusters — block near-duplicate motion/opposite pins
 * (enter/exit, rise/fall, open/close) across ant/sim/tr- id variants.
 */
import fs from "node:fs";
import path from "node:path";

/** Canonical cluster id → slug aliases (catalog + trend twins). */
const CLUSTER_ALIASES = new Map([
  ["enter-exit", "motion_enter_exit"],
  ["come-in-go-out", "motion_enter_exit"],
  ["step-in-step-out", "motion_enter_exit"],
  ["stock-enter-exit", "motion_enter_exit"],
  ["sim-enter-exit", "motion_enter_exit"],
  ["up-down", "motion_up_down"],
  ["rise-fall", "motion_up_down"],
  ["land-takeoff", "motion_up_down"],
  ["open-closed", "motion_open_close"],
  ["open-secret", "motion_open_close"],
  ["open-close2", "motion_open_close"],
  ["open-close-devices", "motion_open_close"],
  ["open-close-school", "motion_open_close"],
  ["open-turn-on", "motion_open_close"],
  ["open-unlock", "motion_open_close"],
  ["arrive-leave", "motion_arrive_depart"],
  ["arrive-reach", "motion_arrive_depart"],
  ["leave-depart", "motion_arrive_depart"],
  ["start-vs-depart", "motion_arrive_depart"],
  ["arrive-vs-depart", "motion_arrive_depart"],
  ["early-late-arrive", "motion_arrive_depart"],
]);

function stripTrendPrefix(id) {
  const raw = String(id || "").trim().toLowerCase();
  if (raw.startsWith("tr-") && raw.endsWith("-tr") && raw.length > 6) {
    return raw.slice(3, -3);
  }
  if (raw.startsWith("tr-")) return raw.slice(3);
  return raw;
}

/** Normalize bundle id to semantic slug (drops format prefix). */
export function semanticSlug(id) {
  let s = stripTrendPrefix(id);
  s = s.replace(/^(ant|sim|concept|quiz|grid|list|phrase|cute|cmp|hanja|topik|gram)-/, "");
  return s;
}

/** @returns {string|null} cluster key e.g. motion_enter_exit */
export function topicClusterKey(id) {
  const slug = semanticSlug(id);
  if (!slug) return null;
  if (CLUSTER_ALIASES.has(slug)) return CLUSTER_ALIASES.get(slug);
  for (const [alias, cluster] of CLUSTER_ALIASES) {
    if (slug === alias || slug.endsWith(`-${alias}`) || slug.includes(`${alias}-`)) {
      return cluster;
    }
  }
  return null;
}

/** All bundle ids sharing a topic cluster (from scheduled + optional extra ids). */
export function buildClusterIndex(scheduledIds, extraIds = []) {
  const byCluster = new Map();
  const all = [...new Set([...scheduledIds, ...extraIds].map(String).filter(Boolean))];
  for (const id of all) {
    const cluster = topicClusterKey(id);
    if (!cluster) continue;
    if (!byCluster.has(cluster)) byCluster.set(cluster, new Set());
    byCluster.get(cluster).add(id);
  }
  return byCluster;
}

/** ids in the same Pinterest topic cluster as `id`. */
export function pinClusterIds(id, clusterIndex) {
  const cluster = topicClusterKey(id);
  if (!cluster || !clusterIndex?.has(cluster)) return [];
  return [...clusterIndex.get(cluster)];
}

export function isClusterPinned(id, pinned, clusterIndex) {
  for (const alt of pinClusterIds(id, clusterIndex)) {
    if (pinned[alt]) return true;
  }
  return false;
}

/** One-shot audit for operators. */
export function auditPinnedClusters(pinned, scheduled, review = {}) {
  const scheduledIds = Object.keys(scheduled || {});
  const index = buildClusterIndex(scheduledIds, Object.keys(pinned || {}));
  const out = [];
  for (const [cluster, ids] of index) {
    const pinnedIn = [...ids].filter((id) => pinned[id]);
    if (pinnedIn.length <= 1) continue;
    out.push({
      cluster,
      pinned: pinnedIn,
      members: [...ids],
      pending: [...ids].filter((id) => review[id]?.status === "pending"),
    });
  }
  return out.sort((a, b) => b.pinned.length - a.pinned.length);
}
