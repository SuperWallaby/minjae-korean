import { NextRequest } from "next/server";
import { stripe, stripePrices } from "@/lib/stripe";
import { maskEmailForDisplay } from "@/lib/stripePurchase";

export const runtime = "nodejs";

function productFromPriceId(priceId: string) {
  const prices = stripePrices();
  if (priceId === prices.firstTrial) return "trial";
  if (priceId === prices.singlePass) return "single";
  if (priceId === prices.bookLaunch) return "book_launch";
  if (priceId === prices.monthly1x) return "monthly_1x";
  if (priceId === prices.monthly2x) return "monthly_2x";
  if (priceId === prices.monthly3x) return "monthly_3x";
  return "custom";
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId) {
    return Response.json(
      { ok: false, error: "Missing session_id" } as const,
      { status: 400 },
    );
  }

  try {
    const full = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    if (full.payment_status !== "paid") {
      return Response.json({
        ok: false,
        error: "not_paid" as const,
        paymentStatus: full.payment_status,
      });
    }

    let lineItem = full.line_items?.data?.[0];
    let price = lineItem?.price;
    let priceId = typeof price === "string" ? price : (price?.id ?? "");
    if (!priceId) {
      const listed = await stripe.checkout.sessions.listLineItems(sessionId, {
        limit: 5,
        expand: ["data.price"],
      });
      lineItem = listed.data[0];
      price = lineItem?.price;
      priceId = typeof price === "string" ? price : (price?.id ?? "");
    }
    const product = productFromPriceId(priceId);

    const emailRaw =
      full.customer_details?.email?.trim() ??
      full.customer_email?.trim() ??
      "";
    const emailLower = emailRaw.toLowerCase();

    return Response.json({
      ok: true,
      product,
      emailMasked: emailLower ? maskEmailForDisplay(emailLower) : null,
    } as const);
  } catch {
    return Response.json(
      { ok: false, error: "invalid_session" } as const,
      { status: 404 },
    );
  }
}
