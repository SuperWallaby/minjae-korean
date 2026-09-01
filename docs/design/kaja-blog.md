# Kaja Korean — how to study Korean

**Source of truth** for kajakorean.com (not getpronounce / global / sound / ja).

**Niche:** only **how to study Korean** — methods, habits, practice notes. Not a grammar library, drama index, or tutor marketplace.

Medium-inspired layout: white canvas, serif titles, flat header, story list with hairline rules. Play Game and email subscribe stay. Old library URLs 301 to `/blog`.

Brand copy lives in [`src/lib/siteBrand.ts`](../../src/lib/siteBrand.ts) (`SITE_NICHE`, `SITE_DESCRIPTION`, …).

---

## Tokens

| Token | Value | Usage |
|-------|--------|--------|
| Canvas | `#ffffff` | Page + footer |
| Column | `780px` | Home / blog / articles (CSS module `.column`; Medium story ~680, slightly looser) |
| Shell | `1192px` | Header |
| Book | `960px` | Book band |
| Ink | `#242424` | Titles, body |
| Muted | `#6b6b6b` | Meta, excerpts |
| Rule | `#f2f2f2` | Header/footer border, story dividers |
| Accent | `#1a8917` | Links, Get free book button |

**Type:** Plus Jakarta Sans (UI) · Bricolage Grotesque (`font-serif`, names and titles)

**Title scale (Medium live):** page/topic H1 `42px/500` · article H1 `42px/700` · feed story `20px/700` · excerpt `16px/400`

**CSS:** [`src/components/site/home-blog.module.css`](../../src/components/site/home-blog.module.css)

Do **not** wrap kajakorean pages in `MarketingShell`. Do not bring back cream cards or the floating pill navbar.

---

## Chrome

- **Header:** Full-width white bar. Wordmark **Kaja Korean**. Links: About, Notes, Book. Right: Play Game, Sign in, green **Get free book**.
- Footer: white; copy = how to study Korean.
- `KajaMainLayoutChrome` background is white.

---

## Home `/`

1. Eyebrow **How to study Korean** · H1 **Minjae** · short bio  
2. **Latest** notes  
3. **Book**

Title: `Kaja Korean · How to study Korean`

## Blog `/blog`

H1 **How to study Korean**. Archive of method notes.

## Article `/blog/article/[slug]`

Title pattern: `{post} | How to study Korean | Kaja Korean`

---

## Other kajakorean pages

| Route | Treatment |
|-------|-----------|
| `/subscribe` | Free study PDF + how-to-study framing |
| `/vocab-quiz` | Quiz UI; site nav hidden on this route |
| `/book/...` | Medium product page — study methods beyond translation |
| `/privacy` `/terms` `/support` | White reading column |
| `/vocab/*` | Keep for Pinterest → getpronounce. Do not delete. |

---

## Out of scope

- `/admin/*`, booking/call  
- `global.kajakorean.com`, `getpronounce.net`, `sound.eigopin.com`, eigopin/ja
