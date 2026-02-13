import { NextRequest } from "next/server";
import { stripe, siteUrl, stripePrices } from "@/lib/stripe";
import { getStudentById, hasUsedFirstTrial, findStudentByEmail } from "@/lib/students";

export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const product = typeof body?.product === "string" ? body.product : "";
    const priceId = typeof body?.priceId === "string" ? body.priceId : "";
    const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";

    if (!email || !isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), { status: 400 });
    }

    const prices = stripePrices();
  const allowed = new Set([prices.singlePass, prices.monthly, prices.firstTrial]);
  const resolvedPriceId =
    product === "single"
      ? prices.singlePass
      : product === "monthly"
        ? prices.monthly
        : product === "trial"
          ? prices.firstTrial
          : priceId;

    if (!resolvedPriceId || !allowed.has(resolvedPriceId)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid price" }), { status: 400 });
    }

    // Enforce "trial is only once per account" (prefer studentId over email).
    if (resolvedPriceId === prices.firstTrial) {
      const s =
        studentId
          ? getStudentById(studentId)
          : findStudentByEmail(email);
      if (s && hasUsedFirstTrial(s)) {
        return new Response(
          JSON.stringify({ ok: false, error: "First time offer is available once per account." }),
          { status: 409 },
        );
      }
    }

    const base = siteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/payment/cancel`,
      metadata: {
        email,
        product: product || "custom",
      },
    });

    return new Response(JSON.stringify({ ok: true, url: session.url }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

