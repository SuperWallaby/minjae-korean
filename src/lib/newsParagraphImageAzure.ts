import fs from "fs";
import path from "path";

import {
  azureChatCompletionDetail,
  azureImageGenerationsB64,
  readAzureNewsParagraphPromptMaxTokens,
} from "@/lib/azureOpenAI";

export function newsParagraphStyleReferencePath(): string {
  return path.join(
    process.cwd(),
    "public/brand/news-paragraph-style-reference.png",
  );
}

/**
 * Build an image prompt from paragraph text + optional bundled style reference (Azure chat + vision).
 */
export async function buildNewsParagraphDallePrompt(
  paragraphText: string,
): Promise<string | null> {
  const refPath = newsParagraphStyleReferencePath();
  const hasRef = fs.existsSync(refPath);
  const trimmed = paragraphText.trim().slice(0, 2800);
  if (!trimmed) return null;

  const system = `You output only one raw English string: the prompt for an image generation model (GPT-image class). No quotes, no markdown, no preamble, no JSON.

The image model cannot see the reference PNG — it only reads your text. You MUST spell out the reference's color mood in concrete words (warm paper tone, muted pastel hues, low saturation), not vague phrases like "nice colors".`;

  const chatOpts = {
    maxTokens: readAzureNewsParagraphPromptMaxTokens(),
    temperature: 0.4,
  };

  let userContent: unknown;
  if (hasRef) {
    const b64 = fs.readFileSync(refPath).toString("base64");
    const dataUrl = `data:image/png;base64,${b64}`;
    userContent = [
      {
        type: "text",
        text: `The attached image is the official style reference for Kaja “news practice” illustrations.

Your task: write ONE image prompt (English, max ~580 characters) for a new illustration that teaches this article paragraph. The scene should help a Korean learner feel the situation (characters, props, emotion), not restate the article as text on the canvas.

Paragraph (for meaning only — do not copy long strings into the image):
---
${trimmed}
---

Hard rules for the prompt you write:
- Match the reference: hand-drawn educational webtoon / doodle, clean warm ink outlines (not razor-sharp digital vector), soft marker or watercolor fills.
- Color / palette (copy from the attached reference, in your own words — be specific): warm eggshell or aged-paper cream background (not pure white, not cold gray studio); fills in dusty low-chroma pastels (e.g. blush, muted peach, soft sage, powder blue) like the reference; gentle optional pastel wash shapes behind figures; no neon, no glossy gradients, no hyper-saturated digital UI colors.
- Absolutely forbid: speech bubbles, blocks of readable text, captions, labels, watermarks, logos, app UI, photorealism. Prefer zero letters in the image; if you mention text at all, say “no readable text”.`,
      },
      { type: "image_url", image_url: { url: dataUrl } },
    ];
  } else {
    userContent = `Style (no reference file on server): Korean learning webtoon doodle — warm ink outlines, dusty muted pastel fills on warm cream paper (not pure white), low saturation, friendly tone, minimal or zero text in the image.

Paragraph:
---
${trimmed}
---

Write ONE concise English image prompt (max ~580 characters) that names the palette explicitly. Emphasize: no captions, no speech bubbles, no paragraphs of text in the image.`;
  }

  const vision = await azureChatCompletionDetail(
    [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    chatOpts,
  );
  let raw = vision.text;
  if (!raw && hasRef) {
    const textOnlyUser = `Style (no image in this request): Korean learning webtoon doodle — warm ink outlines, dusty muted pastel fills on warm cream paper (not pure white), low saturation, friendly tone, minimal or zero text in the image.

Paragraph:
---
${trimmed}
---

Write ONE concise English image prompt (max ~580 characters) that names the palette explicitly. Emphasize: no captions, no speech bubbles, no paragraphs of text in the image.`;
    const textOnly = await azureChatCompletionDetail(
      [
        { role: "system", content: system },
        { role: "user", content: textOnlyUser },
      ],
      chatOpts,
    );
    raw = textOnly.text;
  }
  if (!raw) return null;
  const cleaned = raw.replace(/^["']|["']$/g, "").trim();
  return cleaned.slice(0, 3900);
}

export async function generateNewsParagraphImageB64(
  paragraphText: string,
): Promise<string | null> {
  const prompt = await buildNewsParagraphDallePrompt(paragraphText);
  if (!prompt) return null;
  const suffix =
    " Same color mood: warm cream paper background, dusty muted pastel fills, low saturation, no neon. No readable text, captions, speech bubbles, watermarks, or logos in the image.";
  const finalPrompt = (prompt + suffix).slice(0, 3900);
  return azureImageGenerationsB64(finalPrompt, { size: "1024x1024" });
}
