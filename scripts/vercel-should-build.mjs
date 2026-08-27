#!/usr/bin/env node
/**
 * Vercel Ignored Build Step — one monorepo, many site deploys.
 *
 * Usage (on Vercel project settings):
 *   node scripts/vercel-should-build.mjs minjae-korean
 *   node scripts/vercel-should-build.mjs getpronounce
 *
 * Exit codes (Vercel convention):
 *   0 → skip this project's build
 *   1 → run the build
 *
 * Only paths listed for a site (plus shared infra) trigger that site's deploy.
 * A globalPins-only commit builds getpronounce, not kajakorean.com.
 */
import { execFileSync } from "node:child_process";

const SITE = process.argv[2]?.trim();
if (!SITE) {
  console.error("usage: node scripts/vercel-should-build.mjs <minjae-korean|getpronounce|eigopin>");
  process.exit(1);
}

/** Shared — any change here rebuilds every connected site. */
const SHARED_PREFIXES = [
  "package.json",
  "yarn.lock",
  "package-lock.json",
  "pnpm-lock.yaml",
  "next.config.",
  "tsconfig.json",
  "postcss.config.",
  "tailwind.config.",
  "vercel.json",
  "src/middleware.ts",
  "src/app/layout.tsx",
  "src/app/globals.css",
  "src/app/not-found.tsx",
  "src/lib/buildScope.ts",
  "src/lib/mediaUrl.ts",
  "scripts/vercel-should-build.mjs",
  "scripts/setup-vercel-build-filters.sh",
];

/** kajakorean.com — default Kaja routes & vocab SEO. */
const KAJA_PREFIXES = [
  "src/data/vocabInfographic/",
  "src/app/vocab/",
  "src/app/grammar/",
  "src/app/blog/",
  "src/app/fundamental/",
  "src/app/exams/",
  "src/app/expressions/",
  "src/app/news/",
  "src/app/vocab-quiz/",
  "src/app/coaching/",
  "src/app/drama/",
  "src/app/songs/",
  "src/app/recap/",
  "src/app/quoto/",
  "src/app/list/",
  "src/app/flashcards/",
  "src/app/when-to-use/",
  "src/app/book/",
  "src/app/page.tsx",
  "src/app/privacy/",
  "src/app/terms/",
  "src/app/support/",
  "src/app/subscribe/",
  "src/app/login/",
  "src/app/account/",
  "src/app/admin/",
  "src/app/api/",
  "src/app/r/",
  "src/app/q/",
  "src/components/site/",
  "src/lib/siteBrand",
  "src/lib/siteUrl",
  "src/lib/koreanQuiz/",
  "src/data/blogPosts/",
  "scripts/publish-vocab-seo-pages",
  "scripts/pin-vocab-infographics",
  "scripts/ensure-pinned-vocab-seo",
  "scripts/ensure-vocab-seo-live",
  "scripts/deploy-x-poster",
  "public/brand/",
  "public/favicon",
];

/** getpronounce.net */
const PRONOUNCE_PREFIXES = [
  "src/app/pronounce-site/",
  "src/app/global-site/",
  "src/data/globalPins/",
  "src/lib/globalSite/",
  "src/lib/pronounceSite/",
  "src/lib/atlasRoutes.ts",
  "src/components/pronounce-site/",
  "src/components/global-site/",
  "public/global/",
  "public/getpronounce/",
  "src/app/sound-site/sound.css",
  "vercel.getpronounce.json",
  "scripts/deploy-getpronounce.sh",
  "scripts/auto-push-global-catalog.mjs",
  "scripts/publish-global-pins",
  "scripts/enrich-global-pins",
  "scripts/pin-global-lang-samples",
  "scripts/trigger-getpronounce-deploy.mjs",
  "scripts/post-getpronounce-ready.sh",
  "docs/design/getpronounce.md",
];

/** eigopin.com (+ sound.eigopin.com routes in same deploy). */
const EIGOPIN_PREFIXES = [
  "src/app/ja-site/",
  "src/app/sound-site/",
  "src/data/jaPins/",
  "src/data/soundPins/",
  "src/lib/jaSite/",
  "src/lib/soundSite/",
  "vercel.eigopin.json",
  "scripts/deploy-eigopin.sh",
  "scripts/publish-sound-pins",
  "scripts/pin-sound-samples",
  "scripts/verify-sound-live",
];

const SITE_PREFIXES = {
  "minjae-korean": [...SHARED_PREFIXES, ...KAJA_PREFIXES],
  getpronounce: [...SHARED_PREFIXES, ...PRONOUNCE_PREFIXES],
  eigopin: [...SHARED_PREFIXES, ...EIGOPIN_PREFIXES],
};

const prefixes = SITE_PREFIXES[SITE];
if (!prefixes) {
  console.error(`unknown site: ${SITE}`);
  process.exit(1);
}

function matchesPrefix(file, prefix) {
  if (!file) return false;
  if (prefix.endsWith("/")) return file.startsWith(prefix);
  return file === prefix || file.startsWith(prefix);
}

function fileTriggersSite(file) {
  return prefixes.some((p) => matchesPrefix(file, p));
}

function getChangedFiles() {
  const prev = process.env.VERCEL_GIT_PREVIOUS_SHA?.trim();
  const curr =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.VERCEL_GIT_COMMIT_REF?.trim();
  const range =
    prev && curr ? `${prev} ${curr}` : "HEAD^ HEAD";
  try {
    const out = execFileSync("git", ["diff", "--name-only", ...range.split(/\s+/)], {
      encoding: "utf8",
    });
    return out
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch (e) {
    console.log(
      `vercel-should-build: git diff failed (${e instanceof Error ? e.message : e}) — default build`,
    );
    return null;
  }
}

const changed = getChangedFiles();
if (changed === null) {
  console.log(`vercel-should-build: ${SITE} → BUILD (git unavailable)`);
  process.exit(1);
}

if (changed.length === 0) {
  console.log(`vercel-should-build: ${SITE} → SKIP (no changed files)`);
  process.exit(0);
}

const hits = changed.filter(fileTriggersSite);
const shouldBuild = hits.length > 0;

console.log(
  `vercel-should-build: ${SITE} → ${shouldBuild ? "BUILD" : "SKIP"} (${hits.length}/${changed.length} paths)`,
);
if (hits.length > 0 && hits.length <= 12) {
  for (const f of hits) console.log(`  • ${f}`);
} else if (hits.length > 12) {
  for (const f of hits.slice(0, 8)) console.log(`  • ${f}`);
  console.log(`  … +${hits.length - 8} more`);
}

process.exit(shouldBuild ? 1 : 0);
