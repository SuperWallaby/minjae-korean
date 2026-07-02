# News & Blog listing

**Status:** ⬜ Pending migration

**Routes:** `/news` · `/blog`

**Files:** `src/app/news/page.tsx` · `src/app/blog/page.tsx` · `src/components/article/ArticleFeed.tsx`

## Target look

Align list pages with **home Practice/Blog** sections + full-page shell.

```
py: sectionBlock equivalent (py-12 sm:py-16 ok)
Container max-w-5xl or max-w-6xl

┌─ sectionShell (optional wrap) ─────────────┐
│ eyebrow: Practice | Blog                   │
│ h1: Kaja News / Kaja · Blog                │
│ lead (muted)                               │
│                                            │
│ [major card — full width]                  │
│ [grid 2–3 cols — rest]                     │
└────────────────────────────────────────────┘
```

## Current vs target

| Element | Current | Target |
|---------|---------|--------|
| Page bg | implicit `--quiz-bg` | ✅ ok |
| Header | bare `font-serif` h1 | + eyebrow pill, optional shell |
| Cards | `border-border bg-card` | ok — tokens already mapped |
| Major card | gradient overlay on image | keep — matches `ArticleFeed` |
| Dev actions | news edit buttons | keep behind `NODE_ENV` |

## ArticleFeed

Shared component for home + list pages.

| Prop | News home | News page | Blog home | Blog page |
|------|-----------|-----------|-----------|-----------|
| `showMajor` | false | true | true | true |
| `basePath` | default | default | `/blog/article` | `/blog/article` |
| limit | 6 | 100 | 4 | 100 |

## Blog covers

Always use `resolveBlogCoverImage()` — fallback `/brand/og.png`.

## Migration steps

1. Wrap header in `.sectionShell` or apply eyebrow + `.sectionTitle` classes from `home-renewal.module.css`
2. Replace raw `text-muted-foreground` with `--quiz-text-sub` where inconsistent
3. Ensure outline “More” buttons match home (`border-[var(--quiz-border)]`)
4. Mark ✅ in [README](../README.md) when both routes done

## Article detail

See [article-reader.md](./article-reader.md) — not part of this doc.
