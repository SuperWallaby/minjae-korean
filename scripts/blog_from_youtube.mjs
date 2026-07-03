import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { azureChat, stripCodeFence } from "./lib/azure_chat.mjs";
import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";
import {
  blogPostToTsx,
  parseBlogMarkdown,
  patchBlogTsxImages,
  readStyleRef,
  registerBlogSlug,
  slugify,
  writeBlogTsx,
} from "./lib/blog_markdown_to_tsx.mjs";
import { generateBlogCoverAssets } from "./lib/blog_cover_image.mjs";
import { fetchOneYoutubeDigest, parseVideoId } from "./lib/youtube_transcript.mjs";

const LOG = "[blog-pipeline] ";
const STYLE = (name) => readStyleRef(name, ROOT);

function normalizeMode(raw) {
  const mode = String(raw || "").trim().toLowerCase();
  if (mode === "essay" || mode === "seo") return mode;
  throw new Error(`Unknown --mode: ${raw} (use seo or essay)`);
}

const ESSAY_TITLE_SYSTEM = `You synthesize Korean YouTube topics into English blog posts for a Korean teacher's site.

${STYLE("synthesis.md")}

${STYLE("title-style.md")}

Return JSON only:
{
  "thesis": "one sentence — new angle, not a summary",
  "titles": ["3-5 hook titles using I/my when helpful — NOT listicle titles"],
  "slugSuggestion": "lowercase-english-hyphens",
  "level": 1-5
}

level guide for blog readers (English learners of Korean):
1-2 = very simple English
3 = default conversational
4-5 = denser but still clear`;

const SEO_TITLE_SYSTEM = `You turn Korean-learning YouTube transcripts into SEO/AEO/GEO-focused English blog articles for a Korean teacher's site.

Goal:
- Search traffic first, not Substack/Medium essay vibes.
- Answer-engine friendliness: the article should be easy for Google snippets, ChatGPT, Perplexity, and Gemini to quote.
- Choose one clear search intent a learner might type into Google.
- Prefer practical keywords such as "how to learn Korean", "Korean study plan", "Korean words for beginners", "Korean subtitles", "Korean pronunciation".
- Titles must include the primary keyword or a close variant.
- Prefer question-style search queries when they fit, e.g. "is Korean hard to learn", "how long does it take to learn Korean", "can you learn Korean with K-dramas".

Return JSON only:
{
  "thesis": "one sentence — useful angle for learners",
  "primaryKeyword": "one exact target keyword",
  "searchIntent": "what the searcher wants solved",
  "directAnswer": "2-3 sentence answer to the primary query, written for featured snippets",
  "titles": ["3-5 SEO titles, clear and searchable, no clickbait"],
  "slugSuggestion": "lowercase-english-hyphens",
  "metaDescription": "145-160 character SEO description",
  "relatedKeywords": ["4-8 related search phrases"],
  "faq": [
    { "question": "search-style learner question", "answer": "short direct answer, 1-3 sentences" }
  ],
  "level": 1-5
}

FAQ rules:
- 4-6 questions.
- Questions must match real search or answer-engine phrasing.
- Answers must be concise, factual, and not fluffy.

Do not make Medium-style titles like "I Thought X..." unless they still clearly match search intent.`;

const ESSAY_DRAFT_SYSTEM = `You write an English opinion essay for a Korean teacher's blog.

${STYLE("synthesis.md")}

${STYLE("writing-style.md")}

Output markdown only:
# Title (exact chosen title)

## Section subtitle (plain, no colons)

Body paragraphs...

Rules:
- 5-8 sections with ## subtitles
- English body; optional Korean phrase as [[KO: 한국어 문장]] once or twice max
- Observations ("I suspect", "my take") — NO fake personal stories
- NO semicolons (;)
- NO listicle structure
- End with a short closing section (no "Source:" line — added later)
- Do not name people from the video; no "the video says"`;

const SEO_DRAFT_SYSTEM = `You write an SEO/AEO/GEO-focused English Korean-learning guide for a Korean teacher's site.

This is NOT a Medium/Substack essay. It should help a searcher solve a concrete Korean-learning problem.

Output markdown only:
# Title (exact chosen title)

Opening requirement:
- Start with a short direct answer paragraph BEFORE the first H2.
- The first sentence should answer the main query immediately.
- This paragraph should be 2-4 sentences and suitable for a featured snippet.

## Question-style or searchable section title

Body...

Rules:
- Use the primary keyword naturally in the intro and at least one H2.
- 6-9 useful H2 sections. Keep H2 titles plain, searchable, and often question-style. No colons.
- Include one section titled "Key Takeaway" near the end with 2-4 concise bullets or short paragraphs.
- Include practical Korean examples using [[KO: ...]] where helpful.
- Explain what the Korean means, when to use it, and beginner mistakes.
- Include at least one section titled "Common Mistakes".
- Include a "FAQ" section with 4-6 learner questions and direct 1-3 sentence answers.
- English body; Korean snippets are allowed with [[KO: 한국어 문장]].
- NO semicolons (;)
- No fake personal stories.
- No "the video says" or source-retelling.
- No Source line — added later.

AEO/GEO rules:
- Add concise definition-style sentences when useful, e.g. "Korean speech levels are..."
- Make important answer sentences self-contained, so an answer engine can quote them without extra context.
- Avoid vague reflections. Prefer direct answer, explanation, example, and mistake.

Tone:
- Friendly teacher, clear and useful.
- Human but not overly literary.
- Searcher should leave with steps, examples, and a better mental model.`;

