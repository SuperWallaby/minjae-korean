# Account & auth

**Status:** ⬜ Pending

**Routes:** `/account` · `/login` · `/bookmarks`

## Nav relationship

- Public CTA: **Get Free Book** → `/subscribe` (not login)
- `/login` remains for: comments, bookmarks, account deep links, legacy magic link / Google

## Target account page

```
sectionBlock
  Container max-w-6xl
    grid: main (8 col) + aside (4 col)

Cards:
  - sectionShell or shadcn Card with:
      border --quiz-border
      bg --quiz-canvas
      radius 2rem (shell) or 1.125rem (inner)
```

## Hidden / paused UI

- Booking CTAs removed while 1:1 sessions paused
- Credits card shows balance but no “Pick a time”

## Login page

Legacy magic link + Google. Options:

1. **Minimal:** restyle `LoginClient` card with quiz tokens only
2. **Future:** redirect marketing traffic to `/subscribe`; keep `/login` for functional auth

## Bookmarks

`/bookmarks` — list of saved articles; use same card grid as news list target.

## Migration checklist

- [ ] Card borders → `--quiz-border`
- [ ] Page background relies on `--quiz-bg` (no extra gray wrappers)
- [ ] Primary buttons → `variant="primary"` (quiz blue)
- [ ] Profile aside sticky — keep layout, update colors

## Do not migrate

- Admin student/booking tools
- Stream/call UIs
