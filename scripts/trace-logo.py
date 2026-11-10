"""Trace the Unbound3D logo (raster) into SVG: swoosh mark, "UNBOUND 3D" wordmark, "INDUSTRIES".

Pure Python + numpy + Pillow: upsample, extract iso-contours with marching squares (sub-pixel
interpolation), simplify with Ramer-Douglas-Peucker, write even-odd filled paths.

Usage: python3 scripts/trace-logo.py <logo-with-lettering.png> <hi-res-mark.jpg>
Writes public/brand/{mark,wordmark,industries}.svg
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

OUT = Path('public/brand')


def ink(img):
    """Grayscale ink coverage 0..1 (1 = black ink) from a dark-on-light image."""
    g = ImageOps.grayscale(img.convert('RGB'))
    return 1.0 - np.asarray(g, dtype=np.float64) / 255.0


def contours(field, level=0.5):
    """Marching squares: closed polylines (lists of (x, y)) where field == level."""
    h, w = field.shape
    f = np.pad(field, 1, constant_values=0.0)  # ensure every contour closes
    segs = {}

    def interp(p, q, a, b):
        t = (level - a) / (b - a) if b != a else 0.5
        return (p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1]))

    links = []
    for y in range(h + 1):
        row0, row1 = f[y], f[y + 1]
        for x in range(w + 1):
            tl, tr, br, bl = row0[x], row0[x + 1], row1[x + 1], row1[x]
            idx = (tl > level) << 3 | (tr > level) << 2 | (br > level) << 1 | (bl > level)
            if idx in (0, 15):
                continue
            T = interp((x, y), (x + 1, y), tl, tr)
            R = interp((x + 1, y), (x + 1, y + 1), tr, br)
            B = interp((x, y + 1), (x + 1, y + 1), bl, br)
            L = interp((x, y), (x, y + 1), tl, bl)
            # edge keys identify shared crossing points between neighbouring cells
            kT, kR, kB, kL = ('h', x, y), ('v', x + 1, y), ('h', x, y + 1), ('v', x, y)
            pts = {kT: T, kR: R, kB: B, kL: L}
            table = {
                1: [(kL, kB)], 2: [(kB, kR)], 3: [(kL, kR)], 4: [(kT, kR)],
                5: [(kL, kT), (kB, kR)], 6: [(kT, kB)], 7: [(kL, kT)], 8: [(kT, kL)],
                9: [(kT, kB)], 10: [(kT, kR), (kL, kB)], 11: [(kT, kR)], 12: [(kL, kR)],
                13: [(kB, kR)], 14: [(kL, kB)],
            }
            for a, b in table[idx]:
                links.append((a, b))
                segs.setdefault(a, pts[a])
                segs.setdefault(b, pts[b])

    adj = {}
    for a, b in links:
        adj.setdefault(a, []).append(b)
        adj.setdefault(b, []).append(a)

    seen = set()
    polys = []
    for start in adj:
        if start in seen:
            continue
        chain = [start]
        seen.add(start)
        prev, cur = None, start
        while True:
            nxt = [n for n in adj[cur] if n != prev and n not in seen]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
            seen.add(cur)
            chain.append(cur)
        if len(chain) > 8:
            # undo the 1px padding offset
            polys.append([(segs[k][0] - 1, segs[k][1] - 1) for k in chain])
    return polys


def rdp(points, eps):
    """Ramer-Douglas-Peucker simplification."""
    if len(points) < 3:
        return points
    pts = np.asarray(points)
    start, end = pts[0], pts[-1]
    d = end - start
    n = np.hypot(*d) or 1.0
    dist = np.abs(d[0] * (pts[:, 1] - start[1]) - d[1] * (pts[:, 0] - start[0])) / n
    i = int(np.argmax(dist))
    if dist[i] > eps:
        left = rdp(points[: i + 1], eps)
        right = rdp(points[i:], eps)
        return left[:-1] + right
    return [points[0], points[-1]]


def trace(img, scale, eps, min_area):
    """Upsample, trace and return (svg path data, width, height) in source-pixel units."""
    big = img.resize((img.width * scale, img.height * scale), Image.BICUBIC)
    field = ink(big)
    paths = []
    xs, ys = [], []
    for poly in contours(field):
        # close and simplify (split at the midpoint so RDP keeps a closed loop)
        mid = len(poly) // 2
        simple = rdp(poly[: mid + 1], eps)[:-1] + rdp(poly[mid:] + [poly[0]], eps)[:-1]
        arr = np.asarray(simple) / scale
        area = 0.5 * abs(np.dot(arr[:, 0], np.roll(arr[:, 1], 1)) - np.dot(arr[:, 1], np.roll(arr[:, 0], 1)))
        if area < min_area:
            continue
        xs += list(arr[:, 0]); ys += list(arr[:, 1])
        paths.append(arr)
    x0, y0 = min(xs), min(ys)
    d = ''.join('M' + 'L'.join(f'{x - x0:.2f} {y - y0:.2f}' for x, y in p) + 'Z' for p in paths)
    return d, max(xs) - x0, max(ys) - y0


def write(name, d, w, h, title):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" role="img" aria-label="{title}">'
           f'<path fill="currentColor" fill-rule="evenodd" d="{d}"/></svg>\n')
    (OUT / f'{name}.svg').write_text(svg)
    print(f'{name}.svg  {w:.1f}×{h:.1f}  {len(svg) / 1024:.1f} KB')


def ink_bbox(img, thresh=0.5):
    a = ink(img) > thresh
    rows, cols = np.where(a)
    return cols.min(), rows.min(), cols.max() + 1, rows.max() + 1


if __name__ == '__main__':
    lockup = Image.open(sys.argv[1]).convert('RGB')
    mark_src = Image.open(sys.argv[2]).convert('RGB')

    # Lettering sits below the swoosh in the 500×500 lockup: split by the blank band between lines
    a = ink(lockup) > 0.35
    row_ink = a.sum(axis=1)
    rows = [y for y in range(lockup.height) if row_ink[y] > 0]
    bands, start = [], rows[0]
    for y0, y1 in zip(rows, rows[1:]):
        if y1 != y0 + 1:
            bands.append((start, y0 + 1)); start = y1
    bands.append((start, rows[-1] + 1))
    word_band, ind_band = bands[-2], bands[-1]  # last two bands: UNBOUND 3D, INDUSTRIES

    pad = 3
    for name, (top, bot), title in [('wordmark', word_band, 'Unbound 3D'), ('industries', ind_band, 'Industries')]:
        band = lockup.crop((0, top - pad, lockup.width, bot + pad))
        x0, _, x1, _ = ink_bbox(band, 0.35)
        crop = band.crop((max(0, x0 - pad), 0, min(band.width, x1 + pad), band.height))
        d, w, h = trace(crop, scale=12, eps=1.0, min_area=0.6)
        write(name, d, w, h, title)

    # Swoosh from the high-resolution artwork (downsampled; it is large and the curve is simple)
    m = mark_src.copy()
    m.thumbnail((900, 900), Image.LANCZOS)
    x0, y0, x1, y1 = ink_bbox(m, 0.5)
    m = m.crop((x0 - 4, y0 - 4, x1 + 4, y1 + 4))
    d, w, h = trace(m, scale=2, eps=0.6, min_area=50)
    write('mark', d, w, h, 'Unbound3D')
