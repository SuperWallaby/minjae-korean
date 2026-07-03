import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

export function slugify(value, fallback = "blog-post") {
  const s = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return s || `${fallback}-${Date.now().toString(36)}`;
}

function deriveSubtitle(paragraph) {
  const bold = paragraph.match(/\*\*(.+?)\*\*/);
  if (bold?.[1] && bold[1].length <= 72) {
    return bold[1].replace(/\.$/, "").trim();
  }
  const plain = paragraph.replace(/\*\*/g, "").replace(/\[\[KO:[^\]]+\]\]/g, "").trim();
  const first = plain.split(/[.!?]/)[0]?.trim() || plain;
  const words = first.split(/\s+/).slice(0, 7).join(" ");
  return words.length > 56 ? `${words.slice(0, 53)}…` : words;
}

function sectionsFromPlainBody(body) {
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !/^\[\[KO:/.test(p));
  if (!paragraphs.length) return [];
  return paragraphs.map((p, i) => ({
    subtitle: deriveSubtitle(p) || `Section ${i + 1}`,
    body: p,
  }));
}

/** Parse de-AI markdown (# title, ## sections, optional **Source:** line). */
export function parseBlogMarkdown(md) {
  let text = String(md || "").trim();
  text = text.replace(/\r\n/g, "\n");
  text = text.replace(/\n\*\*Source:\*\*[\s\S]*$/i, "").trim();
  // KO closing line sometimes sits outside sections
  text = text.replace(/\n\[\[KO:[^\]]+\]\][^\n]*/g, "").trim();

  let title = "";
  const sections = [];

  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;

  if (lines[i]?.startsWith("# ")) {
    title = lines[i].slice(2).trim();
    i++;
  }

  let current = null;
  const preamble = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { subtitle: line.slice(3).trim(), body: "" };
      continue;
    }
    if (!current) {
      if (line.trim()) preamble.push(line);
      continue;
    }
    current.body += (current.body ? "\n" : "") + line;
  }
  if (current) sections.push(current);

  if (!sections.length && preamble.length) {
    sections.push(...sectionsFromPlainBody(preamble.join("\n")));
  }

  if (!title && sections.length) title = sections[0].subtitle;
  if (!sections.length) throw new Error("Markdown has no ## sections or body paragraphs");

  return {
    title,
    sections: sections.map((s) => ({
      subtitle: s.subtitle,
      body: s.body.trim(),
    })),
  };
}

/** Turn inline **bold** and [[KO: ...]] into JSX fragments. */
function inlineMarkdownToJsx(text) {
  const chunks = [];
  const re = /\*\*(.+?)\*\*|\[\[KO:\s*([^\]]+)\]\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      chunks.push({ kind: "text", value: text.slice(last, m.index) });
    }
    if (m[1]) chunks.push({ kind: "strong", value: m[1] });
    else if (m[2]) chunks.push({ kind: "ko", value: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length) chunks.push({ kind: "text", value: text.slice(last) });
  return chunks;
}

function bodyToJsx(body) {
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim());
  const linesOut = ["<>"];
  for (let pi = 0; pi < paragraphs.length; pi++) {
    if (pi > 0) linesOut.push("          <Gap />");
    const lines = paragraphs[pi].split("\n");
    for (let li = 0; li < lines.length; li++) {
      if (li > 0) linesOut.push("          <br />");
      for (const c of inlineMarkdownToJsx(lines[li])) {
        if (c.kind === "text" && c.value) {
          linesOut.push(`          {${JSON.stringify(c.value)}}`);
        } else if (c.kind === "strong") {
          linesOut.push(`          <strong>{${JSON.stringify(c.value)}}</strong>`);
        } else if (c.kind === "ko") {
          linesOut.push(`          <Describe>{${JSON.stringify(c.value)}}</Describe>`);
        }
      }
    }
  }
  linesOut.push("        </>");
  return linesOut.join("\n");
}

