import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { NextRequest } from "next/server";

import { requireAdminKey } from "@/lib/adminAuth";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function sanitizeFileName(name: string) {
  const base = String(name ?? "").trim() || "upload";
  return base
    .replace(/[/\\]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120);
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

const MAX_BYTES = 32 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.error === "Unauthorized" ? 401 : 500 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: "Missing file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ ok: false, error: "File too large (max 32MB)" }, { status: 400 });
    }

    const mimeType = file.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      return Response.json({ ok: false, error: "Images only" }, { status: 400 });
    }

    const ext = mimeType.includes("gif")
      ? "gif"
      : mimeType.includes("png")
        ? "png"
        : mimeType.includes("webp")
          ? "webp"
          : "jpg";
    const key = `grammar-x/manual/${Date.now()}-${sanitizeFileName(file.name)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client().send(
      new PutObjectCommand({
        Bucket: mustEnv("R2_BUCKET_NAME"),
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    const publicBase =
      process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
      `https://${mustEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${mustEnv("R2_BUCKET_NAME")}`;
    const publicUrl = `${publicBase}/${key}`;

    return Response.json({ ok: true, data: { publicUrl, key } });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
