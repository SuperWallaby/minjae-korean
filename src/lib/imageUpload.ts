/**
 * Client-side image processing for upload: convert to WebP, optional resize for thumbnail.
 */

const WEBP_QUALITY = 0.88;
const THUMB_MAX_WIDTH = 600;

function baseName(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
}

/**
 * Load image file into a bitmap (works in browser).
 */
function loadImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

/**
 * Process an image file for upload: convert to WebP; optionally resize to max width (e.g. 600 for thumb).
 * Returns a new File with .webp extension and type image/webp.
 */
export async function processImageForUpload(
  file: File,
  options: { maxWidth?: number } = {}
): Promise<File> {
  const maxWidth = options.maxWidth ?? 0;
  const bitmap = await loadImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;

  let outW = w;
  let outH = h;
  if (maxWidth > 0 && w > maxWidth) {
    outW = maxWidth;
    outH = Math.round((h * maxWidth) / w);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d not available");
  ctx.drawImage(bitmap, 0, 0, outW, outH);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY);
  });
  if (!blob) throw new Error("Failed to encode WebP");

  const name = `${baseName(file.name)}.webp`;
  return new File([blob], name, { type: "image/webp" });
}

/** Max width used for thumbnail uploads (same as THUMB_MAX_WIDTH). */
export const THUMBNAIL_MAX_WIDTH = THUMB_MAX_WIDTH;

/**
 * Process image for thumbnail: resize to 600px width (aspect ratio kept), then WebP.
 */
export async function processImageForThumbnail(file: File): Promise<File> {
  return processImageForUpload(file, { maxWidth: THUMB_MAX_WIDTH });
}

/**
 * Process image for general upload: WebP only, no resize.
 */
export async function processImageForUploadWebPOnly(file: File): Promise<File> {
  return processImageForUpload(file, {});
}
