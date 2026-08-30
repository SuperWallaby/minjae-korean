#!/usr/bin/env node
/** Print approved upload-ready count (vocab PNG + quiz word pins). */
import { countApprovedReady } from "./korean-wave-candidates.mjs";

const outDir = process.argv[2];
if (!outDir) process.exit(0);
process.stdout.write(String(countApprovedReady(outDir)));
