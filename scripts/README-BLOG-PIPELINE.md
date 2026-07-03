# Blog from YouTube Pipeline

Turn a Korean YouTube URL into a `/blog` post (English essay + de-AI passes + TSX registration).

## Prerequisites

`.env.local`:

- `SUPADATA_API_KEY` (preferred) or working YouTube captions
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`
- Optional: `BLOG_AZURE_DEPLOYMENT` or `AZURE_OPENAI_DEPLOYMENT`
- Cover images: **`gpt-image-2`** via `BLOG_IMAGE_DEPLOYMENT` (blog pipeline ignores `AZURE_OPENAI_DEPLOYMENT_IMAGE`)
- R2 (for cover upload): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`

## Commands

```bash
# 1) Fetch transcript only
yarn blog:fetch "https://www.youtube.com/watch?v=VIDEO_ID"

# 2) Full pipeline (preview in .tmp — does NOT touch src/)
yarn blog:from-youtube --url "https://www.youtube.com/watch?v=VIDEO_ID"

# 3) Pick title option 2, register on site
yarn blog:from-youtube --url "..." --title-index 1 --register

# 4) Cover only (existing post)
yarn blog:cover --slug mastering-korean-emotions-not-just-words

# Skip cover on full pipeline
yarn blog:from-youtube --url "..." --register --skip-cover
```

## Pipeline

```
URL → transcript
    → thesis + titles (LLM)
    → draft markdown
    → de-ai.py (5 passes)
    → TSX → src/data/blogPosts/content/{slug}.tsx
    ▼
[7] Cover (gpt-image-2) → R2 large WebP + thumb WebP → patch TSX
```

## Review before deploy

Generated TSX is marked auto-generated. Read `.tmp/{slug}.md` and the TSX file before `yarn deploy`.

Style refs: `style-ref/blog/`
