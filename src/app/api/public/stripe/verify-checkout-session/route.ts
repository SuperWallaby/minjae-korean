import { NextRequest } from "next/server";
import { getCheckoutSessionInfo } from "@/lib/stripeCheckoutSessionInfo";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId) {
    return Response.json(
      { ok: false, error: "Missing session_id" } as const,
      { status: 400 },
    );
  }

  try {
    const info = await getCheckoutSessionInfo(sessionId);
    if (!info.ok) {
      if (info.error === "not_paid") {
        return Response.json({
          ok: false,
          error: "not_paid" as const,
          paymentStatus: info.paymentStatus,
        });
      }
      return Response.json(
        { ok: false, error: "invalid_session" } as const,
        { status: 404 },
      );
    }

    return Response.json({
      ok: true,
      product: info.product,
      emailMasked: info.emailMasked,
    } as const);
  } catch {
    return Response.json(
      { ok: false, error: "invalid_session" } as const,
      { status: 404 },
    );
  }
}
