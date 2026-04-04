/**
 * Upload a file to R2 via same-origin API (avoids browser CORS on presigned PUT).
 */

export async function uploadFileToR2(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch("/api/admin/r2/upload", {
    method: "POST",
    body: form,
  });
  const json = (await res.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    data?: { publicUrl?: string };
  };
  if (!res.ok || !json?.ok) {
    throw new Error(String(json?.error ?? "Upload failed"));
  }
  const publicUrl = String(json?.data?.publicUrl ?? "");
  if (!publicUrl) throw new Error("Public URL missing");
  return publicUrl;
}
