import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function mustEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function r2Client() {
  const accountId = mustEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: mustEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: mustEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function r2PublicBase() {
  return mustEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/g, "");
}

/** @returns {Promise<string>} public URL */
export async function uploadBufferToR2(key, buffer, contentType) {
  const bucket = mustEnv("R2_BUCKET");
  await r2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return `${r2PublicBase()}/${key}`;
}

export function hasR2Config() {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET?.trim() &&
      process.env.R2_PUBLIC_BASE_URL?.trim(),
  );
}
