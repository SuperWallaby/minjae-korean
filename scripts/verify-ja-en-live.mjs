#!/usr/bin/env node
/**
 * Smoke-check live EigoChart pin pages after deploy.
 *
 *   yarn ja:verify-live
 *   yarn ja:verify-live --id 14_greetings__en-ja
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src", "data", "jaPins", "published.json");
const SITE = (
  process.env.NEXT_PUBLIC_JA_SITE_ORIGIN ||
  process.env.EIGOCHART_SITE_URL ||
  "https://eigopin.com"
).replace(/\/+$/, "");

function parseArgs(argv) {
  const ids = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--id" && argv[i + 1]) ids.push(argv[++i]);
    else if (argv[i].startsWith("--id=")) ids.push(argv[i].slice(5));
    else if (argv[i] === "--ids" && argv[i + 1]) {
      ids.push(
        ...String(argv[++i])
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else if (argv[i].startsWith("--ids=")) {
      ids.push(
        ...argv[i]
          .slice(6)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return { ids };
}

async function check(url) {
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (head.ok) return head.status;
    const get = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: { Accept: "text/html" },
    });
    return get.status;
  } catch (e) {
    return e instanceof Error ? e.message : "fail";
  }
}

async function main() {
  const { ids } = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(fs.readFileSync(PUBLISHED, "utf8"));
  let pages = catalog.pages || [];
  if (ids.length) pages = pages.filter((p) => ids.includes(p.id));
  if (!pages.length) {
    console.log("no pages");
    process.exitCode = 1;
    return;
  }
  console.log(`==> verify ${pages.length} pin pages on ${SITE}`);
  let fail = 0;
  for (const p of pages) {
    const url = `${SITE}/pin/${encodeURIComponent(p.id)}`;
    const status = await check(url);
    const ok = status === 200;
    if (!ok) fail += 1;
    console.log(`${ok ? "OK" : "FAIL"} ${status}  ${url}`);
  }
  if (fail) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
