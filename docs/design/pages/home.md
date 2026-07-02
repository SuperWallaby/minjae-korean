# Home `/`

**Status:** 🔄 Partial

**File:** `src/app/page.tsx` · `src/components/site/HomeRenewalSections.tsx` · `src/components/site/VocabQuizHomeSection.tsx` · `src/components/site/BookHomeSection.tsx`

## Section map

| # | Block | Component | Design status |
|---|-------|-----------|---------------|
| 1 | Vocab quiz hero | `VocabQuizHomeSection` | ✅ Keep as-is — blue gradient hero (`vocab-quiz-home.module.css`) |
| 2 | Book | `BookHomeSection` | ✅ Keep as-is |
| 3 | About | `HomeRenewalSections` | ✅ Renewal shell |
| 4 | Practice (News) | `HomeRenewalSections` | ✅ Renewal shell + `ArticleFeed` |
| 5 | Blog | `HomeRenewalSections` | ✅ Renewal shell + `ArticleFeed` |

Hidden (sessions paused): reviews, coaching, booking CTA, FAQ.

## Renewal sections (3–5)

Use `home-renewal.module.css`:

- `.sectionBlock` → `.sectionShell` → `.sectionShellPad`
- Eyebrow + `.sectionTitle` + optional lead
- Header row: title left, `Button variant="outline" size="sm"` + arrow link right

### About (`#approach`)

- Two-column grid: copy + circular portrait (`.portraitRing`)
- Copy in English; highlight **professional Korean teacher**
- Social: Instagram, TikTok inline links (`--quiz-primary`)

### Practice / Blog feeds

- `ArticleFeed` with `showMajor={false}` on home (grid only)
- Blog: `basePath="/blog/article"`, major card on blog page only — home uses 4 posts with `showMajor`

## Spacing

Parent wrapper: `space-y-10 md:space-y-14` between major sections.

## When editing

- Do **not** restyle sections 1–2 without explicit request
- New home sections should follow section shell pattern and sit after book or before footer
- Update this doc when adding/removing sections