export function blogPostToTsx({
  slug,
  title,
  description,
  keywords,
  faq,
  level,
  createdAt,
  videoId,
  sections,
  imageThumb,
  imageLarge,
}) {
  const iso = createdAt || new Date().toISOString();
  const metaFields = [];
  if (description) metaFields.push(`  description: ${JSON.stringify(description)},`);
  if (Array.isArray(keywords) && keywords.length) {
    metaFields.push(`  keywords: ${JSON.stringify(keywords)},`);
  }
  if (Array.isArray(faq) && faq.length) {
    metaFields.push(`  faq: ${JSON.stringify(faq, null, 2).replace(/\n/g, "\n  ")},`);
  }
  const imageFields = [];
  if (imageThumb) imageFields.push(`  imageThumb: ${JSON.stringify(imageThumb)},`);
  if (imageLarge) imageFields.push(`  imageLarge: ${JSON.stringify(imageLarge)},`);
  const paragraphBlocks = sections.map((s, idx) => {
    const youtube =
      idx === 0 && videoId ? `\n      youtube: "${videoId}",` : "";
    return `    {
      subtitle: ${JSON.stringify(s.subtitle)},
      content: (
        ${bodyToJsx(s.body)}
      ),${youtube}
    }`;
  });

  return `/* eslint-disable react/no-unescaped-entities */
/* Auto-generated by scripts/blog_from_youtube.mjs — review before publish. */
import React from "react";
import { Describe } from "@/components/article/Describe";
import { Gap } from "@/components/article/Gap";
import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: ${JSON.stringify(slug)},
  title: ${JSON.stringify(title)},
${metaFields.length ? `${metaFields.join("\n")}\n` : ""}
  level: ${level || 3},
${imageFields.length ? `${imageFields.join("\n")}\n` : ""}  createdAt: ${JSON.stringify(iso)},
  updatedAt: ${JSON.stringify(iso)},
  paragraphs: [
${paragraphBlocks.join(",\n")}
  ],
};
`;
}

export function registerBlogSlug(slug, indexPath, { force = false } = {}) {
  let src = readFileSync(indexPath, "utf8");
  if (src.includes(`"${slug}"`)) {
    if (!force) return { registered: false, reason: "already-in-index" };
    return { registered: true, reason: "already-in-index" };
  }

  const slugMarker = "] as const;";
  const slugIdx = src.indexOf(slugMarker);
  if (slugIdx === -1) throw new Error("Could not find SLUG_LIST in index.ts");
  src =
    src.slice(0, slugIdx).trimEnd() +
    `\n  "${slug}",\n` +
    src.slice(slugIdx);

  const loaderNeedle = `"korean-verb-endings": () => import("./content/korean-verb-endings"),`;
  if (!src.includes(loaderNeedle)) {
    throw new Error("Could not find loaders block anchor in index.ts");
  }
  src = src.replace(
    loaderNeedle,
    `${loaderNeedle}\n  "${slug}": () => import("./content/${slug}"),`,
  );

  writeFileSync(indexPath, src, "utf8");
  return { registered: true, reason: "added" };
}

export function writeBlogTsx(outPath, tsx) {
  if (existsSync(outPath) && !process.env.BLOG_FORCE_OVERWRITE) {
    throw new Error(`File exists: ${outPath} (set BLOG_FORCE_OVERWRITE=1 to replace)`);
  }
  writeFileSync(outPath, tsx, "utf8");
}

/** Add or replace imageThumb / imageLarge in an existing blog TSX file. */
export function patchBlogTsxImages(tsxPath, { imageThumb, imageLarge }) {
  let src = readFileSync(tsxPath, "utf8");
  const setField = (field, value) => {
    const re = new RegExp(`\\n  ${field}: [^,\\n]+,?`);
    if (re.test(src)) {
      src = src.replace(re, `\n  ${field}: ${JSON.stringify(value)},`);
    } else {
      src = src.replace(
        /(\n  level: \d+,)/,
        `$1\n  ${field}: ${JSON.stringify(value)},`,
      );
    }
  };
  if (imageThumb) setField("imageThumb", imageThumb);
  if (imageLarge) setField("imageLarge", imageLarge);
  writeFileSync(tsxPath, src, "utf8");
}

export function readStyleRef(name, root) {
  const path = join(root, "style-ref", "blog", name);
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8").trim();
}
