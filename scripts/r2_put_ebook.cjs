/* eslint-disable @typescript-eslint/no-require */
/**
 * Private eBook: PutObject a local file into R2.
 * Uses R2_* from .env / .env.local (no public URL; presign is separate).
 *
 *   node scripts/r2_put_ebook.cjs <path-to-pdf>
 *
 * Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_EBOOK_OBJECT_KEY
 * Optional: R2_TRY_CREATE_BUCKET=1  — if bucket missing, call CreateBucket (token must allow it).
 */
const { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } = require(
  "@aws-sdk/client-s3"
);
const fs = require("fs");
const path = require("path");

function loadEnvFile(p, override) {
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    if (!override && process.env[k] != null && process.env[k] !== "") continue;
    let v = trimmed.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    process.env[k] = v;
  }
}

function loadEnvs() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env"), false);
  loadEnvFile(path.join(root, ".env.local"), true);
}

(async () => {
  try {
    loadEnvs();
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET;
    const objectKey = (process.env.R2_EBOOK_OBJECT_KEY || "ebook/korean-beyond-translation.pdf")
      .trim();
    const tryCreate = String(process.env.R2_TRY_CREATE_BUCKET || "").toLowerCase() === "1";

    const fileArg = process.argv[2];
    if (!fileArg) {
      console.error("Usage: node scripts/r2_put_ebook.cjs <path-to-pdf>");
      process.exit(1);
    }
    const filePath = path.isAbsolute(fileArg)
      ? fileArg
      : path.join(process.cwd(), fileArg);

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error("Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_BUCKET");
    }
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    if (tryCreate) {
      try {
        await client.send(new HeadBucketCommand({ Bucket: bucket }));
      } catch (e) {
        const c = e && e.name ? e.name : e && e.Code;
        if (c === "NotFound" || c === 404) {
          console.log("HeadBucket: not found, creating bucket:", bucket);
          // R2: keep CreateBucket minimal; avoid LocationConstraint: "auto" (not valid on R2).
          await client.send(new CreateBucketCommand({ Bucket: bucket }));
        } else {
          throw e;
        }
      }
    } else {
      await client.send(new HeadBucketCommand({ Bucket: bucket })).catch(() => {
        console.warn("HeadBucket failed — check bucket name & token, or set R2_TRY_CREATE_BUCKET=1 (token must allow create).");
      });
    }

    const stat = fs.statSync(filePath);
    const body = fs.createReadStream(filePath);
    console.log("Uploading to R2:", { bucket, key: objectKey, size: stat.size });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: body,
        ContentType: "application/pdf",
        ContentLength: stat.size,
      })
    );
    console.log("Done. Presigned get uses this key; keep bucket private (no public r2 dev URL for this).");
  } catch (e) {
    console.error("Error:", e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
