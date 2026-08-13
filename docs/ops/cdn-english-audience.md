# English-audience CDN checklist (kajakorean)

Split of work after the Aug 2026 perf review.

## You (Cloudflare dashboard — kajakorean zone)

MCP here is on the **trbox** account and has **no** kajakorean zones, so Cache Rules must be set on the account that owns `kajakorean.com` (same account as R2 bucket `kajakorean` / `file.kajakorean.com`).

### 1) Cache Rule — fix `cf-cache-status: DYNAMIC`

Today `file.kajakorean.com` and `quiz-media.kajakorean.com` always return **DYNAMIC** even with `Cache-Control: public, max-age=31536000`. US visitors miss PoP cache.

1. Cloudflare → zone **kajakorean.com** → **Caching** → **Cache Rules** → Create.
2. Name: `R2 media — cache everything`
3. If matches:
   - Hostname is `file.kajakorean.com` **OR**
   - Hostname is `quiz-media.kajakorean.com`
4. Then:
   - **Eligible for cache**: Eligible
   - **Edge TTL**: Use cache-control header if present, else default
   - Optional: **Browser TTL** Respect origin
5. Deploy.

Verify from any machine:

```bash
curl -sI "https://file.kajakorean.com/grammar-x/vocab-infographic/1785697063647-ant-accept-reject.webp" | grep -i cf-cache
# 1st: MISS or DYNAMIC→ after rule: MISS
# 2nd: HIT
```

Repeat for a `quiz-media.kajakorean.com` webp.

### 2) Smart Tiered Cache (optional, recommended)

Caching → Tiered Cache → **Smart Tiered Cache** On. Helps R2 + English PoPs.

### 3) Confirm custom domains

R2 → bucket → Custom Domains: `file.kajakorean.com` and `quiz-media.kajakorean.com` both **Active**.

---

## Agent / repo (done or scripted)

| Item | Status |
|------|--------|
| Runtime rewrite `*.r2.dev` → `quiz-media.kajakorean.com` | code |
| Runtime rewrite `file.fancamrank.com` → `file.kajakorean.com` | code (after copy) |
| Bulk catalog URL rewrite for r2.dev | script/replace |
| Upload global pin WebP to R2 `global/pins/` | `yarn global:upload-pins` |
| Serve global plates from `file.kajakorean.com` | code |
| Vercel CDN cache headers for global HTML | middleware |
| `next/image` remotePatterns | next.config |
| Copy fancamrank objects into kajakorean R2 | `node scripts/migrate-fancamrank-media-to-kaja-r2.mjs` |

### Fancamrank copy (run once with R2 env)

```bash
# collect live URLs then copy
curl -sL https://kajakorean.com/ | rg -o 'https://file\.fancamrank\.com/[^"'\'' \\]+' | \
  node scripts/migrate-fancamrank-media-to-kaja-r2.mjs
```

News/blog rows in Mongo that still store fancamrank URLs keep working via runtime rewrite **after** objects exist on `file.kajakorean.com`.
