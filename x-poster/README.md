# Grammar comparison → X auto-poster

Posts **1 comparison per run** to X with capybara image + **alt text**.  
Cron on `lab-worker` runs **3× daily** → **3 posts/day**.

## Tweet format

```
What is different? X vs Y

⭕ Korean example sentence
→ English translation / note
⭕ …

https://kajakorean.com/grammar/{id}/{slug}

#koreanvocab #koreanword #koreanlesson
```

Up to **4 examples** per tweet (`X_POST_EXAMPLE_COUNT`, default 4).

## Setup on GPU worker

```bash
# From laptop — sync code + install cron
bash scripts/deploy-x-poster.sh

# On worker — create secrets (NOT in git)
ssh lab-worker
cp ~/korean-teacher-mj/x-poster/worker-runtime.env.example ~/korean-teacher-mj/x-poster/worker-runtime.env
nano ~/korean-teacher-mj/x-poster/worker-runtime.env
```

### Required X credentials

**OAuth 2.0 (recommended)** — from Callback OAuth flow:

| Env | Description |
|-----|-------------|
| `X_OAUTH2_CLIENT_ID` | Client ID |
| `X_OAUTH2_CLIENT_SECRET` | Client Secret |
| `X_OAUTH2_ACCESS_TOKEN` | User access token |
| `X_OAUTH2_REFRESH_TOKEN` | Refresh token (rotates; saved back to `worker-runtime.env`) |

**OAuth 1.0a fallback** — portal “Generate Access Token and Secret”:

| Env | Description |
|-----|-------------|
| `X_API_KEY` | Consumer / API Key |
| `X_API_SECRET` | Consumer / API Secret |
| `X_ACCESS_TOKEN` | User Access Token |
| `X_ACCESS_TOKEN_SECRET` | User Access Token Secret |

Optional: `X_USERNAME` for clean tweet URLs.

## Cron schedule (KST)

| Time | Action |
|------|--------|
| 09:00 | 1 post |
| 15:00 | 1 post |
| 21:00 | 1 post |

Logs: `~/korean-teacher-mj/x-poster/post.log`

## Manual test

```bash
# Dry run (no tweet)
npx tsx scripts/post-grammar-x.ts --dry-run

# Post one now
bash x-poster/run-post.sh
```

## Queue

Posts oldest unpublished comparison that has `imageUrl` + `imageAlt`.  
Tracked in MongoDB collection `grammar_x_posts`.
