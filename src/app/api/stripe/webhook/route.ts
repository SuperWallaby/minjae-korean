import Stripe from "stripe";
import { NextRequest } from "next/server";

import { stripe, stripePrices } from "@/lib/stripe";
import { addStripeCreditsByEmail } from "@/lib/students";

export const runtime = "nodejs";

function addDays(iso: string, days: number) {
  const ms = Date.parse(iso);
  return new Date(ms + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) return new Response("Missing stripe-signature", { status: 400 });

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });

    const payload = await req.text();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, secret);
    } catch (e) {
      return new Response(`Webhook signature verification failed: ${e instanceof Error ? e.message : String(e)}`, {
        status: 400,
      });
    }

    if (event.type === "checkout.session.completed") {
      const baseSession = event.data.object as Stripe.Checkout.Session;
      const full = await stripe.checkout.sessions.retrieve(baseSession.id, {
        expand: ["line_items.data.price", "payment_intent"],
      });

      const email =
        full.customer_details?.email?.trim().toLowerCase() ||
        full.customer_email?.trim().toLowerCase() ||
        "";
      if (!email) return new Response("Missing email on session", { status: 400 });

      const prices = stripePrices();
      const priceId = full.line_items?.data?.[0]?.price?.id ?? "";

      const product =
        priceId === prices.firstTrial
          ? ("trial" as const)
          : priceId === prices.singlePass
            ? ("single" as const)
            : priceId === prices.monthly
              ? ("monthly" as const)
              : ("custom" as const);

      const resolved =
        product === "trial"
          ? { total: 1, kind: "single_pass" as const }
          : product === "single"
            ? { total: 1, kind: "single_pass" as const }
            : product === "monthly"
              ? { total: 8, kind: "pass_pack_8" as const }
              : null;

      if (!resolved) return new Response("Unknown price", { status: 200 });

      const purchasedAt = new Date((full.created ?? Math.floor(Date.now() / 1000)) * 1000).toISOString();
      const expiresAt = addDays(purchasedAt, 30);

      const stripeCustomerId = typeof full.customer === "string" ? full.customer : undefined;
      const stripePaymentIntentId = (() => {
        const pi = full.payment_intent as unknown;
        if (typeof pi === "string") return pi;
        if (pi && typeof pi === "object" && "id" in pi) {
          const id = (pi as { id?: unknown }).id;
          if (typeof id === "string") return id;
        }
        return undefined;
      })();

      addStripeCreditsByEmail({
        email,
        name: full.customer_details?.name ?? undefined,
        stripeCustomerId,
        stripeSessionId: full.id,
        stripePaymentIntentId,
        product,
        kind: resolved.kind,
        total: resolved.total,
        purchasedAt,
        expiresAt,
      });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    return new Response(`Webhook handler error: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
  }
}

