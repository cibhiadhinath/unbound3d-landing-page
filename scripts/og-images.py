"""Generate 1200x630 Open Graph images per page into public/og/.  Run: python3 scripts/og-images.py

Light, matching the site. The logo is the official artwork (mark + UNBOUND 3D lettering),
cut out of images/logo-hires.jpg and images/logo-lockup.png, never re-typeset.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

OUT = Path('public/og'); OUT.mkdir(parents=True, exist_ok=True)
W, H = 1200, 630
TEXT = (29, 29, 31)
MUTED = (110, 110, 115)
BLUE = (0, 113, 227)
INTER = 'public/fonts/inter-latin-var.woff2'


def font(size, weight):
    f = ImageFont.truetype(INTER, size)
    f.set_variation_by_axes([weight])
    return f


def ink_cutout(img, colour, box=None):
    """Dark-on-light artwork -> RGBA in `colour`, alpha = ink coverage, cropped to the ink."""
    g = ImageOps.grayscale(img.convert('RGB'))
    if box:
        g = g.crop(box)
    alpha = ImageOps.invert(g).point(lambda v: 0 if v < 20 else min(255, int(v * 1.08)))
    out = Image.new('RGBA', g.size, colour + (0,))
    out.putalpha(alpha)
    return out.crop(alpha.getbbox())


# Mark from the high-resolution artwork; wordmark = second-to-last ink band of the lockup
mark = ink_cutout(Image.open('images/logo-hires.jpg'), TEXT)
mark.thumbnail((64, 64), Image.LANCZOS)

lockup = Image.open('images/logo-lockup.png')
rows = np.where((np.asarray(ImageOps.grayscale(lockup.convert('RGB'))) < 160).any(axis=1))[0]
bands, start = [], rows[0]
for a, b in zip(rows, rows[1:]):
    if b != a + 1:
        bands.append((start, a + 1)); start = b
bands.append((start, rows[-1] + 1))
top, bot = bands[-2]
word = ink_cutout(lockup, TEXT, (0, top - 2, lockup.width, bot + 2))
word = word.resize((300, round(300 * word.height / word.width)), Image.LANCZOS)

PAGES = {
    'home': ('Manufacturing made right.', 'Engineering-led manufacturing of high-performance parts for drones, defence, robotics and EV.', None),
    'manufacturing': ('3D printing, CNC & composites', 'PA-CF, PPS-CF and ASA. Engineer-reviewed quotes in 6 business hours.', None),
    'lynx350': ('Lynx 350', '450 °C nozzle · 80 °C chamber · 650 mm/s · 350 × 350 × 350 mm', 'images/lynx-350.png'),
    'about': ('A team built around the problem.', 'ISO 9001:2015 certified · GeM-registered defence supplier · Bengaluru', None),
    'contact': ('Talk to an engineer.', 'WhatsApp +91 75581 50570 · We reply within 1 business day.', None),
    'careers': ('Build hardware with us.', 'Careers at Unbound3D, Bengaluru.', None),
    'procure': ('Procurement for engineering teams.', 'One accountable partner for sourcing, quality and delivery.', None),
}


def wrap(draw, text, f, width):
    text = text.replace(' · ', '\u00a0· ')  # never start a line with a separator dot
    words, lines, line = text.split(' '), [], ''  # split on plain spaces only, keep NBSP groups
    for w in words:
        test = f'{line} {w}'.strip()
        if draw.textlength(test, font=f) <= width:
            line = test
        else:
            lines.append(line); line = w
    return lines + [line]


for slug, (title, sub, product) in PAGES.items():
    im = Image.new('RGB', (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    text_w = 620 if product else 1000
    if product:
        stage = Image.new('RGB', (440, H), (245, 245, 247))
        im.paste(stage, (W - 440, 0))
        p = Image.open(product).convert('RGBA'); p.thumbnail((360, 480), Image.LANCZOS)
        im.paste(p, (W - 440 + (440 - p.width) // 2, (H - p.height) // 2), p)
    im.paste(mark, (80, 72), mark)
    im.paste(word, (80 + mark.width + 18, 72 + (mark.height - word.height) // 2), word)
    tf = font(76, 700)
    y = 220
    for line in wrap(d, title, tf, text_w):
        d.text((80, y), line, font=tf, fill=TEXT); y += 86
    d.rectangle((80, y + 18, 176, y + 21), fill=BLUE)
    sf = font(30, 400)
    y += 50
    for line in wrap(d, sub, sf, text_w):
        d.text((80, y), line, font=sf, fill=MUTED); y += 42
    d.text((80, H - 60), 'unbound3d.com', font=font(24, 400), fill=MUTED, anchor='ls')
    im.save(OUT / f'{slug}.png', optimize=True)
    print(slug)
