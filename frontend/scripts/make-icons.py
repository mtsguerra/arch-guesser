"""Renders the app icons (public/icon-*.png, apple-touch-icon.png) from the logo's geometry (public/favicon.svg).
Run: python3 scripts/make-icons.py   (needs Pillow). The SVG is the source; keep the shapes below in step with it."""
from pathlib import Path
from PIL import Image, ImageDraw

OXBLOOD = (111, 29, 27, 255)
CREAM = (255, 230, 167, 255)
SS = 8  # supersampling, for smooth edges


def logo(size, glyph=1.0, rounded=True):
    """The mark on a size x size square. `glyph` < 1 shrinks it into a safe zone (maskable icons)."""
    px = size * SS
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle((0, 0, px - 1, px - 1), radius=px * 6 / 32, fill=OXBLOOD)
    else:
        d.rectangle((0, 0, px, px), fill=OXBLOOD)

    unit = px / 32 * glyph
    offset = px * (1 - glyph) / 2

    def at(x, y):
        return (offset + x * unit, offset + y * unit)

    def line(a, b, width):
        # square caps: run the line half a width past both ends
        w = width * unit
        (x1, y1), (x2, y2) = at(*a), at(*b)
        dx, dy = (x2 - x1), (y2 - y1)
        length = (dx * dx + dy * dy) ** 0.5
        ex, ey = dx / length * w / 2, dy / length * w / 2
        d.line((x1 - ex, y1 - ey, x2 + ex, y2 + ey), fill=CREAM, width=round(w))

    for a, b in [((7, 7), (25, 7)), ((25, 7), (25, 25)), ((25, 25), (7, 25)), ((7, 25), (7, 7))]:
        line(a, b, 2.2)
    line((7, 16), (14, 16), 2.2)
    line((18, 7), (18, 13), 2.2)
    cx, cy = at(14, 22)
    r = 6 * unit
    d.arc((cx - r, cy - r, cx + r, cy + r), 270, 360, fill=CREAM, width=round(1.6 * unit))
    return img.resize((size, size), Image.LANCZOS)


out = Path(__file__).resolve().parent.parent / "public"
logo(192).save(out / "icon-192.png")
logo(512).save(out / "icon-512.png")
logo(512, glyph=0.74, rounded=False).save(out / "icon-maskable-512.png")  # full bleed; the mask may cut the corners
logo(180, rounded=False).save(out / "apple-touch-icon.png")  # iOS rounds the corners itself
print("icons written to", out)
