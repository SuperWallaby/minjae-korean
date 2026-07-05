import fs from "fs";

import type {
  AzureChatCompletionDetail,
  AzureImageGenFailure,
  AzureImageGenSize,
} from "@/lib/azureOpenAI";
import {
  azureChatCompletionDetail,
  azureTryImageGenerationsB64,
  readAzureNewsCoverPromptMaxTokens,
} from "@/lib/azureOpenAI";
import {
  newsIllustrationStyleReferenceExists,
  newsIllustrationStyleReferencePath,
} from "@/lib/newsIllustrationStyleRef";

function aspectDescription(size: AzureImageGenSize): string {
  switch (size) {
    case "1024x1536":
    case "1024x1792":
      return "tall portrait cover (1024×1536): vertical composition, room for title at top or bottom, strong vertical flow.";
    case "1536x1024":
    case "1792x1024":
      return "wide landscape cover (1536×1024): horizontal hero layout, breathing room left-to-right.";
    default:
      return "square cover (1024×1024): centered focal illustration, balanced framing.";
  }
}

function cleanPrompt(raw: string): string {
  return raw.replace(/^["']|["']$/g, "").trim().slice(0, 3900);
}

const COVER_PROMPT_SYSTEM = `You output only one raw English string: the prompt for an image generation model (GPT-image class). No quotes, no markdown, no preamble, no JSON.

The image model cannot see the reference PNG — it only reads your text. Study the attached reference and translate its visual style into concrete words (line quality, palette, lighting, rendering medium, mood). Do not invent a different art direction.`;

const COVER_PROMPT_SUFFIX =
  " Match the reference illustration style: soft watercolor/marker webtoon look, clean soft brown ink outlines, pastel cream and light-blue palette, gentle daytime lighting, cozy slice-of-life mood. Editorial cover only — no UI mockups, no stock-photo realism, no tiny unreadable text blocks.";

function coverPromptWithReference(title: string, aspect: string, size: AzureImageGenSize): unknown {
  const refPath = newsIllustrationStyleReferencePath();
  const b64 = fs.readFileSync(refPath).toString("base64");
  const dataUrl = `data:image/png;base64,${b64}`;
  const t = title.replace(/"/g, '\\"');

  return [
    {
      type: "text",
      text: `Attached image = the ONLY style reference. Copy its illustration language (soft watercolor digital webtoon, hand-drawn soft outlines, pastel cream/beige/sky-blue palette, warm airy daylight, gentle shading, youthful slice-of-life mood). Do NOT use flat doodle-on-cream-paper or hyper-saturated UI illustration unless the reference shows that.

Design a **news / lesson cover** (hero art, not an interior panel) for:
"${t}"

Canvas: ${aspect} (${size})

Write ONE image-generation prompt (English, max ~620 characters) that:
- Describes a single bold cover scene inspired by the headline, rendered in the same style family as the reference (line weight, color temperature, watercolor washes, character proportions if figures appear).
- Fits the ${size} frame.
- Optional short headline typography only if it fits the reference style — no paragraphs, watermarks, or logos.`,
    },
    { type: "image_url", image_url: { url: dataUrl } },
  ];
}

function coverPromptFallback(title: string, aspect: string, size: AzureImageGenSize): string {
  const t = title.replace(/"/g, '\\"');
  return `Style reference file missing. Use soft watercolor webtoon cover art: clean soft brown outlines, pastel cream and light-blue palette, gentle daylight, cozy slice-of-life mood (like modern Korean webtoon key art).

Headline: "${t}"
Canvas: ${aspect}

One image prompt (~620 chars). Optional short title text only; no body copy or watermarks.`;
}

async function buildNewsCoverPromptWithDiagnostics(
  title: string,
  size: AzureImageGenSize,
): Promise<{
  prompt: string | null;
  chat: AzureChatCompletionDetail | null;
}> {
  const hasRef = newsIllustrationStyleReferenceExists();
  const t = title.trim().slice(0, 200);
  if (!t) return { prompt: null, chat: null };
  const aspect = aspectDescription(size);

  const chatOpts = {
    maxTokens: readAzureNewsCoverPromptMaxTokens(),
    temperature: 0.42,
  };

  const userContent = hasRef
    ? coverPromptWithReference(t, aspect, size)
    : coverPromptFallback(t, aspect, size);

  const vision = await azureChatCompletionDetail(
    [
      { role: "system", content: COVER_PROMPT_SYSTEM },
      { role: "user", content: userContent },
    ],
    chatOpts,
  );
  if (vision.text) {
    return { prompt: cleanPrompt(vision.text), chat: null };
  }

  if (hasRef) {
    const textOnly = await azureChatCompletionDetail(
      [
        { role: "system", content: COVER_PROMPT_SYSTEM },
        { role: "user", content: coverPromptFallback(t, aspect, size) },
      ],
      chatOpts,
    );
    if (textOnly.text) {
      return { prompt: cleanPrompt(textOnly.text), chat: null };
    }
    return { prompt: null, chat: textOnly };
  }

  return { prompt: null, chat: vision };
}

export async function buildNewsCoverDallePrompt(
  title: string,
  size: AzureImageGenSize,
): Promise<string | null> {
  const r = await buildNewsCoverPromptWithDiagnostics(title, size);
  return r.prompt;
}

export type NewsCoverGenResult =
  | { ok: true; b64: string }
  | { ok: false; stage: "prompt"; chat?: AzureChatCompletionDetail | null }
  | { ok: false; stage: "image"; failure: AzureImageGenFailure | null };

export async function generateNewsCoverImageResult(
  title: string,
  size: AzureImageGenSize,
): Promise<NewsCoverGenResult> {
  const built = await buildNewsCoverPromptWithDiagnostics(title, size);
  if (!built.prompt) {
    return { ok: false, stage: "prompt", chat: built.chat };
  }
  const finalPrompt = (built.prompt + COVER_PROMPT_SUFFIX).slice(0, 3900);
  const img = await azureTryImageGenerationsB64(finalPrompt, { size });
  if (!img.ok) return { ok: false, stage: "image", failure: img.failure };
  return { ok: true, b64: img.b64 };
}

export async function generateNewsCoverImageB64(
  title: string,
  size: AzureImageGenSize,
): Promise<string | null> {
  const r = await generateNewsCoverImageResult(title, size);
  return r.ok ? r.b64 : null;
}
