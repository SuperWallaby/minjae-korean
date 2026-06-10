import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import type { AzureImageGenSize } from "@/lib/azureOpenAI";
import { readAzureOpenAIConfig } from "@/lib/azureOpenAI";
import { NEWS_COVER_IMAGE_SIZE } from "@/lib/newsCoverDefaults";
import { generateNewsCoverImageResult } from "@/lib/newsCoverImageAzure";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function r2Client() {
  const accountId = mustEnv("R2_ACCOUNT_ID");
  const accessKeyId = mustEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = mustEnv("R2_SECRET_ACCESS_KEY");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const ALLOWED: AzureImageGenSize[] = [
  "1024x1024",
  "1024x1536",
  "1536x1024",
  "1024x1792",
  "1792x1024",
];

function parseSize(raw: unknown): AzureImageGenSize | null {
  const s = typeof raw === "string" ? raw.trim() : "";
  return ALLOWED.includes(s as AzureImageGenSize) ? (s as AzureImageGenSize) : null;
}

function parseTarget(raw: unknown): "thumb" | "large" | "both" | null {
  const t = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (t === "thumb" || t === "large" || t === "both") return t;
  return null;
}

/** Dev admin: Azure-only article cover (GPT-image size preset). */
export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const azure = readAzureOpenAIConfig();
    if (!azure) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Azure OpenAI base config missing. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and a chat deployment (AZURE_OPENAI_CHAT_DEPLOYMENTS or AZURE_OPENAI_DEPLOYMENT_CHAT / AZURE_OPENAI_DEPLOYMENT).",
        },
        { status: 503 },
      );
    }
    if (!azure.imageDeployment) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Azure image deployment missing: set AZURE_OPENAI_DEPLOYMENT_IMAGE to your Foundry deployment name for gpt-image (e.g. kaja-gpt-image-15). Optional: AZURE_OPENAI_IMAGE_API_VERSION (default 2025-04-01-preview).",
        },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const size = parseSize(body?.size) ?? NEWS_COVER_IMAGE_SIZE;
    const target = parseTarget(body?.target) ?? "large";

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "title is required" },
        { status: 400 },
      );
    }

    const gen = await generateNewsCoverImageResult(title, size);
    if (!gen.ok) {
      if (gen.stage === "prompt") {
        const c = gen.chat;
        if (process.env.NODE_ENV === "development") {
          console.warn("[cover-image] prompt stage failed", {
            lastDeployment: c?.lastDeployment,
            lastHttpStatus: c?.lastHttpStatus,
            lastMessage: c?.lastMessage,
          });
        }
        return NextResponse.json(
          {
            ok: false,
            stage: "prompt",
            error:
              "Azure chat did not return a cover prompt. Check chat deployment order (use chat/completions-capable deploys first; Responses-only `gpt-5.4-pro` returns 400).",
            chat: c
              ? {
                  lastDeployment: c.lastDeployment,
                  lastHttpStatus: c.lastHttpStatus,
                  lastMessage: c.lastMessage,
                }
              : null,
          },
          { status: 502 },
        );
      }
      const f = gen.failure;
      if (process.env.NODE_ENV === "development") {
        console.warn("[cover-image] image stage failed", {
          httpStatus: f?.httpStatus,
          code: f?.code,
          message: f?.message,
        });
      }
      return NextResponse.json(
        {
          ok: false,
          stage: "image",
          error:
            f?.message ??
            (f?.httpStatus
              ? `Azure image API HTTP ${f.httpStatus}`
              : "Azure image generation failed"),
          azure: f
            ? { httpStatus: f.httpStatus, code: f.code, message: f.message }
            : null,
        },
        { status: 502 },
      );
    }
    const b64 = gen.b64;

    const bucket = mustEnv("R2_BUCKET");
    const publicBase = mustEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/g, "");
    const key = `articles/news-cover-${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const buffer = Buffer.from(b64, "base64");

    await r2Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: "image/png",
      }),
    );

    const publicUrl = `${publicBase}/${key}`;
    return NextResponse.json({
      ok: true,
      url: publicUrl,
      size,
      target,
      appliedThumb: target === "thumb" || target === "both",
      appliedLarge: target === "large" || target === "both",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
