import type { ReactNode } from "react";

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "section",
  "ul",
  "ol",
]);

/** Flatten ReactNode blog content into plain text for list previews. */
export function reactNodeToPlainText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node
      .map((child) => reactNodeToPlainText(child))
      .filter(Boolean)
      .join(" ");
  }
  if (typeof node === "object" && "props" in node) {
    const el = node as {
      type?: unknown;
      props?: { children?: ReactNode };
    };
    if (el.type === "br") return " ";
    const inner = reactNodeToPlainText(el.props?.children);
    if (typeof el.type === "string" && BLOCK_TAGS.has(el.type)) {
      return ` ${inner} `;
    }
    return inner;
  }
  return "";
}

export function excerptFromBlogPost(input: {
  description?: string;
  paragraphs?: Array<{ content?: ReactNode }>;
  title?: string;
  maxLen?: number;
}): string {
  const maxLen = input.maxLen ?? 220;
  const fromMeta = input.description?.trim();
  if (fromMeta) {
    const plain = fromMeta.replace(/\s+/g, " ");
    return plain.length > maxLen ? `${plain.slice(0, maxLen).trimEnd()}…` : plain;
  }
  const chunks: string[] = [];
  for (const p of input.paragraphs ?? []) {
    const t = reactNodeToPlainText(p.content).replace(/\s+/g, " ").trim();
    if (t) chunks.push(t);
    if (chunks.join(" ").length >= maxLen) break;
  }
  const joined = chunks.join(" ").trim();
  if (joined) {
    return joined.length > maxLen
      ? `${joined.slice(0, maxLen).trimEnd()}…`
      : joined;
  }
  return input.title ? `${input.title}.` : "";
}
