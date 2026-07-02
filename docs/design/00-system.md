# 00 — System tokens & components

## Color

Defined in `src/app/globals.css`. Always prefer CSS variables over hard-coded hex.

```css
--quiz-bg: #f5f5f7;        /* page canvas */
--quiz-canvas: #ffffff;    /* primary surfaces */
--quiz-surface: #fafafc;   /* inset panels */
--quiz-surface-soft: #f0f0f0;
--quiz-text: #1d1d1f;
--quiz-text-sub: #6e6e73;
--quiz-text-muted: #86868b;
--quiz-primary: #0071e3;
--quiz-primary-focus: #0066cc;
--quiz-border: #e0e0e0;
```

Site aliases (`--background`, `--foreground`, `--primary`, `--border`, etc.) map to the quiz palette so existing Tailwind/shadcn classes stay valid.

## Typography

| Role | Font | Class / variable |
|------|------|------------------|
| UI & body | Plus Jakarta Sans | `font-sans`, `--font-plus-jakarta` |
| Headings | Bricolage Grotesque | `font-serif`, `--font-bricolage` |

**Heading scale (marketing sections):**

- Page/section title: `clamp(1.75rem, 4vw, 2.5rem)`, `font-semibold`, `tracking-tight`, `letter-spacing: -0.02em`
- Eyebrow: `0.8125rem`, `font-semibold`, pill (see below)
- Lead: `0.9375rem` → `1rem` sm+, `line-height: 1.65`, `--quiz-text-sub`

## Spacing & layout

- **Page max width:** `Container` → `max-w-6xl`, horizontal `px-4 sm:px-6 lg:px-8`
- **Section vertical rhythm:** `padding-block: 2.5rem` → `4rem` from `sm` (`.sectionBlock`)
- **Shell padding:** `.sectionShellPad` — `1.75rem` mobile → `3.5rem` desktop

## Radius

| Element | Radius |
|---------|--------|
| Section shell | `2rem` |
| Feature / list tile | `1.125rem` (18px) |
| Button | `rounded-full` |
| Eyebrow | `999px` |
| Portrait ring | `9999px` |

Tailwind theme: `--radius-lg: 18px` in `@theme inline`.

## Shadows

Use sparingly — renewal is flat-first with light elevation.

- Section shell: `var(--shadow-card)` — `0 10px 28px rgb(17 24 39 / 0.06)`
- Float / hero exceptions: `var(--shadow-float)` only where documented (home quiz hero)

**Avoid** heavy `shadow-2xl` on marketing cards unless matching an existing renewal component.

## Section shell pattern

**Reference:** `src/components/site/home-renewal.module.css`

```tsx
import styles from "@/components/site/home-renewal.module.css";

<section className={styles.sectionBlock}>
  <Container>
    <div className={styles.sectionShell}>
      <div className={styles.sectionShellPad}>
        <span className={styles.eyebrow}>Label</span>
        <h2 className={styles.sectionTitle}>Title</h2>
        <p className={styles.sectionLead}>Body copy.</p>
      </div>
    </div>
  </Container>
</section>
```

### Eyebrow

Pill label above titles: primary tint border + 8% primary fill, primary text.

### Feature card (nested)

`.featureCard` — white/surface inset, `1.125rem` radius, border `--quiz-border`.

## Buttons

`src/components/ui/Button.tsx`

| Variant | Use |
|---------|-----|
| `primary` | Main CTA — maps to `--quiz-primary` |
| `outline` | Secondary — border `--quiz-border` |
| `secondary` / `ghost` | Tertiary actions |

Sizes: `sm` / `md` / `lg`, all **pill** shape.

**Do not** use `gradient` variant on new marketing pages unless reviving book/checkout hero.

## Links

- Inline: `text-[var(--quiz-primary)]`, `underline underline-offset-2`, `hover:no-underline`
- Nav active: `bg-[color-mix(in_srgb,var(--quiz-primary)_10%,white)]` + `text-[var(--quiz-primary)]`

## Top loader

`nextjs-toploader` color: `#0071e3` (`layout.tsx`).

## Icons

Lucide React, `size-4` in buttons/nav, `strokeWidth` default.

## Motion

- Section enter: `RevealOnScroll`, `StaggerReveal` (`src/components/ui/`)
- Hover on cards: subtle `opacity-95` or `scale-[1.02]` on images only
- Keep motion reduced-friendly; no required animation for content

## Anti-patterns (marketing)

- Dark full-page gradients (old site hero)
- Olive / sand panel tokens as primary surfaces (`--panel-sand` legacy)
- `rounded-3xl` mixed with `2rem` shells on the same page without reason
- Hard-coded `#111827` primary buttons (use `variant="primary"`)
