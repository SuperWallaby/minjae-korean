import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { readAzureOpenAIConfig } from "@/lib/azureOpenAI";
import { generateNewsParagraphImageB64 } from "@/lib/newsParagraphImageAzure";

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

/**
 * Admin-only (dev): generate a paragraph illustration via Azure only (vision → DALL·E 3), upload to R2.
 */
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
            "Azure image deployment missing: set AZURE_OPENAI_DEPLOYMENT_IMAGE (default gpt-image-2).",
        },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => null);
    const subtitle =
      typeof body?.subtitle === "string" ? body.subtitle.trim() : "";
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";
    const paragraphText = [subtitle, content].filter(Boolean).join("\n\n");
    if (!paragraphText) {
      return NextResponse.json(
        { ok: false, error: "subtitle or content required" },
        { status: 400 },
      );
    }
    if (paragraphText.length > 6000) {
      return NextResponse.json(
        { ok: false, error: "Paragraph too long" },
        { status: 400 },
      );
    }

    const b64 = await generateNewsParagraphImageB64(paragraphText);
    if (!b64) {
      return NextResponse.json(
        { ok: false, error: "Azure image generation failed" },
        { status: 502 },
      );
    }

    const bucket = mustEnv("R2_BUCKET");
    const publicBase = mustEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/g, "");
    const key = `articles/news-para-${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
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
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
