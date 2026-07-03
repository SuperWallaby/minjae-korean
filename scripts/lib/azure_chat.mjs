export function readAzureChatConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  const raw = process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.trim();
  let deployments = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  if (!deployments.length) {
    const single =
      process.env.BLOG_AZURE_DEPLOYMENT?.trim() ||
      process.env.AZURE_OPENAI_DEPLOYMENT_CHAT?.trim() ||
      process.env.AZURE_OPENAI_DEPLOYMENT?.trim() ||
      "trx-gpt-4-1-mini";
    if (single) deployments = [single];
  }
  if (!endpoint || !apiKey || !deployments.length) return null;
  return { endpoint, apiKey, apiVersion, deployments };
}

export async function azureChat({
  system,
  user,
  temperature = 0.7,
  maxTokens = 8000,
  jsonMode = false,
}) {
  const azure = readAzureChatConfig();
  if (!azure) {
    throw new Error(
      "Missing Azure OpenAI config (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, deployment).",
    );
  }
  const deployment = azure.deployments[0];
  const url = `${azure.endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(azure.apiVersion)}`;
  const body = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature,
    max_completion_tokens: maxTokens,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": azure.apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(300_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || `Azure chat HTTP ${res.status}`,
    );
  }
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

export function stripCodeFence(text) {
  const t = String(text || "").trim();
  if (!t.startsWith("```")) return t;
  const lines = t.split("\n");
  if (lines[0]?.startsWith("```")) lines.shift();
  if (lines.at(-1)?.trim() === "```") lines.pop();
  return lines.join("\n").trim();
}
