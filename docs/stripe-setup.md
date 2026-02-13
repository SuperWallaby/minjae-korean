# Stripe setup (USD, one-time passes)

## 1) Create products/prices in Stripe

Create **two Prices** in Stripe (test mode first):

- `STRIPE_PRICE_SINGLE_PASS`: Single pass (1 credit)
- `STRIPE_PRICE_PASS_PACK_8`: Pass pack (8 credits)

Both should be **one-time** prices in **USD**.

## 2) Environment variables

Add these to your `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_SINGLE_PASS=price_...
STRIPE_PRICE_PASS_PACK_8=price_...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3) Webhook (local dev)

Recommended with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then copy the printed signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

