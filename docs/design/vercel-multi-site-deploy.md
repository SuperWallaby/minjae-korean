# Multi-site Vercel deploys (one repo)

`SuperWallaby/minjae-korean` powers several production domains from one Next.js app. **Each Vercel project must not rebuild on unrelated commits.**

## Projects

| Vercel project | Domain | Git auto-deploy | Build filter |
|----------------|--------|-----------------|--------------|
| `minjae-korean` | kajakorean.com | ✅ GitHub `main` | `node scripts/vercel-should-build.mjs minjae-korean` |
| `getpronounce` | getpronounce.net | ❌ CLI only | `exit 0` (always skip Git) |
| `eigopin` | eigopin.com | ❌ CLI only | `scripts/deploy-eigopin.sh` |

## How it works

Vercel **Ignored Build Step** (per project):

- Script exits **0** → skip build for this project  
- Script exits **1** → run build  

**getpronounce** always exits 0 on Git — production only moves via:

```bash
bash scripts/deploy-getpronounce.sh --promote
```

(2026-08-31: a Git deploy with a bad/partial build wiped `/ko`. CLI-only prevents that class of incident.)

Path prefixes for **minjae-korean** are in `scripts/vercel-should-build.mjs`. Examples:

| Commit changes | minjae-korean | getpronounce |
|----------------|---------------|--------------|
| `src/data/globalPins/published.json` only | skip | skip (R2 catalog; CLI only for code) |
| `src/data/vocabInfographic/published.json` only | skip (R2 catalog) | skip |
| `src/app/layout.tsx` (shared) | **build** | skip |
| `src/app/pronounce-site/…` only | skip | skip (CLI deploy) |

Catalog auto-push uploads R2 (`file.kajakorean.com/…/catalog/published.json`). Pages ISR-read that JSON. CLI deploy is for **code**, not content.
## Setup (once per machine / after clone)

```bash
bash scripts/setup-vercel-build-filters.sh
```

Dry run:

```bash
bash scripts/setup-vercel-build-filters.sh --dry-run
```

## Manual deploy (unchanged)

```bash
bash scripts/deploy-getpronounce.sh --promote   # getpronounce.net
bash scripts/deploy-eigopin.sh                  # eigopin.com
npx vercel deploy --prod                        # minjae-korean (linked project)
```

## Rules

- **Do not** POST a deploy hook *and* rely on Git for the same commit (duplicate production races).
- **Do not** attach the same domain to two Vercel projects.
- Catalog auto-push (`auto-push-global-catalog.mjs`) → R2 catalog (live ISR). CLI `deploy-getpronounce.sh` only with `--deploy` / `GLOBAL_CATALOG_FORCE_DEPLOY=1`.
