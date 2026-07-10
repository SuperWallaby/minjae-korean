import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(name + " is required.");
  return value;
}

function r2Endpoint(): string {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  if (endpoint) return endpoint.replace(/\/$/, "");
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  if (accountId) {
    return "https://" + accountId + ".r2.cloudflarestorage.com";
  }
  throw new Error("R2_ENDPOINT or R2_ACCOUNT_ID is required.");
}

export function r2BucketName(): string {
  return process.env.R2_BUCKET?.trim() || process.env.R2_BUCKET_NAME?.trim() || "";
}

export function isR2Configured(): boolean {
  const hasEndpoint = Boolean(
    process.env.R2_ENDPOINT?.trim() || process.env.R2_ACCOUNT_ID?.trim(),
  );
  return Boolean(
    hasEndpoint &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      r2BucketName(),
  );
}

function getR2Client(): S3Client {
  return new S3Client({
    region: process.env.R2_REGION?.trim() || "auto",
    endpoint: r2Endpoint(),
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function buildQuizAnswerTtsR2Key(quizId: string): string {
  return "system/quiz-tts/" + quizId + ".mp3";
}

export function buildQuizAnswerTtsSlowR2Key(quizId: string): string {
  return "system/quiz-tts/" + quizId + "-slow.mp3";
}

function voiceSlugForQuizAnswerTtsR2Key(voiceId: string): string {
  return voiceId
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** Same key layout as korean-quiz app example TTS. */
export function buildQuizExampleTtsR2Key(
  quizId: string,
  exampleIndex: number,
  edgeVoiceId: string,
): string {
  return (
    "system/quiz-tts/" +
    quizId +
    "/examples/" +
    exampleIndex +
    "/" +
    voiceSlugForQuizAnswerTtsR2Key(edgeVoiceId) +
    ".mp3"
  );
}

export async function uploadToR2(options: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<void> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: r2BucketName(),
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
      ...(options.cacheControl ? { CacheControl: options.cacheControl } : {}),
    }),
  );
}

export async function getR2LastModified(key: string): Promise<Date | null> {
  if (!isR2Configured()) return null;
  const client = getR2Client();
  try {
    const response = await client.send(
      new HeadObjectCommand({
        Bucket: r2BucketName(),
        Key: key,
      }),
    );
    return response.LastModified ?? null;
  } catch {
    return null;
  }
}

export async function getFromR2(
  key: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  const client = getR2Client();
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: r2BucketName(),
        Key: key,
      }),
    );
    const body = response.Body;
    if (!body) return null;
    const bytes = await body.transformToByteArray();
    return {
      body: Buffer.from(bytes),
      contentType: response.ContentType ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}
