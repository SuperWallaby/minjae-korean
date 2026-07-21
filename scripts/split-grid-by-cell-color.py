#!/usr/bin/env python3
"""Split a 3x3 vocab grid PNG into 9 cells by each cell's pastel fill color."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def split_grid(src: Path, out: Path) -> list[Path]:
    out.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGB")
    arr = np.asarray(im).astype(np.float32)
    h, w, _ = arr.shape

    page_bg = arr[10, 10]
    rgb = arr / 255.0
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    diff = mx - mn
    v = mx
    s = np.where(mx > 1e-5, diff / (mx + 1e-5), 0.0)

    dist_page = np.linalg.norm(arr - page_bg, axis=2)
    is_page = (dist_page < 22) | ((s < 0.06) & (v > 0.88))

    ignore = np.zeros((h, w), dtype=bool)
    ignore[:120, :] = True
    ignore[930:, :] = True

    # Pastel fills of the 9 cards
    pastel = (~is_page) & (~ignore) & (s >= 0.07) & (s <= 0.65) & (v >= 0.72)
    mask_img = Image.fromarray((pastel * 255).astype(np.uint8))
    mask_img = mask_img.filter(ImageFilter.MaxFilter(11))
    mask_img = mask_img.filter(ImageFilter.MinFilter(9))
    mask_img = mask_img.filter(ImageFilter.MaxFilter(5))
    m = (np.asarray(mask_img) > 128) & (~ignore)

    visited = np.zeros((h, w), dtype=bool)
    comps: list[dict] = []
    yy, xx = np.where(m)
    for y, x in zip(yy.tolist(), xx.tolist()):
        if visited[y, x]:
            continue
        stack = [(y, x)]
        visited[y, x] = True
        minx = maxx = x
        miny = maxy = y
        count = 0
        color_sum = np.zeros(3, dtype=np.float64)
        while stack:
            cy, cx = stack.pop()
            count += 1
            color_sum += arr[cy, cx]
            for ny, nx in (
                (cy - 1, cx),
                (cy + 1, cx),
                (cy, cx - 1),
                (cy, cx + 1),
            ):
                if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    stack.append((ny, nx))
                    minx = min(minx, nx)
                    maxx = max(maxx, nx)
                    miny = min(miny, ny)
                    maxy = max(maxy, ny)
        bw = maxx - minx + 1
        bh = maxy - miny + 1
        if count < 14000:
            continue
        if not (170 <= bw <= 380 and 170 <= bh <= 380):
            continue
        mean_color = color_sum / count
        comps.append(
            {
                "box": (minx, miny, maxx + 1, maxy + 1),
                "count": count,
                "bw": bw,
                "bh": bh,
                "cx": (minx + maxx) / 2,
                "cy": (miny + maxy) / 2,
                "color": mean_color,
            }
        )

    if len(comps) < 9:
        raise SystemExit(f"expected ~9 cells, found {len(comps)}")

    # Prefer 9 largest blobs, reading order
    comps = sorted(comps, key=lambda c: c["count"], reverse=True)[:9]
    comps = sorted(comps, key=lambda c: (int(c["cy"] // 70), c["cx"]))

    # Tighten each box using that cell's own mean pastel color
    tight_boxes: list[tuple[int, int, int, int]] = []
    for c in comps:
        mean = c["color"]
        # distance to this cell's fill
        d = np.linalg.norm(arr - mean, axis=2)
        # local search window around detected blob
        x0, y0, x1, y1 = c["box"]
        pad = 28
        x0p, y0p = max(0, x0 - pad), max(0, y0 - pad)
        x1p, y1p = min(w, x1 + pad), min(h, y1 + pad)
        local = d[y0p:y1p, x0p:x1p]
        # pixels close to this pastel (not text — text is darker; keep bright-ish)
        local_v = v[y0p:y1p, x0p:x1p]
        hit = (local < 38) & (local_v > 0.68)
        # morphology
        hit_img = Image.fromarray((hit * 255).astype(np.uint8))
        hit_img = hit_img.filter(ImageFilter.MaxFilter(7))
        hit_img = hit_img.filter(ImageFilter.MinFilter(5))
        hit = np.asarray(hit_img) > 128
        ys, xs = np.where(hit)
        if len(xs) < 500:
            tight_boxes.append(c["box"])
            continue
        tx0 = int(xs.min()) + x0p
        ty0 = int(ys.min()) + y0p
        tx1 = int(xs.max()) + x0p + 1
        ty1 = int(ys.max()) + y0p + 1
        # small pad so rounded corners aren't clipped
        pad2 = 4
        tx0 = max(0, tx0 - pad2)
        ty0 = max(0, ty0 - pad2)
        tx1 = min(w, tx1 + pad2)
        ty1 = min(h, ty1 + pad2)
        tight_boxes.append((tx0, ty0, tx1, ty1))

    preview = im.copy()
    draw = ImageDraw.Draw(preview)
    colors = [
        "#e74c3c",
        "#3498db",
        "#2ecc71",
        "#9b59b6",
        "#f39c12",
        "#1abc9c",
        "#e67e22",
        "#34495e",
        "#c0392b",
    ]
    paths: list[Path] = []
    for i, box in enumerate(tight_boxes, 1):
        x0, y0, x1, y1 = box
        cell = im.crop(box)
        # pad to square using that cell's own corner/mean pastel color
        cw, ch = cell.size
        side = max(cw, ch)
        # sample fill from cell center-ish background
        ca = np.asarray(cell).astype(np.float32)
        fill = tuple(int(round(v)) for v in ca[ch // 8, cw // 8])
        square = Image.new("RGB", (side, side), fill)
        square.paste(cell, ((side - cw) // 2, (side - ch) // 2))
        square = square.resize((1080, 1080), Image.Resampling.LANCZOS)
        path = out / f"cell-{i:02d}.png"
        square.save(path, optimize=True)
        paths.append(path)
        draw.rectangle([x0, y0, x1 - 1, y1 - 1], outline=colors[i - 1], width=3)
        draw.text((x0 + 6, y0 + 6), f"{i} {cw}x{ch}", fill=colors[i - 1])
        print(f"cell-{i:02d}: {cw}x{ch} box={box} color={np.round(comps[i-1]['color']).astype(int).tolist()}")

    preview.save(out / "_preview-boxes.png")
    Image.fromarray((m * 255).astype(np.uint8)).save(out / "_mask.png")

    sheet = Image.new("RGB", (20 + 1080 * 3, 20 + 1080 * 3), (255, 255, 255))
    for i, p in enumerate(paths):
        row, col = divmod(i, 3)
        sheet.paste(Image.open(p), (20 + col * 1080, 20 + row * 1080))
    sheet.save(out / "_sheet-9.png")
    return paths


def main() -> None:
    src = Path(
        sys.argv[1]
        if len(sys.argv) > 1
        else "/Users/minjaekim/Desktop/korean-teacher-mj/.tmp/vocab-infographic-gen/grid-fruits-tropical.png"
    )
    out = Path(
        sys.argv[2]
        if len(sys.argv) > 2
        else src.parent / "grid-split-demo" / f"{src.stem}-bycolor"
    )
    paths = split_grid(src, out)
    print("saved", out)
    try:
        import subprocess

        subprocess.run(["open", str(out)], check=False)
        subprocess.run(["open", str(out / "_preview-boxes.png")], check=False)
        subprocess.run(["open", str(out / "_sheet-9.png")], check=False)
        subprocess.run(["open", str(paths[0])], check=False)
        subprocess.run(["open", str(paths[4])], check=False)
    except Exception:
        pass


if __name__ == "__main__":
    main()
