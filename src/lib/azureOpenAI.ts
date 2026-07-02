/**
 * Azure OpenAI — chat (vision-capable) + GPT-image series image generation.
 *
 * Chat (try in order until one succeeds):
 *   AZURE_OPENAI_CHAT_DEPLOYMENTS — comma-separated deployment **names**, e.g.
 *   `trx-gpt-4-1-vision,trx-gpt-4-1-mini` (do **not** put Responses-only models like
 *   `gpt-5.4-pro` here — they return 400 on chat/completions).
 *   If unset: `AZURE_OPENAI_DEPLOYMENT_CHAT` or `AZURE_OPENAI_DEPLOYMENT` (single).
 *
 * Image (Microsoft Foundry / gpt-image; DALL·E 3 retired per MS docs):
 *   AZURE_OPENAI_DEPLOYMENT_IMAGE — deployment name for gpt-image-1.5, gpt-image-2, etc.
 *   (Foundry may offer newer gpt-image-* models by region; 1.5 is not always the latest.)
 *   AZURE_OPENAI_IMAGE_API_VERSION — default `2025-04-01-preview`
 *   AZURE_OPENAI_IMAGE_QUALITY — optional `low` | `medium` | `high` (default `high`)
 *
 * Shared: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY,
 *         AZURE_OPENAI_API_VERSION for chat (default `2024-08-01-preview`).
 *
 * Chat and image clients automatically retry on HTTP 429 / 503 with backoff
 * (Retry-After header or Azure "retry after N seconds" message).
 * Optional: `AZURE_OPENAI_CHAT_MAX_RETRIES` (default 6),
 * `AZURE_OPENAI_IMAGE_MAX_RETRIES` (default 12).
 *
 * Chat **max output tokens** (API field `max_completion_tokens` for chat/completions;
 * older docs say `max_tokens` — newer models such as gpt-5.x reject `max_tokens`):
 *   `AZURE_OPENAI_CHAT_MAX_OUTPUT_TOKENS` — default when callers omit `maxTokens` (default 16384, cap 32768; models reject higher).
 *   `AZURE_OPENAI_NEWS_COVER_CHAT_MAX_TOKENS` — cover prompt step (default 8192, cap 32768).
 *   `AZURE_OPENAI_NEWS_PARAGRAPH_CHAT_MAX_TOKENS` — paragraph prompt step (default 8192, cap 32768).
 *   `AZURE_OPENAI_DESCRIBE_CHAT_MAX_TOKENS` — description JSON (default 16384, cap 32768).
 */

export type AzureOpenAIConfig = {
  endpoint: string;
  apiKey: string;
  apiVersion: string;
  imageApiVersion: string;
  /** First chat deployment (compat). */
  chatDeployment: string;
  /** All chat deployments in try order. */
  chatDeployments: string[];
  imageDeployment?: string;
};

/** Sizes supported by GPT-image-1 / 1.5 style APIs; legacy DALL·E sizes map in normalize. */
export type AzureImageGenSize =
  | "1024x1024"
  | "1024x1536"
  | "1536x1024"
  | "1024x1792"
  | "1792x1024";

/** @deprecated use AzureImageGenSize */
export type AzureDalle3Size = AzureImageGenSize;

export function getChatDeploymentNames(): string[] {
  const raw = process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const single =
    process.env.AZURE_OPENAI_DEPLOYMENT_CHAT?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT?.trim();
  return single ? [single] : [];
}

export function readAzureOpenAIConfig(): AzureOpenAIConfig | null {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  const imageApiVersion =
    process.env.AZURE_OPENAI_IMAGE_API_VERSION?.trim() || "2025-04-01-preview";
  const chatDeployments = getChatDeploymentNames();
  const imageDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_IMAGE?.trim();
  if (!endpoint || !apiKey || chatDeployments.length === 0) return null;
  return {
    endpoint,
    apiKey,
    apiVersion,
    imageApiVersion,
    chatDeployment: chatDeployments[0],
    chatDeployments,
    imageDeployment: imageDeployment || undefined,
  };
}

