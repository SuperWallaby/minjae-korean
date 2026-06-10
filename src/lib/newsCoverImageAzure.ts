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
import { newsParagraphStyleReferencePath } from "@/lib/newsParagraphImageAzure";

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

async function buildNewsCoverPromptWithDiagnostics(
  title: string,
  size: AzureImageGenSize,
): Promise<{
  prompt: string | null;
  chat: AzureChatCompletionDetail | null;
}> {
  const refPath = newsParagraphStyleReferencePath();
  const hasRef = fs.existsSync(refPath);
  const t = title.trim().slice(0, 200);
  if (!t) return { prompt: null, chat: null };
  const aspect = aspectDescription(size);

  const system = `You output only one raw English string: the prompt for an image generation model (GPT-image class). No quotes, no markdown, no preamble, no JSON.

The image model cannot see the reference PNG — it only reads your text. You MUST spell out the reference's color mood in concrete words (warm paper, dusty muted pastels, low saturation), not vague color words.`;

  const chatOpts = {
    maxTokens: readAzureNewsCoverPromptMaxTokens(),
    temperature: 0.42,
  };

  let userContent: unknown;
  if (hasRef) {
    const b64 = fs.readFileSync(refPath).toString("base64");
    const dataUrl = `data:image/png;base64,${b64}`;
    userContent = [
      {
        type: "text",
        text: `Attached image = official Kaja illustration style reference (warm hand-drawn line art, dusty soft fills, educational webtoon mood).

Design a **news / lesson cover image** (not an interior panel) for this headline:
"${t.replace(/"/g, '\\"')}"

Canvas intent: ${aspect}

Write ONE image-generation prompt (English, max ~620 characters) that:
- Describes a single bold cover illustration matching the reference style and palette: warm eggshell / aged-paper cream background (not pure white, not cold gray); fills in muted low-chroma pastels like the reference (blush, dusty peach, soft sage, powder blue); warm ink outlines; optional gentle pastel wash shapes; no neon, no glossy gradients, no UI-slick hyper-saturation.
- Fits the ${size} frame (composition matches portrait vs landscape vs square).
- You MAY include the headline as short, tasteful cover typography if it fits the doodle style — no long paragraphs, no body copy, no watermarks or logos.`,
      },
      { type: "image_url", image_url: { url: dataUrl } },
    ];
  } else {
    userContent = `No style file on disk. Korean learning webtoon cover: warm ink outlines, dusty muted pastel fills on warm cream paper (not pure white), low saturation.

Headline: "${t.replace(/"/g, '\\"')}"
Canvas: ${aspect}

One image prompt (~620 chars) with explicit palette language. Optional short title text only; no walls of text.`;
  }

  const vision = await azureChatCompletionDetail(
    [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    chatOpts,
  );
  if (vision.text) {
    return { prompt: cleanPrompt(vision.text), chat: null };
  }

  if (hasRef) {
    const textOnlyUser = `No image attached in this request; match this style in words: Korean learning webtoon cover — warm ink outlines, dusty muted pastel fills on warm cream paper, low saturation, friendly educational doodle (same family as the on-disk Kaja reference).

Headline: "${t.replace(/"/g, '\\"')}"
Canvas: ${aspect}

Write ONE image-generation prompt (English, max ~620 characters) that states the palette explicitly. Optional short headline typography if it fits the doodle style; no long body text, no watermarks or logos.`;
    const textOnly = await azureChatCompletionDetail(
      [
        { role: "system", content: system },
        { role: "user", content: textOnlyUser },
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
  const suffix =
    " Same color mood: warm cream paper, dusty muted pastel fills, low saturation, no neon. Editorial cover art only: no UI mockups, no tiny unreadable paragraphs, no stock-photo realism.";
  const finalPrompt = (built.prompt + suffix).slice(0, 3900);
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
