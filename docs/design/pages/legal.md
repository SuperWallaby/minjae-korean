# Legal pages

**Status:** ⬜ Pending

**Routes:** `/privacy` · `/terms`

**Files:** `src/app/privacy/page.tsx` · `src/app/terms/page.tsx`

## Target

Minimal prose on renewal canvas — no heavy cards.

```
sectionBlock pb-16
  Container max-w-3xl
    optional sectionShell + sectionShellPad
      h1 font-serif sectionTitle scale
      prose sections with h2, p, ul
```

## Typography

- Body: `--quiz-text-sub`, `leading-7`
- Headings: `font-serif`, `--quiz-text`
- Links: `--quiz-primary`

## Content note

Terms may still mention coaching sessions — update legal copy separately if business model changes.

## Migration

- [ ] Single white shell optional (readable on `--quiz-bg`)
- [ ] Remove legacy `1.12 kB` minimal styling gaps — ensure consistent padding with subscribe page footnote style
