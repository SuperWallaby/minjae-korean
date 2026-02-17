import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const fileNameRaw = typeof body?.fileName === "string" ? body.fileName : "";
    const contentType = typeof body?.contentType === "string" ? body.contentType : "";
    if (!fileNameRaw.trim()) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fileName" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bucket = mustEnv("R2_BUCKET");
    const publicBase = mustEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/g, "");
    const fileName = sanitizeFileName(fileNameRaw);
    const key = `articles/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${fileName}`;

    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(r2Client(), cmd, { expiresIn: 60 * 5 });
    const publicUrl = `${publicBase}/${key}`;

    return new Response(JSON.stringify({ ok: true, data: { uploadUrl, publicUrl, key } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

