# 01 — Site shell (navbar, footer, layout)

**Status:** ✅ Done — navbar/footer renewed; public pages use `MarketingShell`.

**Files:** `src/app/layout.tsx` · `src/components/site/SiteNavbar.tsx` · `src/components/site/SiteFooter.tsx` · `src/components/site/Container.tsx`

## Page chrome

```
┌─────────────────────────────────────────────┐
│ SiteNavbar (sticky)                         │
├─────────────────────────────────────────────┤
│                                             │
│  <main> — bg --quiz-bg via body             │
│    Container (max-w-6xl)                    │
│                                             │
├─────────────────────────────────────────────┤
│ SiteFooter                                  │
└─────────────────────────────────────────────┘
```

- `body`: `bg-background text-foreground` → resolves to quiz palette
- No global dark header; navbar sits on canvas background

## Navbar

### Desktop

- Logo left
- Links: Home (`/#approach`), News, Library dropdown
- Right: credits badges (if signed in), **Profile** or **Get Free Book** → `/subscribe`
- Active link: blue pill (see [00-system.md](./00-system.md))

### Mobile

- Full-screen sheet, white cards `rounded-2xl`, border `border-border`
- Same CTA: **Get Free Book**

### CTA rules (2026)

| State | Button | Target |
|-------|--------|--------|
| Guest | Get Free Book | `/subscribe` |
| Signed in | Profile | `/account` |

Do **not** show “Sign in” in the main nav (legacy `/login` remains for comments/account deep links).

## Footer

- Light theme: `--quiz-canvas` / `--quiz-border`
- Tagline: learning-focused (not 1:1 coaching)
- Links: News, Grammar, Account (no booking)
- Contact pills: rounded-full, border `--quiz-border`, surface background

## Container

Always wrap page content in `<Container>`. Optional `max-w-5xl` or `max-w-2xl` for reading/subscribe.

## Fonts (layout)

Loaded in `layout.tsx`:

- `--font-plus-jakarta` on `body`
- `--font-bricolage` for `font-serif`

## Migration checklist

- [x] Nav active state uses `--quiz-primary`
- [x] Footer light + quiz tokens
- [x] Top loader `#0071e3`
- [x] Mobile menu uses light cards on canvas background
- [x] CTA: Get Free Book → `/subscribe`
