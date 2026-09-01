import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { NextRequest } from "next/server";
import sharp from "sharp";

import { requireAdminKey } from "@/lib/adminAuth";
import { setVocabXImageUrl } from "@/lib/vocabXReviewRepo";

export const runtime = "nodejs";

const MAX_BYTES = 32 * 1024 * 1024;

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function r2Bucket() {
  return (
    process.env.R2_BUCKET_NAME?.trim() || process.env.R2_BUCKET?.trim() || ""
  );
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

function publicBase() {
  return (
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://file.kajakorean.com"
  );
}

function extFromMime(mimeType: string) {
  if (mimeType.includes("gif")) return "gif";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  return "png";
}

function isReadingPinId(bundleId: string) {
  return /^rd_.+__ko$/.test(bundleId);
}

async function putObject(key: string, body: Buffer, contentType: string) {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket() || mustEnv("R2_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=300",
    }),
  );
}

export async function POST(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) {
    return Response.json(
      { ok: false, error: auth.error },
      { status: auth.error === "Unauthorized" ? 401 : 500 },
    );
  }

  try {
    const form = await req.formData();
    const bundleId = String(form.get("bundleId") ?? "").trim();
    const file = form.get("file");
    if (!bundleId) {
      return Response.json({ ok: false, error: "bundleId required" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: "Missing file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ ok: false, error: "File too large (max 32MB)" }, { status: 400 });
    }
    const mimeType = file.type || "image/png";
    if (!mimeType.startsWith("image/")) {
      return Response.json({ ok: false, error: "Images only" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extFromMime(mimeType);
    const safeId = bundleId.replace(/[^\w.-]+/g, "_");
    const uniqueKey = `vocab-x/replaced/${safeId}/${Date.now()}.${ext}`;
    await putObject(uniqueKey, buffer, mimeType);
    const publicUrl = `${publicBase()}/${uniqueKey}`;

    if (isReadingPinId(bundleId)) {
      const pageWebp = await sharp(buffer)
        .rotate()
        .resize(1000, null, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toBuffer();
      const cardWebp = await sharp(buffer)
        .rotate()
        .resize(480, 720, { fit: "cover", position: "north" })
        .webp({ quality: 78, effort: 5 })
        .toBuffer();
      await putObject(`global/pins/${bundleId}.webp`, pageWebp, "image/webp");
      await putObject(`global/pins/${bundleId}.card.webp`, cardWebp, "image/webp");
    }

    const item = await setVocabXImageUrl(bundleId, `${publicUrl}?v=${Date.now()}`);
    if (!item) {
      return Response.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return Response.json({ ok: true, data: { item, imageUrl: item.imageUrl } });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
