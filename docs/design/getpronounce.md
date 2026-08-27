# GetPronounce — multilingual word atlas

**https://getpronounce.net** · `src/app/pronounce-site`, `src/lib/globalSite`, `src/lib/atlasRoutes`

Absorbs the former **global.kajakorean.com** Word Atlas. Apex is **Chinese**; other languages live under path prefixes.

---

## URL map

| Public path | Content |
|-------------|---------|
| `/` | Chinese home (charts + pronunciation) |
| `/pin/{id}` | Chinese vocab charts (`*__zh`) |
| `/words/{slug}` | Single headword listen desk (e.g. `ni-hao`) |
| `/pinyin/` | Pinyin hub (tones + chart links) |
| `/es/`, `/fr/`, `/de/`, `/it/`, `/ar/`, `/ja/` | Language hubs |
| `/es/pin/{id}`, … | Non-Chinese charts |
| `/go/preply`, `/go/italki` | Affiliate hops |

**Aliases:** `/jp/` → `/ja/` · legacy `/lang/{code}` → prefix routes

**Redirects:** `global.kajakorean.com/*` → `getpronounce.net/*` (301)

---

## Deploy

See **[vercel-multi-site-deploy.md](./vercel-multi-site-deploy.md)** — one GitHub repo, **filtered builds per Vercel project** (no cross-site overwrites).

Vercel project **`getpronounce`** · `vercel.getpronounce.json` · `NEXT_PUBLIC_SITE_MODE=pronounce`

**Auto:** GitHub `main` → builds **only when getpronounce paths change** (`scripts/vercel-should-build.mjs getpronounce`).

- Global catalog auto-push commits `published.json` → **getpronounce only** (minjae-korean skipped).
- Vercel env: `NEXT_PUBLIC_SITE_MODE=pronounce`, `NEXT_PUBLIC_PRONOUNCE_SITE_ORIGIN=https://getpronounce.net`
- Node **20.x** on getpronounce project.

**Manual:**

```bash
bash scripts/deploy-getpronounce.sh --promote
```

---

## Ops (charts)

Same pipeline as global — catalog `src/data/globalPins/published.json` now points at `https://getpronounce.net`.

```bash
yarn global:publish-pins
yarn global:enrich
# deploy → then Pinterest:
node scripts/pin-global-lang-samples.mjs --count 4
```

Pin destinations use prefix URLs, e.g. `https://getpronounce.net/es/pin/03_foods__es?utm_...`

---

## Chinese pronunciation (`/words/`)

ElevenLabs bootstrap → GPT-SoVITS on GPU. **Priority slots = Mainland Mandarin** (`cn-female`, `cn-male`). TW / HK optional later. See `scripts/lib/getpronounce-zh-voices.mjs`.

```bash
yarn pronounce:sovits-bootstrap -- --slot cn-female
yarn pronounce:sovits-train              # CN only by default
yarn pronounce:sovits-train -- --all-regions
```

## Spanish accents (LatAm vs Spain)

Charts default to **LatAm (es-MX)** for US Pinterest traffic; Spain (es-ES) is a toggle on `/es/pin/…`.

Enrich writes both `ttsLatam` + `ttsEs` via free Edge TTS:

```bash
yarn global:enrich -- --id 01_eye-colors__es --tts-only --force
```

Free GPU SoVITS (Edge bootstrap — no ElevenLabs):

```bash
yarn pronounce:es-sovits-bootstrap
yarn pronounce:es-sovits-train                 # LatAm first, then Spain
yarn pronounce:es-sovits-train -- --slot es-latam-female
```

Do **not** use `yarn pronounce:pin` for chart boards — use global-style `__zh` / `__es` chart pins only.