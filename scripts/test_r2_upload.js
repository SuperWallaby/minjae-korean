/* eslint-disable @typescript-eslint/no-require-imports */
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");

// Simple .env loader (non-invasive) — loads key=value, supports quoted values.
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const k = trimmed.slice(0, idx).trim();
      let v = trimmed.slice(idx + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
      process.env[k] = v;
    }
  }
} catch {
  // ignore
}

(async () => {
  try {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET;
    const publicBase =
      (process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_BASE_UR || "").replace(/\/+$/, "");

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
      throw new Error("Missing one of R2 env vars (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL)");
    }

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const key = `articles/test-upload-${Date.now()}.txt`;
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "text/plain",
    });

    console.log("Generating presigned URL...");
    const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 60 * 5 });
    const publicUrl = `${publicBase}/${key}`;
    console.log("uploadUrl:", uploadUrl);
    console.log("publicUrl:", publicUrl);

    console.log("Uploading test payload...");
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: "kaja-r2-test",
    });
    console.log("PUT response status:", res.status);

    console.log("Checking public URL (HEAD)...");
    const head = await fetch(publicUrl, { method: "HEAD" });
    console.log("HEAD status:", head.status);

    if (res.ok && (head.ok || head.status === 405)) {
      console.log("Upload appears successful. Public URL:", publicUrl);
      process.exit(0);
    } else {
      console.error("Upload failed or public URL inaccessible.");
      process.exit(2);
    }
  } catch (e) {
    console.error("Error:", e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();

