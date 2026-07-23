import Stripe from "stripe";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

let _stripe: Stripe | null = null;

/** Lazy so `next build` can collect page data without Stripe env present. */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-01-28.clover",
  });
  return _stripe;
}

/** @deprecated Prefer getStripe() — kept for existing call sites. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

export function stripePrices() {
  return {
    singlePass: requireEnv("STRIPE_PRICE_SINGLE_PASS"),
    firstTrial: requireEnv("STRIPE_PRICE_FIRST_TRIAL"),
    bookLaunch: requireEnv("STRIPE_PRICE_BOOK_LAUNCH"),
    /** Flexible Monthly Rhythm: 주당 1/2/3회 선택 후 월 결제 */
    monthly1x: requireEnv("STRIPE_PRICE_MONTHLY_1X"),
    monthly2x: requireEnv("STRIPE_PRICE_MONTHLY_2X"),
    monthly3x: requireEnv("STRIPE_PRICE_MONTHLY_3X"),
  };
}
