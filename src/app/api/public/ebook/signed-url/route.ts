import { NextRequest } from "next/server";
import { getEbookPresignedGetUrl } from "@/lib/r2Ebook";
import { getCheckoutSessionInfo } from "@/lib/stripeCheckoutSessionInfo";

export const runtime = "nodejs";

/**
 * Returns a short-lived presigned URL to a **private** R2 object, only for
 * verified Stripe book purchases. R2 key defaults to ebook/korean-beyond-translation.pdf.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId) {
    return Response.json(
      { ok: false, error: "Missing session_id" } as const,
      { status: 400 },
    );
  }

  const modeParam = req.nextUrl.searchParams.get("mode")?.toLowerCase() ?? "";
  const mode: "read" | "download" =
    modeParam === "download" ? "download" : "read";

  let info: Awaited<ReturnType<typeof getCheckoutSessionInfo>>;
  try {
    info = await getCheckoutSessionInfo(sessionId);
  } catch {
    return Response.json(
      { ok: false, error: "invalid_session" } as const,
      { status: 404 },
    );
  }

  if (!info.ok) {
    if (info.error === "not_paid") {
      return Response.json(
        { ok: false, error: "not_paid", paymentStatus: info.paymentStatus } as const,
        { status: 402 },
      );
    }
    return Response.json(
      { ok: false, error: "invalid_session" } as const,
      { status: 404 },
    );
  }
  if (info.product !== "book_launch") {
    return Response.json({ ok: false, error: "forbidden" } as const, {
      status: 403,
    });
  }

  try {
    const { url, expiresIn } = await getEbookPresignedGetUrl(mode);
    return Response.json({ ok: true, url, expiresIn } as const);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("R2_EBOOK_OBJECT_KEY") || message.includes("Missing env")) {
      return Response.json(
        { ok: false, error: "ebook_not_configured" } as const,
        { status: 503 },
      );
    }
    return Response.json(
      { ok: false, error: "ebook_unavailable" } as const,
      { status: 500 },
    );
  }
}
