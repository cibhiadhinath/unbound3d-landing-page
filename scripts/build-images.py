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

