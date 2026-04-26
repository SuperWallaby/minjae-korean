/**
 * Idempotently ensure a Stripe Product + one-time Price for the book launch.
 * Reads STRIPE_SECRET_KEY from the environment (load .env.local if present).
 *
 * Usage:
 *   node scripts/ensure-stripe-book-launch.mjs
 *   STRIPE_BOOK_LAUNCH_CENTS=990 node scripts/ensure-stripe-book-launch.mjs
 *
 * Then add the printed line to .env.local:
 *   STRIPE_PRICE_BOOK_LAUNCH=price_xxxx
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const API_VERSION = "2026-01-28.clover";
const KAJA_KEY = "book_launch";
const DEFAULT_CENTS = 990; // $9.90
const CURRENCY = "usd";

function loadEnvLocal() {
  const p = join(root, ".env.local");
  if (!existsSync(p)) return;
  const s = readFileSync(p, "utf8");
  for (const line of s.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error("Missing STRIPE_SECRET_KEY (add to .env.local or export in shell).");
  process.exit(1);
}

const unitAmount = parseInt(
  process.env.STRIPE_BOOK_LAUNCH_CENTS || String(DEFAULT_CENTS),
  10,
);
if (!Number.isInteger(unitAmount) || unitAmount < 50) {
  console.error("STRIPE_BOOK_LAUNCH_CENTS must be an integer >= 50 (cents).");
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: API_VERSION });

async function findOrCreateProduct() {
  const list = await stripe.products.list({ active: true, limit: 100 });
  const found = list.data.find(
    (p) => p.metadata?.kaja_key === KAJA_KEY,
  );
  if (found) return found;
  return stripe.products.create({
    name: "Korean, Beyond Translation (eBook)",
    description: "PDF eBook — launch / open price window",
    metadata: { kaja_key: KAJA_KEY },
  });
}

/** @param {string} productId */
async function findMatchingPrice(productId) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 20,
  });
  return prices.data.find(
    (x) =>
      x.type === "one_time" &&
      x.currency === CURRENCY &&
      x.unit_amount === unitAmount,
  );
}

async function main() {
  const product = await findOrCreateProduct();
  let price = await findMatchingPrice(product.id);
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: CURRENCY,
      unit_amount: unitAmount,
    });
    process.stdout.write(
      `Created new Price on product ${product.id} (${unitAmount / 100} ${CURRENCY.toUpperCase()} one-time)\n\n`,
    );
  } else {
    process.stdout.write(
      `Using existing Price ${price.id} (${unitAmount / 100} ${CURRENCY.toUpperCase()} one-time)\n\n`,
    );
  }

  const line = `STRIPE_PRICE_BOOK_LAUNCH=${price.id}`;
  process.stdout.write("Add this to .env.local (or deploy env):\n\n");
  process.stdout.write(`${line}\n\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
