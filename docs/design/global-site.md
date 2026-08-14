# Kaja Global — Word Atlas

Source of truth for **https://global.kajakorean.com** (`src/app/global-site`, `src/components/global-site`, `src/lib/globalSite`).

This is **not** the kajakorean.com Apple/quiz system in root `DESIGN.md`. Do not reuse `--quiz-*`, teal, pill CTAs, or mint gradients here.

---

## Why the old look failed

The charts are dense, colorful infographics. The site around them was a mint SaaS shell (teal + orange pills, soft blobs, 18px radii, drop shadows). Chrome competed with the plates and looked like a generic edu landing page.

The site should feel like a **printed word atlas**: paper, ink, language-coded rails. Charts are the plates. UI is the caption.

---

## Tokens

| Token | Value | Use |
|-------|--------|-----|
| `--g-paper` | `#f4efe6` | Page ground |
| `--g-paper-2` | `#ebe4d6` | Recessed bands |
| `--g-ink` | `#1b1511` | Type, rules |
| `--g-ink-soft` | `#5c5348` | Lede, meta |
| `--g-rule` | `rgba(27, 21, 17, 0.14)` | Hairlines |
| `--g-card` | `#fbf8f1` | Plate mounts |
| `--g-stamp` | `#c43c1a` | Tutor CTA only |
| `--g-stamp-ink` | `#fff8f3` | Text on stamp |

**Do not use teal (`#0f766e`) or orange pills (`#c45c26` as the only brand accent).** Language colors are rails, not the brand.

### Language rails (`--g-lang`)

| Code | Rail |
|------|------|
| es | `#b4471e` |
| fr | `#2f4d73` |
| de | `#9a6b12` |
| it | `#2c6a4a` |
| ar | `#5b3d86` |
| ja | `#a31d18` |

### Type

Already loaded on the root layout — **do not add Google fonts**.

- Display / masthead / H1: Bricolage Grotesque (`--font-bricolage`)
- UI / body: Plus Jakarta Sans (`--font-plus-jakarta`)
- H1: `clamp(2.4rem, 6vw, 4.1rem)`, line-height ~0.95, tracking `-0.04em`, weight 700
- Kickers / section labels: 0.72rem, tracking `0.16em`, uppercase, weight 600
- Native language names keep their own script (never `uppercase` on العربية / 日本語)

### Shape

- Radius **4–8px**. No `border-radius: 999px` except the 28px TTS disc.
- Borders: 1px ink hairline. No drop shadows.
- Buttons: rectangular, 6px radius, 0.85rem 1.15rem padding.

---

## Shell

- Full-bleed paper ground. Inner column `max-width: 1180px`.
- Gutter: `1.5rem` on small screens (plus `safe-area-inset`), `2.25rem` from 720px. Charts and the language index must sit inside this gutter — not flush to the viewport.
- Implement gutters as `padding-left/right` on `.global-shell` (or `--g-pad-l/r`). **Never** use a `padding:` shorthand on the same element (`.global-main`, `.global-header-inner`) — it zeros the horizontal gutters.
- Header is a **masthead**, not a sticky glass bar: top + bottom hairline, no `backdrop-filter`, not sticky.
- Top row: wordmark left, **`1:1 tutor` text link** right (`/go/preply`, stamp color, underline — not a button). Offer `(50% off)` sits in the same link, smaller and `--g-ink-soft`.
- Wordmark: `Kaja` (Bricolage) + `Global` (small caps, tracking). Not a logo mark.
- Nav: native names in a row under the top bar (`Español Français Deutsch Italiano العربية 日本語`). Horizontal scroll on small screens. Active lang uses `--g-lang` underline.
- Footer is a colophon: small type, hairline, kajakorean.com + tutor link. No big marketing block.

---

## Home

1. **Hero (split).** Left: kicker → H1 → one lede sentence → two CTAs. Right: one featured plate (LCP image) with a figure caption (`Español · Eye colors`). On <800px, poster stacks under copy.
2. **Language index.** Six equal columns. Native name large, English name + chart count under. 4px left rail in `--g-lang`. No white floating chips.
3. **Atlas grid.** Section kicker `From the atlas` + title. 12 featured plates (2 per language). Cards are figures: image, then caption — not a product card with a shadow.

Primary CTA = stamp vermillion (`Book a tutor · 50% off`). Secondary = ink outline (`Browse the atlas`).

---

## Language page

- Breadcrumb as a small path (`Atlas / Español`).
- H1 = native name, sub = `{English} vocabulary charts`.
- Same grid as home. Other languages as a rail of native names, not a link dump.

---

## Pin (chart) page

- Two columns from 880px: **plate** (left, paper mount, 1px rule) + **entry**.
- Word list reads like a glossary: index `01`, headword, romanization, English gloss, TTS disc.
- Examples: target sentence as the lead, English as the gloss. No nested white cards.
- Tutor block is a **stamp ticket**: ink fill, vermillion label, rectangular button — not a teal gradient.

---

## Motion

- 120ms color/border only. No lift-on-hover (`translateY`).
- `prefers-reduced-motion: reduce` → disable transitions.

---

## Files

- Tokens + chrome: `src/app/global-site/global.css`
- Shell: `src/app/global-site/layout.tsx`
- Pages: `src/app/global-site/page.tsx`, `lang/[code]/page.tsx`, `pin/[id]/page.tsx`
- Cards: `src/components/global-site/GlobalPinCard.tsx`
