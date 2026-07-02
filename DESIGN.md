# Kaja Korean — Site Design System

This document is the **single source of truth** for the marketing site visual language introduced in the 2026 home renewal. New pages and refactors should follow it until explicitly superseded.

**Philosophy:** Apple-inspired light UI — soft gray canvas, white content shells, blue accent, generous radius, readable type. Aligned with the Korean Quiz app consumer spec (`korean-quiz` mobile), not the admin dark theme.

---

## Quick reference

| Token | Value | Usage |
|-------|-------|--------|
| `--quiz-bg` | `#f5f5f7` | Page background |
| `--quiz-canvas` | `#ffffff` | Cards / section shells |
| `--quiz-surface` | `#fafafc` | Nested panels, inputs |
| `--quiz-text` | `#1d1d1f` | Headings, primary body |
| `--quiz-text-sub` | `#6e6e73` | Secondary copy |
| `--quiz-text-muted` | `#86868b` | Meta, captions |
| `--quiz-primary` | `#0071e3` | Links, CTAs, active nav |
| `--quiz-border` | `#e0e0e0` | Borders |

**Typography:** Plus Jakarta Sans (UI/body) · Bricolage Grotesque (`font-serif`, headings)

**Radius:** Cards `2rem` (32px) · Inner tiles `1.125rem` (18px) · Buttons `rounded-full`

**Source files:** `src/app/globals.css` · `src/components/site/home-renewal.module.css` · `src/components/site/MarketingShell.tsx`

---

## Page-by-page specs

Detailed specs and migration status live in [`docs/design/`](docs/design/README.md).

| Area | Doc | Status |
|------|-----|--------|
| Tokens, components, patterns | [00-system.md](docs/design/00-system.md) | ✅ Defined |
| Navbar, footer, layout | [01-shell.md](docs/design/01-shell.md) | ✅ Done |
| Home `/` | [pages/home.md](docs/design/pages/home.md) | ✅ Done |
| Subscribe `/subscribe` | [pages/subscribe.md](docs/design/pages/subscribe.md) | ✅ Done |
| News & Blog lists | [pages/news-blog.md](docs/design/pages/news-blog.md) | ✅ Done |
| Library indexes | [pages/library.md](docs/design/pages/library.md) | ✅ Done |
| Article readers | [pages/article-reader.md](docs/design/pages/article-reader.md) | ✅ Done |
| Vocab quiz | [pages/vocab-quiz.md](docs/design/pages/vocab-quiz.md) | ✅ Done |
| Account & auth | [pages/account.md](docs/design/pages/account.md) | ✅ Done |
| Legal | [pages/legal.md](docs/design/pages/legal.md) | ✅ Done |

**Legend:** ✅ matches spec · 🔄 mixed / in progress · ⬜ not migrated

---

## How to migrate a page

1. Read the relevant `docs/design/pages/*.md` file.
2. Wrap main content in `Container` on `--quiz-bg` page background (usually automatic via `body`).
3. Prefer a **section shell** (`home-renewal.module.css` classes) for page headers and list blocks.
4. Use `--quiz-*` CSS variables or mapped Tailwind tokens (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`) — they resolve to the quiz palette in `globals.css`.
5. Replace legacy dark gradients / olive accents unless the page is **admin** (`/admin/*`).
6. Update the page row in `docs/design/README.md` when done.

---

## Out of scope (separate themes)

- **`/admin/*`** — operational dark UI; do not force marketing renewal here.
- **Booking / call / join flows** — hidden or legacy; migrate only if re-enabled.
- **Korean Quiz in-app screens** — follow `vocab-quiz.module.css` + flutter `DESIGN.md` where applicable.
