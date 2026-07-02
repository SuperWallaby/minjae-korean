# Library indexes

**Status:** ⬜ Pending migration

**Routes:** `/grammar` · `/expressions` · `/drama` · `/songs` · `/fundamental` · `/quoto` · `/flashcards` · `/exams` (+ placement)

## Shared template

All library index pages should converge on one layout:

```
Container
  sectionShell (or sectionBlock + shell)
    eyebrow: Library | Grammar | …
    sectionTitle: page name
    sectionLead: one-line description (optional)

    grid of link cards OR chapter list
      - rounded-[1.125rem] or rounded-2xl
      - border --quiz-border
      - bg --quiz-canvas or --quiz-surface
      - hover: opacity-95 or subtle bg --quiz-surface-soft
```

## Card content

- Title: `font-serif font-semibold`
- Meta: level badge (if applicable) — keep `levelBadgeClass` from `@/lib/levelDisplay`
- Thumbnail: `aspect-video`, `object-cover`, muted placeholder bg

## Nav entry

Library items live in `src/data/libraryLinks.ts` — icons in `/public/*.webp`.

Navbar dropdown: white panel, `rounded-2xl`, emphasized items (`emphasized: true`) get subtle muted bg.

## Per-route notes

| Route | Special |
|-------|---------|
| `/grammar`, `/expressions` | Chapter lists from data files |
| `/drama`, `/songs` | DB-backed slugs |
| `/fundamental` | Cub mascot / basics tone |
| `/quoto` | Short quotes grid |
| `/flashcards` | Gallery module — audit `flashcard-gallery.module.css` |
| `/exams` | Exam cards + placement CTA |

## Migration order (suggested)

1. `/grammar` — high traffic, simple list
2. `/expressions`
3. `/news` already has feed pattern — see [news-blog.md](./news-blog.md)
4. `/drama`, `/songs`
5. `/exams`, `/flashcards`

## Anti-patterns

- Mixed `rounded-xl` and `2rem` shells on same page
- Dark chapter headers left from old theme
