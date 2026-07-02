# Design docs — migration index

Parent spec: [DESIGN.md](../../DESIGN.md)

Update the **Status** column when you migrate a route group.

## Core

| Doc | Scope | Status |
|-----|-------|--------|
| [00-system.md](./00-system.md) | Tokens, type, buttons, cards | ✅ |
| [01-shell.md](./01-shell.md) | Navbar, footer, loader, container | ✅ |

## Public pages

| Doc | Routes | Status | Notes |
|-----|--------|--------|-------|
| [pages/home.md](./pages/home.md) | `/` | ✅ | S1–2 quiz hero + book; S3–5 renewal via `MarketingShell` |
| [pages/subscribe.md](./pages/subscribe.md) | `/subscribe` | ✅ | Reference for form/marketing shell |
| [pages/news-blog.md](./pages/news-blog.md) | `/news`, `/blog` | ✅ | `ArticleFeed` inside shell |
| [pages/library.md](./pages/library.md) | `/grammar`, `/expressions`, `/drama`, `/songs`, `/fundamental`, `/quoto`, `/flashcards`, `/exams` | ✅ | Shared `MarketingHeader` + shell |
| [pages/article-reader.md](./pages/article-reader.md) | `/news/article/*`, `/blog/article/*`, chapter slugs | ✅ | Content in `MarketingShell` |
| [pages/vocab-quiz.md](./pages/vocab-quiz.md) | `/vocab-quiz`, `/vocab-quiz/review` | ✅ | `MarketingPage` wrapper; app UI unchanged |
| [pages/book.md](./pages/book.md) | `/book/korean-beyond-translation` | ✅ | `MarketingPage` wrapper |
| [pages/account.md](./pages/account.md) | `/account`, `/login`, `/bookmarks` | ✅ | Shell spacing + card tokens |
| [pages/legal.md](./pages/legal.md) | `/privacy`, `/terms` | ✅ | Prose in shell |

## Legacy / low priority

| Routes | Status | Notes |
|--------|--------|-------|
| `/booking`, `/coaching`, `/join/*`, `/call/*` | — | Hidden; not migrated |
| `/payment/*` | ✅ | Success + cancel use `MarketingShell` |
| `/recap/*` | — | Session recaps; not migrated |
| `/admin/*` | — | Separate admin design |

## Shared components

- [`src/components/site/MarketingShell.tsx`](../../src/components/site/MarketingShell.tsx) — `MarketingPage`, `MarketingShell`, `MarketingShellBody`, `MarketingHeader`
- Styles: [`home-renewal.module.css`](../../src/components/site/home-renewal.module.css)

## Changelog

| Date | Change |
|------|--------|
| 2026-06-15 | Initial renewal system + home/subscribe/shell docs |
| 2026-06-15 | Full public migration via `MarketingShell` components |
