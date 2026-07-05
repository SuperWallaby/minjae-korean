import fs from "fs";

import {
  azureChatCompletionDetail,
  azureImageGenerationsB64,
  readAzureNewsParagraphPromptMaxTokens,
} from "@/lib/azureOpenAI";
import {
  newsIllustrationStyleReferenceExists,
  newsIllustrationStyleReferencePath,
} from "@/lib/newsIllustrationStyleRef";

export { newsIllustrationStyleReferencePath as newsParagraphStyleReferencePath } from "@/lib/newsIllustrationStyleRef";

const PARAGRAPH_PROMPT_SYSTEM = `You output only one raw English string: the prompt for an image generation model (GPT-image class). No quotes, no markdown, no preamble, no JSON.

The image model cannot see the reference PNG — it only reads your text. Study the attached reference and translate its visual style into concrete words. Do not invent a different art direction.`;

const PARAGRAPH_PROMPT_SUFFIX =
  " Match the reference style: soft watercolor/marker webtoon, clean soft brown outlines, pastel cream and light-blue palette, gentle daylight. No readable text, captions, speech bubbles, watermarks, or logos.";

/**
 * Build an image prompt from paragraph text + optional bundled style reference (Azure chat + vision).
 */
export async function buildNewsParagraphDallePrompt(
  paragraphText: string,
): Promise<string | null> {
  const refPath = newsIllustrationStyleReferencePath();
  const hasRef = newsIllustrationStyleReferenceExists();
  const trimmed = paragraphText.trim().slice(0, 2800);
  if (!trimmed) return null;

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
        text: `Attached image = the ONLY style reference. Match its soft watercolor webtoon look (clean soft brown outlines, pastel cream/beige/sky-blue palette, warm airy daylight, gentle shading, slice-of-life mood).

Write ONE image prompt (English, max ~580 characters) for a new illustration that teaches this article paragraph. Scene should help a Korean learner feel the situation (characters, props, emotion) — not restate the article as text on the canvas.

Paragraph (meaning only — do not copy long strings into the image):
---
${trimmed}
---

Hard rules:
- Same illustration family as the reference: line weight, color temperature, watercolor washes, proportions.
- Forbid: speech bubbles, readable text blocks, captions, labels, watermarks, logos, app UI, photorealism.`,
      },
      { type: "image_url", image_url: { url: dataUrl } },
    ];
  } else {
    userContent = `Style reference missing. Soft watercolor webtoon — clean soft brown outlines, pastel cream and light-blue palette, gentle daylight, slice-of-life mood.

Paragraph:
---
${trimmed}
---

Write ONE concise English image prompt (max ~580 characters). No captions, speech bubbles, or readable text in the image.`;
  }

  const vision = await azureChatCompletionDetail(
    [
      { role: "system", content: PARAGRAPH_PROMPT_SYSTEM },
      { role: "user", content: userContent },
    ],
    chatOpts,
  );
  let raw = vision.text;
  if (!raw && hasRef) {
    const textOnlyUser = `Style reference missing in this request. Soft watercolor webtoon — clean soft brown outlines, pastel cream and light-blue palette, gentle daylight.

Paragraph:
---
${trimmed}
---

Write ONE concise English image prompt (max ~580 characters). No captions, speech bubbles, or readable text in the image.`;
    const textOnly = await azureChatCompletionDetail(
      [
        { role: "system", content: PARAGRAPH_PROMPT_SYSTEM },
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
  const suffix = PARAGRAPH_PROMPT_SUFFIX;
  const finalPrompt = (prompt + suffix).slice(0, 3900);
  return azureImageGenerationsB64(finalPrompt, { size: "1024x1024" });
}
