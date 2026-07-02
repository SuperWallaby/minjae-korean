# Book product page

**Status:** ⬜ Pending

**Route:** `/book/korean-beyond-translation`

**File:** `src/app/book/korean-beyond-translation/page.tsx`

## Target

Product landing using **renewal shells**, not dark gradient CTA blocks.

## Structure

```
sectionBlock
  sectionShell
    cover image + title
    lead about the book
    CTAs:
      primary → /vocab-quiz or checkout (Stripe)
      outline → /news
```

## Copy

- Emphasize “Korean beyond literal translation”
- No “Book a session” — removed; use **Try the vocab quiz** or purchase flow

## Components

- `BookHeroClickable` / cover gallery — restyle borders to `--quiz-border`
- `CheckoutButton` — keep Stripe logic; button `variant="primary"`

## Migration

- [ ] Wrap sections in `home-renewal.module.css` shells
- [ ] Remove legacy `from-[#111827]` gradients on CTAs
- [ ] Match typography to home About section
