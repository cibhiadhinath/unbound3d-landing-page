"""Generate responsive AVIF/WebP (+ JPEG/PNG fallback) images from images/ into public/img/.

Widths: 480, 960, 1600, capped at the source width (the source width is always included).
Run after adding or replacing a source image:  python3 scripts/build-images.py
"""
from pathlib import Path
from PIL import Image

SRC = Path('images')
OUT = Path('public/img')
WIDTHS = (480, 960, 1600)
# Source images used on the site (logo/team composite are inputs for other assets)
SOURCES = ['lynx-350.png', 'twin-dry.png', 'lynx-320.png']

OUT.mkdir(parents=True, exist_ok=True)
for name in SOURCES:
    im = Image.open(SRC / name)
    alpha = im.mode in ('RGBA', 'LA') and im.getchannel('A').getextrema()[0] < 255
    im = im.convert('RGBA' if alpha else 'RGB')
    stem = Path(name).stem
    widths = sorted({w for w in WIDTHS if w < im.width} | {im.width})
    for w in widths:
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS) if w != im.width else im
        r.save(OUT / f'{stem}-{w}.avif', quality=55)
        r.save(OUT / f'{stem}-{w}.webp', quality=78, method=6)
        if alpha:
            r.save(OUT / f'{stem}-{w}.png', optimize=True)
        else:
            r.save(OUT / f'{stem}-{w}.jpg', quality=80, optimize=True, progressive=True)
    print(f'{name}: {im.width}x{im.height} -> {widths} ({"png" if alpha else "jpg"} fallback)')


# ---------------------------------------------------------------------------
# Homepage part tiles: consistent framing for photos shot on different backgrounds.
# Each part is centred in a square (or 2:1 for the wide tile) with ~12% margin; where
# the photo doesn't cover the tile, its own background colour is extended and the
# photo edges are feathered so there is no visible seam.
from PIL import ImageFilter, ImageChops, ImageStat, ImageDraw

TILES = {'work-1.jpg': 1.0, 'work-2.png': 1.0, 'work-3.png': 1.0, 'work-4.png': 1.0, 'work-5.png': 2.0}
TILE_WIDTHS = (480, 800)


def trim_white(im, thresh=252):
    """Drop fully white borders (e.g. a photo pasted on a white canvas)."""
    g = im.convert('L').point(lambda v: 255 if v < thresh else 0)
    box = g.getbbox()
    return im.crop(box) if box else im


def border_colour(im, strip=12):
    w, h = im.size
    parts = [im.crop((0, 0, w, strip)), im.crop((0, h - strip, w, h)), im.crop((0, 0, strip, h)), im.crop((w - strip, 0, w, h))]
    stats = [ImageStat.Stat(p).median for p in parts]
    return tuple(int(sorted(s[c] for s in stats)[1]) for c in range(3))


def part_bbox(im, bg):
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bg)).convert('L').filter(ImageFilter.MedianFilter(5))
    return diff.point(lambda v: 255 if v > 38 else 0).getbbox() or (0, 0, *im.size)


def feather_mask(size, radius, sides):
    """Alpha mask that fades only the given sides ('l','t','r','b') of an image."""
    w, h = size
    m = Image.new('L', size, 255)
    d = ImageDraw.Draw(m)
    for i in range(radius):
        a = int(255 * i / radius)
        if 'l' in sides: d.line((i, 0, i, h), fill=a)
        if 'r' in sides: d.line((w - 1 - i, 0, w - 1 - i, h), fill=a)
    if 't' in sides or 'b' in sides:
        v = Image.new('L', size, 255)
        dv = ImageDraw.Draw(v)
        for i in range(radius):
            a = int(255 * i / radius)
            if 't' in sides: dv.line((0, i, w, i), fill=a)
            if 'b' in sides: dv.line((0, h - 1 - i, w, h - 1 - i), fill=a)
        m = ImageChops.multiply(m, v)
    return m


for name, ratio in TILES.items():
    im = trim_white(Image.open(SRC / name).convert('RGB'))
    bg = border_colour(im)
    x0, y0, x1, y1 = part_bbox(im, bg)
    bw, bh = x1 - x0, y1 - y0
    if ratio == 1.0:
        # Square around the part with margin, but never larger than the photo's long side
        side = min(int(max(bw, bh) * 1.2), max(im.size))
        tw = th = max(side, min(im.size))
    else:  # wide tile: full width, crop to 2:1
        tw, th = im.width, int(im.width / ratio)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    # Offset so the part is centred, clamped so the photo covers the tile wherever it can
    def place(tile, img, centre):
        off = tile // 2 - centre
        return max(tile - img, min(0, off)) if img >= tile else (tile - img) // 2
    ox, oy = place(tw, im.width, cx), place(th, im.height, cy)
    sides = ''.join(k for k, inside in (('l', ox > 0), ('t', oy > 0), ('r', ox + im.width < tw), ('b', oy + im.height < th)) if inside)
    canvas = Image.new('RGB', (tw, th), bg)
    canvas.paste(im, (ox, oy), feather_mask(im.size, 32, sides) if sides else None)
    stem = Path(name).stem
    for w in TILE_WIDTHS:
        r = canvas.resize((w, round(w * th / tw)), Image.LANCZOS)
        r.save(OUT / f'{stem}-tile-{w}.avif', quality=55)
        r.save(OUT / f'{stem}-tile-{w}.webp', quality=78, method=6)
        r.save(OUT / f'{stem}-tile-{w}.jpg', quality=80, optimize=True, progressive=True)
    print(f'tile {name}: {tw}x{th} bg={bg}')


# ---------------------------------------------------------------------------
# Hero: transparent cutout of a real printed part (cellular block), used by the
# layer-by-layer print animation on the homepage.
def cutout(name, thresh=34):
    im = trim_white(Image.open(SRC / name).convert('RGB'))
    bg = border_colour(im, strip=10)
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bg)).convert('L')
    mask = diff.point(lambda v: 255 if v > thresh else 0).filter(ImageFilter.MedianFilter(7))
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.copy()
    out.putalpha(mask)
    return out.crop(mask.getbbox())


hero = cutout('work-2.png')
for w in (240, hero.width):  # source is ~332px wide; never upscale
    r = hero.resize((w, round(w * hero.height / hero.width)), Image.LANCZOS)
    r.save(OUT / f'hero-part-{w}.avif', quality=60)
    r.save(OUT / f'hero-part-{w}.webp', quality=82, method=6)
    r.save(OUT / f'hero-part-{w}.png', optimize=True)
print(f'hero cutout: {hero.size}')
