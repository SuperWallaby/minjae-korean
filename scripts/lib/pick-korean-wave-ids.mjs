#!/usr/bin/env node
/**
 * Pick approved unpinned ids for a Korean pin wave (vocab + quiz word pins).
 * Format-balanced; quiz word pins capped per wave/day (KR_PIN_QUIZ_WORD_*).
 *
 *   node scripts/lib/pick-korean-wave-ids.mjs <outDir> <limit>
 */
import { pickKoreanWaveIds } from "./korean-wave-candidates.mjs";

const outDir = process.argv[2];
const limit = Math.max(0, Number(process.argv[3]) || 0);
if (!outDir || !limit) process.exit(0);

process.stdout.write(pickKoreanWaveIds(outDir, limit).join(","));
