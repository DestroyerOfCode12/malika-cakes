"""Home-screen / PWA icons from the logo mark (pink ring + charcoal M), on cream.

    py scripts/landing-assets/make_icons.py
"""
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "public", "icons"))
FONT = os.path.join(HERE, "fonts", "Poppins-SemiBold.ttf")


def icon(size: int, maskable: bool) -> Image.Image:
    s = size * 4  # supersample
    img = Image.new("RGB", (s, s), (255, 248, 250))
    d = ImageDraw.Draw(img)
    # maskable icons must keep the mark inside the central 80% safe zone
    r = s * (0.30 if maskable else 0.38)
    ring = s * (0.055 if maskable else 0.07)
    c = s / 2
    d.ellipse([c - r, c - r, c + r, c + r], fill=(255, 255, 255), outline=(247, 200, 211), width=int(ring))
    f = ImageFont.truetype(FONT, int(r * 1.15))
    bb = d.textbbox((0, 0), "M", font=f)
    d.text((c - (bb[2] - bb[0]) / 2 - bb[0], c - (bb[3] - bb[1]) / 2 - bb[1] + r * 0.04), "M", font=f, fill=(63, 63, 70))
    return img.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    icon(192, False).save(os.path.join(OUT, "icon-192.png"), optimize=True)
    icon(512, False).save(os.path.join(OUT, "icon-512.png"), optimize=True)
    icon(512, True).save(os.path.join(OUT, "icon-maskable-512.png"), optimize=True)
    print("icons ->", OUT)
