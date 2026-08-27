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

Vercel project **`getpronounce`** · `vercel.getpronounce.json` · `NEXT_PUBLIC_SITE_MODE=pronounce`

**Auto (recommended):** GitHub `SuperWallaby/minjae-korean` → `main` push deploys **getpronounce** production (same repo as kajakorean.com).

- Global catalog auto-push (`auto-push-global-catalog.mjs`) commits `published.json` to `main` → **one** Vercel Git deploy on project **getpronounce** (do not also POST a deploy hook — that used to race two production builds).
- Vercel project env: `NEXT_PUBLIC_SITE_MODE=pronounce`, `NEXT_PUBLIC_PRONOUNCE_SITE_ORIGIN=https://getpronounce.net`
- Prefer Node **20.x** on the getpronounce project (matches `package.json` `engines`; Node 24 has broken webpack builds).
- Optional: minjae-korean **Ignored Build Step** — skip when only `src/data/globalPins/published.json` changed (kajakorean.com does not need global catalog deploys).

**Manual:**

```bash
bash scripts/deploy-getpronounce.sh
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