/** Map UI / legacy DALL·E sizes → GPT-image API `size`. */
export function normalizeAzureImageSize(
  size: AzureImageGenSize | string,
): "1024x1024" | "1024x1536" | "1536x1024" | null {
  const s = String(size).trim().toLowerCase();
  if (s === "1024x1024") return "1024x1024";
  if (s === "1024x1536" || s === "1024x1792") return "1024x1536";
  if (s === "1536x1024" || s === "1792x1024") return "1536x1024";
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse Retry-After header or Azure JSON message ("retry after N seconds"). */
function rateLimitWaitMs(
  res: Response,
  body: { error?: { message?: string } } | null,
  attempt: number,
): number {
  const h = res.headers.get("retry-after");
  if (h) {
    const sec = parseInt(h, 10);
    if (!Number.isNaN(sec) && sec > 0) {
      return Math.min(120_000, sec * 1000 + 250);
    }
  }
  const msg = body?.error?.message ?? "";
  const m = /retry after (\d+)\s*seconds?/i.exec(msg);
  if (m) {
    const sec = parseInt(m[1] ?? "", 10);
    if (!Number.isNaN(sec) && sec > 0) {
      return Math.min(120_000, sec * 1000 + 500);
    }
  }
  return Math.min(90_000, 2000 * 2 ** attempt + Math.floor(Math.random() * 400));
}

function readPositiveIntEnv(name: string, fallback: number, cap: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(cap, n);
}

const CHAT_MAX_OUTPUT_TOKENS_CAP = 32_768;

/** Default `max_tokens` when `azureChatCompletion` is called without `maxTokens`. */
export function readAzureChatMaxOutputTokensDefault(): number {
  return readPositiveIntEnv(
    "AZURE_OPENAI_CHAT_MAX_OUTPUT_TOKENS",
    16_384,
    CHAT_MAX_OUTPUT_TOKENS_CAP,
  );
}

function effectiveChatMaxTokens(explicit?: number): number {
  if (typeof explicit === "number" && explicit > 0) {
    return Math.min(CHAT_MAX_OUTPUT_TOKENS_CAP, explicit);
  }
  return readAzureChatMaxOutputTokensDefault();
}

/** News cover: chat step that writes the image prompt string. */
export function readAzureNewsCoverPromptMaxTokens(): number {
  return readPositiveIntEnv(
    "AZURE_OPENAI_NEWS_COVER_CHAT_MAX_TOKENS",
    8192,
    CHAT_MAX_OUTPUT_TOKENS_CAP,
  );
}

/** News paragraph illustration: chat step that writes the image prompt string. */
export function readAzureNewsParagraphPromptMaxTokens(): number {
  return readPositiveIntEnv(
    "AZURE_OPENAI_NEWS_PARAGRAPH_CHAT_MAX_TOKENS",
    8192,
    CHAT_MAX_OUTPUT_TOKENS_CAP,
  );
}

/** Korean text description JSON (azureDescribe). */
export function readAzureDescribeChatMaxTokens(): number {
  return readPositiveIntEnv(
    "AZURE_OPENAI_DESCRIBE_CHAT_MAX_TOKENS",
    16_384,
    CHAT_MAX_OUTPUT_TOKENS_CAP,
  );
}

async function chatOnce(
  endpoint: string,
  apiKey: string,
  apiVersion: string,
  deployment: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: unknown }>,
  opts?: { maxTokens?: number; temperature?: number },
): Promise<
  | { ok: true; text: string }
  | { ok: false; status: number; message?: string }
> {
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  const payload = JSON.stringify({
    messages,
    max_completion_tokens: effectiveChatMaxTokens(opts?.maxTokens),
    temperature: opts?.temperature ?? 0.35,
  });
  const maxAttempts = readPositiveIntEnv("AZURE_OPENAI_CHAT_MAX_RETRIES", 6, 15);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "Api-Key": apiKey,
      },
      body: payload,
    });
    if (!res.ok) {
      const errText = await res.text().then((t) => t.slice(0, 2000)).catch(() => "");
      let errBody: { error?: { message?: string } } | null = null;
      try {
        errBody = JSON.parse(errText) as { error?: { message?: string } };
      } catch {
        errBody = null;
      }
      if (
        (res.status === 429 || res.status === 503) &&
        attempt < maxAttempts - 1
      ) {
        await sleep(rateLimitWaitMs(res, errBody, attempt));
        continue;
      }
      return {
        ok: false,
        status: res.status,
        message: errBody?.error?.message,
      };
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text || typeof text !== "string") {
      return { ok: false, status: 502, message: "Empty assistant content" };
    }
    return { ok: true, text };
  }
  return { ok: false, status: 503, message: "Chat retries exhausted" };
}

export type AzureChatCompletionDetail = {
  text: string | null;
  lastHttpStatus?: number;
  lastMessage?: string;
  lastDeployment?: string;
};

export async function azureChatCompletionDetail(
  messages: Array<{ role: "system" | "user" | "assistant"; content: unknown }>,
  opts?: {
    maxTokens?: number;
    temperature?: number;
    deployments?: string[];
  },
): Promise<AzureChatCompletionDetail> {
  const c = readAzureOpenAIConfig();
  if (!c) return { text: null, lastMessage: "Azure config missing" };
  const deployments =
    opts?.deployments?.filter(Boolean).length
      ? opts.deployments!.filter(Boolean)
      : c.chatDeployments;
  let lastHttpStatus: number | undefined;
  let lastMessage: string | undefined;
  let lastDeployment: string | undefined;
  for (const deployment of deployments) {
    lastDeployment = deployment;
    const r = await chatOnce(
      c.endpoint,
      c.apiKey,
      c.apiVersion,
      deployment,
      messages,
      opts,
    );
    if (r.ok) return { text: r.text };
    lastHttpStatus = r.status;
    lastMessage = "message" in r ? r.message : undefined;
  }
  return { text: null, lastHttpStatus, lastMessage, lastDeployment };
}

