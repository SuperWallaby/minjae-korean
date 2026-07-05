# Capybara render service

Offloads grammar-comparison infographic compositing (Sharp CPU) from your laptop to a remote machine — e.g. V100 lab worker.

## Run locally

```bash
bash render/run.sh
# GET  http://127.0.0.1:8766/health
```

## Deploy to V100 worker (`lab-worker`)

```bash
bash scripts/deploy-capybara-render.sh
```

## Use from generate script

1. SSH tunnel (keep open while generating):

```bash
ssh -L 8766:10.10.10.14:8766 lab-master
```

2. In `.env.local`:

```env
CAPYBARA_RENDER_SERVICE_URL=http://127.0.0.1:8766
```

3. Generate as usual — image compositing runs on the worker:

```bash
yarn generate-grammar --words 그래서,그러니까
yarn generate-grammar --refresh-image --id 1000
```

Optional API key (set the same value on server + client):

```env
CAPYBARA_RENDER_API_KEY=your-secret
```

## API

`POST /render-grammar-comparison`

```json
{
  "questionEn": "When to use 그래서 vs 그러니까?",
  "items": [
    { "wordName": "그래서", "situationsEn": ["result", "therefore"] },
    { "wordName": "그러니까", "situationsEn": ["conclusion", "so"] }
  ],
  "outputWidth": 960,
  "webpQuality": 85
}
```

Response: `image/webp` bytes.
