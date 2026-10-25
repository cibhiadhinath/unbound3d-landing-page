"""Generate 1200x630 Open Graph images per page into public/og/.  Run: python3 scripts/og-images.py"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = Path('public/og'); OUT.mkdir(parents=True, exist_ok=True)
W, H = 1200, 630
BLUE = (10, 132, 255)
DISPLAY = 'public/fonts/space-grotesk-latin-var.woff2'
BODY = 'public/fonts/inter-latin-var.woff2'

def font(path, size, weight):
    f = ImageFont.truetype(path, size)
    f.set_variation_by_name(weight)
    return f

logo = Image.open('images/logo.png').convert('RGBA')
mark = logo.crop(logo.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())
mark.thumbnail((56, 56), Image.LANCZOS)

PAGES = {
    'home': ('Manufacturing made right.', 'Engineering-led manufacturing of high-performance parts for drones, defence, robotics and EV.', None),
    'manufacturing': ('3D printing, CNC & composites', 'PA-CF, PPS-CF and ASA. Engineer-reviewed quotes in 6 business hours.', None),
    'lynx350': ('Lynx 350', '450\u00a0°C nozzle · 80\u00a0°C chamber · 650\u00a0mm/s · 350\u00a0×\u00a0350\u00a0×\u00a0350\u00a0mm', 'images/lynx-350.png'),
    'about': ('About Unbound3D', 'ISO 9001:2015 certified · GeM-registered defence supplier · Bengaluru', None),
    'contact': ('Talk to an engineer', 'WhatsApp +91 75581 50570 · We reply within 1 business day.', None),
    'careers': ('Build hardware with us.', 'Careers at Unbound3D, Bengaluru.', None),
    'procure': ('Procurement for engineering teams', 'One accountable partner for sourcing, quality and delivery.', None),
}

def wrap(draw, text, f, width):
    words, lines, line = text.split(' '), [], ''  # split on plain spaces only, keep NBSP groups
    for w in words:
        test = f'{line} {w}'.strip()
        if draw.textlength(test, font=f) <= width: line = test
        else: lines.append(line); line = w
    return lines + [line]

for slug, (title, sub, product) in PAGES.items():
    im = Image.new('RGB', (W, H), (0, 0, 0))
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    ImageDraw.Draw(glow).ellipse((W * 0.45, -H * 0.2, W * 1.3, H * 1.1), fill=(6, 40, 80))
    im = Image.blend(im, glow.filter(ImageFilter.GaussianBlur(120)), 1.0)
    d = ImageDraw.Draw(im)
    text_w = 640 if product else 1000
    if product:
        p = Image.open(product).convert('RGBA'); p.thumbnail((440, 520), Image.LANCZOS)
        im.paste(p, (W - p.width - 80, (H - p.height) // 2 + 10), p)
    im.paste(mark, (80, 70), mark)
    d.text((80 + mark.width + 16, 70 + mark.height // 2), 'Unbound3D', font=font(DISPLAY, 34, 'Bold'), fill='white', anchor='lm')
    tf = font(DISPLAY, 76, 'Bold')
    y = 230
    for line in wrap(d, title, tf, text_w):
        d.text((80, y), line, font=tf, fill='white'); y += 86
    d.rectangle((80, y + 18, 200, y + 21), fill=BLUE)
    sf = font(BODY, 30, 'Regular')
    y += 50
    for line in wrap(d, sub, sf, text_w):
        d.text((80, y), line, font=sf, fill=(161, 161, 166)); y += 42
    d.text((80, H - 60), 'unbound3d.com', font=font(BODY, 24, 'Regular'), fill=(161, 161, 166), anchor='ls')
    im.save(OUT / f'{slug}.png', optimize=True)
    print(slug)
