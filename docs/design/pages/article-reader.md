# Article & chapter readers

**Status:** ⬜ Pending migration

**Routes:**

- `/news/article/[slug]`
- `/blog/article/[slug]`
- `/grammar/[slug]`, `/expressions/[slug]`, `/fundamental/[slug]`
- `/drama/[slug]`, `/songs/[slug]`

## Reading layout

```
Container max-w-3xl or max-w-4xl (prose width)

┌─ optional shell for hero image ─┐
│ cover / title / meta             │
└──────────────────────────────────┘

prose body
  - text --quiz-text
  - links --quiz-primary
  - inline components: Describe, audio, vocabulary blocks

footer actions: bookmark, comments, back link
```

## Typography

- Article title: `font-serif`, `text-3xl`–`4xl`, `tracking-tight`
- Body: `text-base`/`lg`, `leading-7`, subtext `--quiz-text-sub`
- Meta dates: `RelativeDate`, `text-xs`, muted

## Interactive widgets

Keep functional; restyle containers only:

- `Describe` — sign-in prompts → consider subscribe CTA for guests long-term
- `ArticleComments` — card with `border-border` → quiz border
- Level badge — unchanged colors from `levelDisplay`

## Blog-specific

- `ContentLink`, `Gap` in blog TSX content
- Cover: `resolveBlogCoverImage`
- Related posts row at bottom — use `ArticleFeed` or compact horizontal cards

## News-specific

- Major reading features: vocabulary, questions, discussion (if enabled)
- Edit link in dev/admin only

## Migration steps

1. Hero/header block → white shell or flat header on `--quiz-bg`
2. Replace olive/sand panels in article chrome
3. Sticky audio/player bars — white surface + border top `--quiz-border`
4. Verify mobile padding matches `Container`

## Do not change

- Article data shapes, SEO JSON-LD, edit routes