const MODE_CONFIG = {
  essay: {
    titleStep: "Thesis + essay titles",
    draftStep: "Draft essay",
    titleSystem: ESSAY_TITLE_SYSTEM,
    draftSystem: ESSAY_DRAFT_SYSTEM,
  },
  seo: {
    titleStep: "SEO brief + titles",
    draftStep: "SEO guide draft",
    titleSystem: SEO_TITLE_SYSTEM,
    draftSystem: SEO_DRAFT_SYSTEM,
  },
};

function parseArgs(argv) {
  const val = (flag, fallback = null) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  const has = (flag) => argv.includes(flag);
  const url = val("--url") || val("-u");
  return {
    url,
    mode: normalizeMode(val("--mode", process.env.BLOG_PIPELINE_MODE || "seo")),
    titleIndex: Number.parseInt(val("--title-index", "0"), 10) || 0,
    register: has("--register"),
    skipDeai: has("--skip-deai"),
    skipCover: has("--skip-cover"),
    coverOnly: has("--cover-only"),
    passes: Number.parseInt(val("--passes", "5"), 10) || 5,
    input: val("--input"),
    outDir: val("--out-dir", join(ROOT, ".tmp", "blog-pipeline")),
  };
}

function runDeAi(inputPath, outPath, passes) {
  const py = spawnSync(
    "python3",
    [join(ROOT, "scripts", "de-ai.py"), inputPath, "--out", outPath, "--passes", String(passes)],
    { cwd: ROOT, stdio: "inherit", env: process.env },
  );
  if (py.status !== 0 && py.status !== 1) {
    throw new Error(`de-ai.py failed with exit ${py.status}`);
  }
}

async function proposeTitles(digest, mode) {
  const config = MODE_CONFIG[mode];
  const user = `YouTube source (Korean transcript excerpt):
Title: ${digest.title}
Channel: ${digest.channelTitle}
URL: ${digest.url}

Transcript:
${digest.textForPersonalSummary.slice(0, 6000)}`;

  const raw = await azureChat({
    system: config.titleSystem,
    user,
    temperature: mode === "seo" ? 0.45 : 0.8,
    maxTokens: mode === "seo" ? 2600 : 2000,
    jsonMode: true,
  });
  const json = JSON.parse(stripCodeFence(raw));
  if (!Array.isArray(json.titles) || !json.titles.length) {
    throw new Error("Title step returned no titles");
  }
  return json;
}

