import Stripe from "stripe";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2026-01-28.clover",
});

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

export function stripePrices() {
  return {
    monthly: requireEnv("STRIPE_PRICE_MONTHLY"),
    singlePass: requireEnv("STRIPE_PRICE_SINGLE_PASS"),
    firstTrial: requireEnv("STRIPE_PRICE_FIRST_TRIAL"),
  };
}

