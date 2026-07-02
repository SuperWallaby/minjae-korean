# Subscribe `/subscribe`

**Status:** ✅ Reference implementation

**Files:** `src/app/subscribe/page.tsx` · `src/app/subscribe/SubscribeClient.tsx` · `src/app/api/public/newsletter/subscribe/route.ts`

## Layout

Single centered column, `max-w-2xl` Container, one `.sectionShell` card.

```
┌──────────────────────────────┐
│  logo                        │
│  [eyebrow: Free book]        │
│  Subscribe to Kaja (h1)      │
│  lead paragraph              │
│  ┌ benefit tile ─────────┐   │
│  ┌ benefit tile ─────────┐   │
│  ┌ benefit tile ─────────┐   │
│  email input               │
│  [Get Free Book]           │
│  legal footnote            │
└──────────────────────────────┘
```

## Copy rules

- Promise: free Korean learning **PDF** by email
- Also promise: **Korean quizzes and challenges** by email
- CTA button: **Get Free Book** (matches navbar)
- Success: inbox + PDF + quizzes note

## Benefit tiles

Three rows in `rounded-[1.125rem]` tiles:

- Border `--quiz-border`, bg `--quiz-surface`
- Icon left (`FileText`, `Puzzle`, `BookOpen`), `text-[var(--quiz-primary)]`
- Text `--quiz-text-sub`, `text-sm`

## Form

- `Input` with quiz border/surface classes
- Submit disabled when empty or after success
- Error: red-50 panel, rounded `1.125rem`

## Email (API)

Welcome email mentions PDF link + future quiz/challenge emails. PDF is hosted on public R2 (`NEWSLETTER_WELCOME_PDF_URL`, default `https://file.kajakorean.com/downloads/kaja-korean-book-preview.pdf`). Upload with `npm run newsletter:upload-pdf`.

## Reuse

Use this page as the template for other single-purpose marketing flows (waitlist, lead magnet).