async function writeDraft(digest, title, proposal, mode) {
  const config = MODE_CONFIG[mode];
  const seoBits =
    mode === "seo"
      ? `Primary keyword: ${proposal.primaryKeyword || ""}
Search intent: ${proposal.searchIntent || ""}
Direct answer to use near the top: ${proposal.directAnswer || ""}
Meta description target: ${proposal.metaDescription || ""}
Related keywords: ${(proposal.relatedKeywords || []).join(", ")}
FAQ questions to cover:
${(proposal.faq || [])
  .map((x, i) => `${i + 1}. ${x.question} — ${x.answer}`)
  .join("\n")}`
      : "";
  const user = `Chosen title: ${title}
Thesis to build around: ${proposal.thesis}
${seoBits}

Source transcript:
${digest.textForPersonalSummary.slice(0, 8000)}`;

  const raw = await azureChat({
    system: config.draftSystem,
    user,
    temperature: mode === "seo" ? 0.55 : 0.75,
    maxTokens: mode === "seo" ? 9000 : 8000,
  });
  let md = stripCodeFence(raw);
  if (!md.startsWith("# ")) {
    md = `# ${title}\n\n${md}`;
  }
  md += `\n\n**Source:** Inspired by a Korean YouTube discussion (${digest.url}).`;
  return md;
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  const modeConfig = MODE_CONFIG[args.mode];

  mkdirSync(args.outDir, { recursive: true });
  const indexPath = join(ROOT, "src", "data", "blogPosts", "index.ts");
  const contentDir = join(ROOT, "src", "data", "blogPosts", "content");

  let digest;
  if (args.input) {
    const inputPath = resolve(ROOT, args.input);
    digest = JSON.parse(readFileSync(inputPath, "utf8"));
    if (Array.isArray(digest.results)) digest = digest.results[0];
  } else {
    const videoId = parseVideoId(args.url);
    if (!videoId) {
      console.error(`${LOG}Need --url with a YouTube link or 11-char id`);
      process.exit(1);
    }
    console.error(`${LOG}[1/7] Fetching transcript for ${videoId}…`);
    digest = await fetchOneYoutubeDigest(videoId);
    const digestPath = join(args.outDir, "youtube-one-digest.json");
    writeFileSync(
      digestPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), results: [digest] }, null, 2),
    );
    console.error(`${LOG}  saved ${digestPath}`);
  }

  console.error(`${LOG}mode: ${args.mode}`);
  console.error(`${LOG}[2/7] ${modeConfig.titleStep}…`);
  const proposal = await proposeTitles(digest, args.mode);
  const titleIdx = Math.min(Math.max(0, args.titleIndex), proposal.titles.length - 1);
  const title = proposal.titles[titleIdx];
  const slug = slugify(proposal.slugSuggestion || title);
  console.error(`${LOG}  thesis: ${proposal.thesis}`);
  if (args.mode === "seo") {
    console.error(`${LOG}  keyword: ${proposal.primaryKeyword || "(none)"}`);
  }
  console.error(`${LOG}  title [${titleIdx}]: ${title}`);
  console.error(`${LOG}  slug: ${slug}`);
  writeFileSync(join(args.outDir, `${slug}-proposal.json`), JSON.stringify(proposal, null, 2));

  console.error(`${LOG}[3/7] ${modeConfig.draftStep}…`);
  const draftMd = await writeDraft(digest, title, proposal, args.mode);
  const draftPath = join(args.outDir, `${slug}-draft.md`);
  writeFileSync(draftPath, draftMd, "utf8");
  console.error(`${LOG}  saved ${draftPath}`);

  let finalMd = draftMd;
  if (!args.skipDeai) {
    console.error(`${LOG}[4/7] De-AI (${args.passes} passes)…`);
    const finalPath = join(args.outDir, `${slug}.md`);
    runDeAi(draftPath, finalPath, args.passes);
    finalMd = readFileSync(finalPath, "utf8");
  } else {
    console.error(`${LOG}[4/7] De-AI skipped`);
  }

  console.error(`${LOG}[5/7] TSX generate…`);
  const parsed = parseBlogMarkdown(finalMd);
  const postTitle = parsed.title || title;
  let coverAssets = null;

  const tsx = blogPostToTsx({
    slug,
    title: postTitle,
    description: proposal.metaDescription,
    keywords:
      args.mode === "seo"
        ? [proposal.primaryKeyword, ...(proposal.relatedKeywords || [])].filter(Boolean)
        : undefined,
    faq: args.mode === "seo" ? proposal.faq : undefined,
    level: proposal.level || 3,
    videoId: digest.videoId,
    sections: parsed.sections,
  });
  const tsxPath = join(contentDir, `${slug}.tsx`);

  if (!args.register) {
    const previewPath = join(args.outDir, `${slug}.tsx`);
    writeFileSync(previewPath, tsx, "utf8");
    console.error(`${LOG}  preview ${previewPath} (use --register to write to content/)`);
  } else {
    process.env.BLOG_FORCE_OVERWRITE = process.env.BLOG_FORCE_OVERWRITE || "1";
    writeBlogTsx(tsxPath, tsx);
    console.error(`${LOG}  wrote ${tsxPath}`);
    console.error(`${LOG}[6/7] Register in index.ts…`);
    const reg = registerBlogSlug(slug, indexPath);
    console.error(`${LOG}  ${reg.reason}`);
  }

  if (!args.skipCover) {
    console.error(`${LOG}[7/7] Cover image (gpt-image-2)…`);
    try {
      coverAssets = await generateBlogCoverAssets({
        title: postTitle,
        thesis: proposal.thesis,
        slug,
        outDir: args.outDir,
      });
      if (args.register) {
        patchBlogTsxImages(tsxPath, {
          imageThumb: coverAssets.imageThumb,
          imageLarge: coverAssets.imageLarge,
        });
        console.error(`${LOG}  patched TSX with imageThumb + imageLarge`);
      }
    } catch (e) {
      console.error(
        `${LOG}  cover failed: ${e instanceof Error ? e.message : e}`,
      );
      if (args.register) process.exit(1);
    }
  } else {
    console.error(`${LOG}[7/7] Cover skipped (--skip-cover)`);
  }

  const result = {
    ok: true,
    slug,
    title: postTitle,
    mode: args.mode,
    primaryKeyword: proposal.primaryKeyword || null,
    draft: draftPath,
    final: join(args.outDir, `${slug}.md`),
    registered: args.register,
    url: `/blog/article/${slug}`,
    cover: coverAssets
      ? {
          imageThumb: coverAssets.imageThumb,
          imageLarge: coverAssets.imageLarge,
          local: coverAssets.imageLargeLocal,
        }
      : null,
  };
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(`\n${LOG}✗ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
