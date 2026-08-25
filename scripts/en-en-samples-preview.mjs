#!/usr/bin/env node
/**
 * Local gallery for .tmp/en-en-samples
 *   node scripts/en-en-samples-preview.mjs
 *   node scripts/en-en-samples-preview.mjs --open
 */
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "en-en-samples");
const PORT = Number(process.env.EN_EN_PREVIEW_PORT || 5199);
const openBrowser = process.argv.includes("--open");

function listPins() {
  if (!existsSync(OUT)) return [];
  return readdirSync(OUT)
    .filter((f) => f.endsWith(".png") && !f.includes("_art"))
    .map((f) => {
      const id = f.replace(/\.png$/, "");
      const metaPath = join(OUT, `${id}.json`);
      let meta = {};
      if (existsSync(metaPath)) {
        try {
          meta = JSON.parse(readFileSync(metaPath, "utf8"));
        } catch {
          /* ignore */
        }
      }
      return {
        id,
        format: meta.format || "",
        title: meta.titleEn || id,
        png: `/${id}.png`,
        art: existsSync(join(OUT, `${id}_art.png`)) ? `/${id}_art.png` : null,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

const MIME = {
  ".png": "image/png",
  ".json": "application/json",
  ".html": "text/html; charset=utf-8",
};

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const pins = listPins();
    const cards = pins
      .map(
        (p) => `<figure>
  <a href="${p.png}" target="_blank"><img src="${p.png}" alt="${p.title}"/></a>
  <figcaption><strong>${p.title}</strong><br/><code>${p.id}</code> · ${p.format}
  ${p.art ? ` · <a href="${p.art}">art</a>` : ""}</figcaption>
</figure>`,
      )
      .join("\n");
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>EN→EN samples</title>
<style>
body{font-family:system-ui,sans-serif;margin:1.5rem;background:#0f172a;color:#e2e8f0}
h1{font-size:1.25rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
figure{margin:0;background:#1e293b;border-radius:12px;overflow:hidden}
img{width:100%;display:block;aspect-ratio:2/3;object-fit:cover}
figcaption{padding:.65rem .75rem;font-size:.82rem;line-height:1.4}
a{color:#93c5fd}
code{font-size:.75rem;opacity:.85}
</style></head>
<body>
<h1>EigoSound EN→EN · ${pins.length} pins</h1>
<p>Dir: <code>.tmp/en-en-samples</code></p>
<div class="grid">${cards || "<p>No pins yet. Run <code>yarn sound:gen</code></p>"}</div>
</body></html>`;
    res.writeHead(200, { "Content-Type": MIME[".html"] });
    res.end(html);
    return;
  }

  const file = join(OUT, decodeURIComponent(url.pathname.replace(/^\//, "")));
  if (!file.startsWith(OUT) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const ext = extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  res.end(readFileSync(file));
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${PORT}/`;
  console.log(`EN→EN preview → ${url}`);
  if (openBrowser) exec(`open "${url}"`);
});
