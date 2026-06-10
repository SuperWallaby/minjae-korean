import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import sharp from "sharp";

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

function isAllowedSourceUrl(imageUrl: string): boolean {
  const base = mustEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  return imageUrl.startsWith(`${base}/`) || imageUrl === base;
}

/** Dev admin: fetch large cover from R2, resize to WebP thumb, upload to R2. */
export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const imageUrl =
      typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (!imageUrl) {
      return NextResponse.json(
        { ok: false, error: "imageUrl is required" },
        { status: 400 },
      );
    }
    if (!isAllowedSourceUrl(imageUrl)) {
      return NextResponse.json(
        {
          ok: false,
          error: "imageUrl must be under R2_PUBLIC_BASE_URL (SSRF guard).",
        },
        { status: 400 },
      );
    }

    const upstream = await fetch(imageUrl);
    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: `Fetch failed: HTTP ${upstream.status}` },
        { status: 502 },
      );
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    const webp = await sharp(buf)
      .resize({ width: 600, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();

    const bucket = mustEnv("R2_BUCKET");
    const publicBase = mustEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
    const key = `articles/news-thumb-${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;

    await r2Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: webp,
        ContentType: "image/webp",
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
