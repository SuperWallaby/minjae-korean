import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

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

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req: Request) {
  if (!devOnly()) {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: "Missing file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: "File too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bucket = mustEnv("R2_BUCKET");
    const publicBase = mustEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/g, "");
    const fileName = sanitizeFileName(file.name);
    const key = `articles/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${fileName}`;
    const contentType = file.type || "application/octet-stream";
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const publicUrl = `${publicBase}/${key}`;
    return new Response(
      JSON.stringify({ ok: true, data: { publicUrl, key } }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: errMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