export async function azureChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: unknown }>,
  opts?: {
    maxTokens?: number;
    temperature?: number;
    deployments?: string[];
  },
): Promise<string | null> {
  const d = await azureChatCompletionDetail(messages, opts);
  return d.text;
}

/**
 * GPT-image `images/generations` — returns base64 PNG (gpt-image series uses b64_json output).
 */
export type AzureImageGenFailure = {
  httpStatus: number;
  code?: string;
  message?: string;
};

export async function azureTryImageGenerationsB64(
  prompt: string,
  opts?: { size?: AzureImageGenSize | string; quality?: string },
): Promise<
  { ok: true; b64: string } | { ok: false; failure: AzureImageGenFailure | null }
> {
  const c = readAzureOpenAIConfig();
  if (!c?.imageDeployment) {
    return {
      ok: false,
      failure: {
        httpStatus: 0,
        message: "Missing AZURE_OPENAI_DEPLOYMENT_IMAGE",
      },
    };
  }
  const acct = c;
  const apiSize = normalizeAzureImageSize(opts?.size ?? "1024x1024");
  if (!apiSize) {
    return {
      ok: false,
      failure: { httpStatus: 0, message: "Unsupported image size" },
    };
  }
  const quality =
    (opts?.quality ??
      process.env.AZURE_OPENAI_IMAGE_QUALITY?.trim() ??
      "high") || "high";
  const url = `${acct.endpoint}/openai/deployments/${encodeURIComponent(acct.imageDeployment!)}/images/generations?api-version=${encodeURIComponent(acct.imageApiVersion)}`;
  const body = {
    prompt: prompt.slice(0, 3900),
    n: 1,
    size: apiSize,
    quality,
    output_format: "png",
  };
  const bodyStr = JSON.stringify(body);

  async function fetchImageBody(
    bodyJson: string,
  ): Promise<{ res: Response; data: { data?: Array<{ b64_json?: string; url?: string }>; error?: { message?: string; code?: string } } | null }> {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": acct.apiKey,
        "Api-Key": acct.apiKey,
      },
      body: bodyJson,
    });
    const data = (await res.json().catch(() => null)) as {
      data?: Array<{ b64_json?: string; url?: string }>;
      error?: { message?: string; code?: string };
    } | null;
    return { res, data };
  }

  const maxAttempts = readPositiveIntEnv(
    "AZURE_OPENAI_IMAGE_MAX_RETRIES",
    12,
    20,
  );
  let lastFailure: AzureImageGenFailure | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { res, data } = await fetchImageBody(bodyStr);

    if (res.ok && data?.data?.[0]) {
      const row = data.data[0];
      if (row?.b64_json) return { ok: true, b64: row.b64_json };
      if (row?.url) {
        const img = await fetch(row.url);
        if (!img.ok) {
          return {
            ok: false,
            failure: {
              httpStatus: img.status,
              message: "Failed to download image URL from Azure response",
            },
          };
        }
        const buf = Buffer.from(await img.arrayBuffer());
        return { ok: true, b64: buf.toString("base64") };
      }
      return {
        ok: false,
        failure: {
          httpStatus: 200,
          message: "Image response missing b64_json and url",
        },
      };
    }

    lastFailure = {
      httpStatus: res.status,
      code: data?.error?.code,
      message: data?.error?.message,
    };

    if (res.status === 400 && attempt === 0) {
      const minimal = JSON.stringify({
        prompt: prompt.slice(0, 3900),
        n: 1,
        size: apiSize,
        quality: "auto",
      });
      const second = await fetchImageBody(minimal);
      if (second.res.ok && second.data?.data?.[0]) {
        const row = second.data.data[0];
        if (row?.b64_json) return { ok: true, b64: row.b64_json };
        if (row?.url) {
          const img = await fetch(row.url);
          if (img.ok) {
            const buf = Buffer.from(await img.arrayBuffer());
            return { ok: true, b64: buf.toString("base64") };
          }
        }
      }
    }

    if (
      (res.status === 429 || res.status === 503) &&
      attempt < maxAttempts - 1
    ) {
      await sleep(rateLimitWaitMs(res, data, attempt));
      continue;
    }
    return { ok: false, failure: lastFailure };
  }
  return { ok: false, failure: lastFailure };
}

export async function azureImageGenerationsB64(
  prompt: string,
  opts?: { size?: AzureImageGenSize | string; quality?: string },
): Promise<string | null> {
  const r = await azureTryImageGenerationsB64(prompt, opts);
  return r.ok ? r.b64 : null;
}

/** @deprecated use azureImageGenerationsB64 */
export async function azureDallE3GenerateB64(
  prompt: string,
  opts?: { size?: AzureImageGenSize | string },
): Promise<string | null> {
  return azureImageGenerationsB64(prompt, opts);
}
