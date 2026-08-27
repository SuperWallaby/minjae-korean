# Multi-site Vercel deploys (one repo)

`SuperWallaby/minjae-korean` powers several production domains from one Next.js app. **Each Vercel project must not rebuild on unrelated commits.**

## Projects

| Vercel project | Domain | Git auto-deploy | Build filter |
|----------------|--------|-----------------|--------------|
| `minjae-korean` | kajakorean.com | ✅ GitHub `main` | `node scripts/vercel-should-build.mjs minjae-korean` |
| `getpronounce` | getpronounce.net | ✅ GitHub `main` | `node scripts/vercel-should-build.mjs getpronounce` |
| `eigopin` | eigopin.com | ❌ CLI only | `scripts/deploy-eigopin.sh` |

## How it works

Vercel **Ignored Build Step** (per project):

- Script exits **0** → skip build for this project  
- Script exits **1** → run build  

Path prefixes are defined in `scripts/vercel-should-build.mjs`. Examples:

| Commit changes | minjae-korean | getpronounce |
|----------------|---------------|--------------|
| `src/data/globalPins/published.json` only | skip | **build** |
| `src/data/vocabInfographic/published.json` only | **build** | skip |
| `src/app/layout.tsx` (shared) | **build** | **build** |
| `src/app/pronounce-site/…` only | skip | **build** |

This stops catalog auto-push from kicking off a 20-minute kajakorean build, and stops Kaja-only commits from replacing getpronounce.net.

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
- Catalog auto-push (`auto-push-global-catalog.mjs`) → Git only; getpronounce filter ensures only `getpronounce` builds.
