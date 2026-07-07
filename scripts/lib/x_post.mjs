/**
 * Post a tweet with image + alt text via X API.
 * OAuth 1.0a (preferred when configured) or OAuth 2.0.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { TwitterApi } from "twitter-api-v2";

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function optionalEnv(name) {
  return process.env[name]?.trim() || "";
}

function runtimeEnvPath() {
  const custom = process.env.X_RUNTIME_ENV_PATH?.trim();
  if (custom) return custom;
  return join(process.cwd(), "x-poster", "worker-runtime.env");
}

function persistOAuth2Tokens(accessToken, refreshToken) {
  const path = runtimeEnvPath();
  if (!existsSync(path)) return;

  let text = readFileSync(path, "utf8");
  const upsert = (key, value) => {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    text = re.test(text) ? text.replace(re, line) : `${text.replace(/\s*$/, "")}\n${line}\n`;
  };
  upsert("X_OAUTH2_ACCESS_TOKEN", accessToken);
  if (refreshToken) upsert("X_OAUTH2_REFRESH_TOKEN", refreshToken);
  writeFileSync(path, text, "utf8");

  process.env.X_OAUTH2_ACCESS_TOKEN = accessToken;
  if (refreshToken) process.env.X_OAUTH2_REFRESH_TOKEN = refreshToken;
}

function hasOAuth1UserTokens() {
  return Boolean(
    optionalEnv("X_API_KEY") &&
      optionalEnv("X_API_SECRET") &&
      optionalEnv("X_ACCESS_TOKEN") &&
      optionalEnv("X_ACCESS_TOKEN_SECRET"),
  );
}

function usesOAuth2() {
  return Boolean(
    optionalEnv("X_OAUTH2_REFRESH_TOKEN") &&
      optionalEnv("X_OAUTH2_CLIENT_ID") &&
      optionalEnv("X_OAUTH2_CLIENT_SECRET"),
  );
}

function createOAuth1ReadWriteClient() {
  return new TwitterApi({
    appKey: requireEnv("X_API_KEY"),
    appSecret: requireEnv("X_API_SECRET"),
    accessToken: requireEnv("X_ACCESS_TOKEN"),
    accessSecret: requireEnv("X_ACCESS_TOKEN_SECRET"),
  }).readWrite;
}

async function getOAuth2AccessToken() {
  const clientId = requireEnv("X_OAUTH2_CLIENT_ID");
  const clientSecret = requireEnv("X_OAUTH2_CLIENT_SECRET");
  const refreshToken = requireEnv("X_OAUTH2_REFRESH_TOKEN");
  const appClient = new TwitterApi({ clientId, clientSecret });
  const refreshed = await appClient.refreshOAuth2Token(refreshToken);
  persistOAuth2Tokens(
    refreshed.accessToken,
    refreshed.refreshToken ?? refreshToken,
  );
  return refreshed.accessToken;
}

async function createReadWriteClient() {
  if (hasOAuth1UserTokens()) {
    return createOAuth1ReadWriteClient();
  }
  if (usesOAuth2()) {
    const token = await getOAuth2AccessToken();
    return new TwitterApi(token).readWrite;
  }
  throw new Error(
    "Missing X credentials — set OAuth 1.0a (X_API_KEY/SECRET + ACCESS_TOKEN/SECRET) or OAuth 2.0 tokens",
  );
}

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function uploadMediaOAuth1(buffer, mimeType, altText) {
  const client = createOAuth1ReadWriteClient();
  const mediaId = await client.v1.uploadMedia(buffer, { mimeType });
  await client.v1.createMediaMetadata(mediaId, {
    alt_text: { text: altText.slice(0, 1000) },
  });
  return mediaId;
}

async function uploadMediaV2(accessToken, buffer, mimeType) {
  const form = new FormData();
  form.append(
    "media",
    new Blob([buffer], { type: mimeType }),
    mimeType.includes("jpeg") ? "image.jpg" : "image.bin",
  );
  form.append("media_category", "tweet_image");

  const res = await fetch("https://api.x.com/2/media/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(
      `X media upload failed (${res.status}): ${JSON.stringify(data).slice(0, 400)}`,
    );
  }

  const mediaId = data.data?.id ?? data.media_id_string;
  if (!mediaId) {
    throw new Error(
      `X media upload missing id: ${JSON.stringify(data).slice(0, 400)}`,
    );
  }
  return String(mediaId);
}

async function setMediaAltTextV2(accessToken, mediaId, altText) {
  const res = await fetch("https://api.x.com/2/media/metadata", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: mediaId,
      metadata: {
        alt_text: { text: altText.slice(0, 1000) },
      },
    }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(
      `X media alt text failed (${res.status}): ${JSON.stringify(data).slice(0, 400)}`,
    );
  }
}

async function uploadMediaWithAlt(buffer, mimeType, altText) {
  if (hasOAuth1UserTokens()) {
    return uploadMediaOAuth1(buffer, mimeType, altText);
  }

  const accessToken = await getOAuth2AccessToken();
  const mediaId = await uploadMediaV2(accessToken, buffer, mimeType);
  await setMediaAltTextV2(accessToken, mediaId, altText);
  return mediaId;
}

export function createXClient() {
  return createReadWriteClient();
}

/**
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {string} altText
 * @param {string} tweetText
 */
export async function postTweetWithImage({ imageBuffer, mimeType, altText, tweetText }) {
  const client = await createReadWriteClient();
  const mediaId = await uploadMediaWithAlt(imageBuffer, mimeType, altText);

  const tweet = await client.v2.tweet({
    text: tweetText,
    media: { media_ids: [mediaId] },
  });
  const tweetId = tweet.data.id;
  const author = optionalEnv("X_USERNAME").replace(/^@/, "");
  const tweetUrl = author
    ? `https://x.com/${author}/status/${tweetId}`
    : `https://x.com/i/web/status/${tweetId}`;
  return { tweetId, tweetUrl };
}
