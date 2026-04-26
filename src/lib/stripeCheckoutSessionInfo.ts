import { stripe, stripePrices } from "@/lib/stripe";
import { maskEmailForDisplay } from "@/lib/stripePurchase";

export type CheckoutSessionProduct =
  | "trial"
  | "single"
  | "book_launch"
  | "monthly_1x"
  | "monthly_2x"
  | "monthly_3x"
  | "custom";

function productFromPriceId(priceId: string): CheckoutSessionProduct {
  const prices = stripePrices();
  if (priceId === prices.firstTrial) return "trial";
  if (priceId === prices.singlePass) return "single";
  if (priceId === prices.bookLaunch) return "book_launch";
  if (priceId === prices.monthly1x) return "monthly_1x";
  if (priceId === prices.monthly2x) return "monthly_2x";
  if (priceId === prices.monthly3x) return "monthly_3x";
  return "custom";
}

/**
 * Resolves a Checkout Session to product + masked email. Used by verify + eBook download APIs.
 */
export async function getCheckoutSessionInfo(sessionId: string) {
  const full = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });

  if (full.payment_status !== "paid") {
    return {
      ok: false as const,
      error: "not_paid" as const,
      paymentStatus: full.payment_status,
    };
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
  const emailMasked = emailLower ? maskEmailForDisplay(emailLower) : null;

  return {
    ok: true as const,
    product,
    emailMasked,
  };
}
