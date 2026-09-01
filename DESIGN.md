# Kaja Korean site design

**kajakorean.com** is a niche blog on **how to study Korean**. Spec: [`docs/design/kaja-blog.md`](docs/design/kaja-blog.md). Brand strings: [`src/lib/siteBrand.ts`](src/lib/siteBrand.ts).

Older quiz-app marketing docs under `docs/design/pages/` and the cream-card phase are **superseded**. Do not reintroduce `MarketingShell` or the floating pill navbar on home, blog, subscribe, or legal pages.

---

## Other products (same repo)

These keep their own specs and chrome:

| Site | Doc |
|------|-----|
| `global.kajakorean.com` | [docs/design/global-site.md](docs/design/global-site.md) |
| `getpronounce.net` | [docs/design/getpronounce.md](docs/design/getpronounce.md) |
| `sound.eigopin.com` | `src/app/sound-site` |
| EigoPin / ja | `src/app/ja-site` |

**Deploy:** [docs/design/vercel-multi-site-deploy.md](docs/design/vercel-multi-site-deploy.md)

**Admin** (`/admin/*`) stays a separate operational UI.
