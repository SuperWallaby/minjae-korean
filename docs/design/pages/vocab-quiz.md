# Vocab quiz

**Status:** 🔄 Partial

**Routes:** `/` (home hero) · `/vocab-quiz` · `/vocab-quiz/review`

**Files:**

- `src/components/site/VocabQuizHomeSection.tsx` · `vocab-quiz-home.module.css`
- `src/components/vocab-quiz/*` · `vocab-quiz.module.css`

## Two visual modes

### 1. Home hero (section 1)

**Exception:** Blue gradient shell — intentional product hero, not white renewal shell.

- `.heroShell` — gradient `#2563eb` → `#1e40af`
- White text, quiz card carousel inside
- **Do not** flatten to white when migrating other pages

### 2. Full quiz app (`/vocab-quiz`)

App-like experience — closer to Korean Quiz mobile:

- Light gray background
- Rounded cards, blue primary actions
- Uses `vocab-quiz.module.css` tokens

Align with renewal by ensuring:

- Primary blue `#0071e3` / `#2563eb` family consistent
- Border `#e0e0e0`
- Radius `18px` on game cards where possible

## Home integration

Home passes `sampleKoreanQuizHomeCards(12)` — TTS via CDN optimistic URLs.

## Review page

`/vocab-quiz/review` — flag/report UI; migrate to quiz module styles, white/surface cards.

## Migration checklist

- [x] Home hero distinct from marketing shells (documented)
- [ ] `/vocab-quiz` header bar matches site navbar height/spacing
- [ ] Review page borders → `--quiz-border`
- [ ] Link from home “Open app” uses primary blue

## Reference

Mobile consumer spec: `korean-quiz/flutter_app/DESIGN.md` (if present in monorepo).
