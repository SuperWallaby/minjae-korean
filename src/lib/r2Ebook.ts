import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { EBOOK_PDF_FILE_NAME } from "@/lib/stripePurchase";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v?.trim()) throw new Error(`Missing env: ${name}`);
  return v.trim();
}

function r2S3() {
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

/**
 * Presigned GET for a private R2 object (eBook). No public URL required.
 * @param mode read = inline PDF; download = Content-Disposition attachment
 */
export async function getEbookPresignedGetUrl(
  mode: "read" | "download",
): Promise<{ url: string; expiresIn: number }> {
  const key =
    process.env.R2_EBOOK_OBJECT_KEY?.trim() || "ebook/korean-beyond-translation.pdf";

  const bucket = mustEnv("R2_BUCKET");
  const asciiName = EBOOK_PDF_FILE_NAME.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
  const disposition =
    mode === "download"
      ? `attachment; filename="${asciiName || "ebook.pdf"}"`
      : `inline; filename="${asciiName || "ebook.pdf"}"`;

  const client = r2S3();
  const expiresIn = 60 * 15;
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: disposition,
  });
  const url = await getSignedUrl(client, cmd, { expiresIn });
  return { url, expiresIn };
}
