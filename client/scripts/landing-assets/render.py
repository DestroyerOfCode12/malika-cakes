"""
Render every landing-page visual for Malika's Cake Boutique.

    py scripts/landing-assets/render.py            # everything
    py scripts/landing-assets/render.py cake       # hero turntable only
    py scripts/landing-assets/render.py assets     # secondary + decor only
    py scripts/landing-assets/render.py preview    # one hero frame, quick look

Outputs go to client/public/assets/landing/ as transparent WebP.
All assets share one camera language, one light rig and one palette, so they
composite together as a single art-directed scene.
"""
from __future__ import annotations

import math
import os
import random
import sys
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from engine import (
    Camera,
    Cylinder,
    Ellipsoid,
    Frustum,
    Sphere,
    Wedge,
    flat_material,
    hexcol,
    normalize,
    render,
    rot_x,
    rot_y,
    rot_z,
    save_webp,
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "public", "assets", "landing"))
FONT_SCRIPT = os.path.join(HERE, "fonts", "KaushanScript-Regular.ttf")
FONT_SANS = os.path.join(HERE, "fonts", "Poppins-SemiBold.ttf")

# ---------------------------------------------------------------- palette (brand)
ROSE = hexcol("#DB2777")  # logo rose pink — the lettering
DRIP = hexcol("#E4568E")  # glossy pink ganache, a touch lighter than ROSE
BLUSH = hexcol("#F7C8D3")  # logo pastel ring
BLUSH_LIGHT = hexcol("#FBE1E8")
CREAM = hexcol("#FFF8F3")  # vanilla buttercream
PORCELAIN = hexcol("#FBFAFA")
GOLD = hexcol("#D9A84E")
RASP = hexcol("#C8234F")
STRAW = hexcol("#D8263A")
LEAF = hexcol("#4F8A3C")
SPONGE = hexcol("#F2D29A")
GANACHE = hexcol("#5B3428")
PISTACHIO = hexcol("#BBD49C")
MAC_PINK = hexcol("#F3A2BC")
MAC_CREAM = hexcol("#F5E6D0")


def hash3(p: np.ndarray, seed: float = 0.0) -> np.ndarray:
    """Deterministic pseudo-random [0,1) per 3D point (for crumb, seeds, grain)."""
    v = np.sin(p @ np.array([127.1, 311.7, 74.7], np.float32) + seed) * 43758.5453
    return v - np.floor(v)


def vnoise(p: np.ndarray, freq: float, seed: float = 0.0) -> np.ndarray:
    """Cheap smooth-ish noise: sum of rotated sines. Good enough for subtle grain."""
    q = p * freq
    return (
        np.sin(q[:, 0] * 1.7 + q[:, 1] * 2.3 + seed)
        + np.sin(q[:, 1] * 2.9 - q[:, 2] * 1.3 + seed * 1.7)
        + np.sin(q[:, 2] * 2.1 + q[:, 0] * 3.1 - seed * 0.7)
    ) / 3.0


# ================================================================ cake textures
BOTTOM_R, BOTTOM_H = 1.0, 0.92
TOP_R, TOP_H = 0.68, 0.74
STAND_TOP = 0.62


def _strip_size(radius, height, width=4096):
    return width, int(width * height / (2 * math.pi * radius))


def build_bottom_strip():
    """Lettering + piped garland that wraps the bottom tier.
    u=0.5 is the cake's front at rotation 0, so 'Malika's' faces the camera first
    and 'CAKE BOUTIQUE' comes round on the back half of the turn."""
    TW, TH = _strip_size(BOTTOM_R, BOTTOM_H)
    mask = Image.new("L", (TW, TH), 0)
    d = ImageDraw.Draw(mask)

    # front: Malika's in the logo's brush script
    f = ImageFont.truetype(FONT_SCRIPT, int(TH * 0.56))
    text = "Malika's"
    bb = d.textbbox((0, 0), text, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text((TW / 2 - tw / 2 - bb[0], TH * 0.50 - th / 2 - bb[1]), text, font=f, fill=255)

    # back: CAKE BOUTIQUE, tracked out like the logo
    back = Image.new("L", (TW, TH), 0)
    db = ImageDraw.Draw(back)
    fs = ImageFont.truetype(FONT_SANS, int(TH * 0.15))
    word = "CAKE  BOUTIQUE"
    spacing = TH * 0.07
    widths = [db.textbbox((0, 0), ch, font=fs)[2] for ch in word]
    total = sum(widths) + spacing * (len(word) - 1)
    x = TW / 2 - total / 2
    for ch, w in zip(word, widths):
        db.text((x, TH * 0.44), ch, font=fs, fill=255)
        x += w + spacing
    back = Image.fromarray(np.roll(np.asarray(back), TW // 2, axis=1))
    mask = Image.fromarray(np.maximum(np.asarray(mask), np.asarray(back)))

    # piped scallop garland near the top edge, all the way round
    garland = Image.new("L", (TW, TH), 0)
    dg = ImageDraw.Draw(garland)
    n = 26
    seg = TW / n
    for i in range(n + 1):
        x0 = i * seg
        dg.arc([x0, TH * 0.02, x0 + seg, TH * 0.26], 20, 160, fill=255, width=int(TH * 0.022))
        dg.ellipse(
            [x0 - TH * 0.022, TH * 0.10 - TH * 0.022, x0 + TH * 0.022, TH * 0.10 + TH * 0.022], fill=255
        )
    garland_a = np.asarray(garland)

    text_a = np.asarray(mask).astype(np.float32) / 255
    garl = garland_a.astype(np.float32) / 255
    height = np.maximum(text_a, garl * 0.8)
    hmap = np.asarray(
        Image.fromarray((height * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(TH * 0.006)),
        np.float32,
    ) / 255
    gy, gx = np.gradient(hmap)
    return {
        "W": TW,
        "H": TH,
        "text": text_a,
        "garland": garl,
        "gx": gx.astype(np.float32),
        "gy": gy.astype(np.float32),
    }


def build_top_strip():
    """Drip mask + gold-leaf patches for the top tier side."""
    TW, TH = _strip_size(TOP_R, TOP_H, 3072)
    rng = random.Random(7)
    u = np.arange(TW) / TW
    # drip length per column: a base band + rounded drips at random spots
    length = np.full(TW, 0.16)
    for _ in range(22):
        c = rng.random()
        w = rng.uniform(0.006, 0.013)
        L = rng.uniform(0.25, 0.62)
        du = np.minimum(np.abs(u - c), 1 - np.abs(u - c))
        prof = np.sqrt(np.clip(1 - (du / w) ** 2, 0, 1))  # rounded drip tip
        length = np.maximum(length, 0.16 + (L - 0.16) * prof)
    v = (np.arange(TH) / TH)[:, None]
    drip = (v < length[None, :]).astype(np.float32)
    drip = np.asarray(
        Image.fromarray((drip * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), np.float32
    ) / 255

    gold = Image.new("L", (TW, TH), 0)
    dg = ImageDraw.Draw(gold)
    for _ in range(7):
        cx = rng.uniform(0, TW)
        cy = rng.uniform(0.6, 0.86) * TH
        r = rng.uniform(0.07, 0.12) * TH
        pts = []
        k = rng.randint(6, 9)
        for j in range(k):
            a = 2 * math.pi * j / k + rng.uniform(-0.3, 0.3)
            rr = r * rng.uniform(0.55, 1.25)
            pts.append((cx + math.cos(a) * rr * 1.4, cy + math.sin(a) * rr))
        dg.polygon(pts, fill=255)
    gold_a = np.asarray(gold, np.float32) / 255
    gy, gx = np.gradient(
        np.asarray(Image.fromarray((drip * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), np.float32)
        / 255
    )
    return {"W": TW, "H": TH, "drip": drip, "gold": gold_a, "gx": gx.astype(np.float32), "gy": gy.astype(np.float32)}


def _sample(tex, key, u, v):
    W, H = tex["W"], tex["H"]
    x = np.clip((u * W).astype(np.int32), 0, W - 1)
    y = np.clip((v * H).astype(np.int32), 0, H - 1)
    return tex[key][y, x]


def bottom_tier_material(strip):
    def mat(local, part, n, prim):
        nn = local.shape[0]
        col = np.broadcast_to(CREAM, (nn, 3)).copy()
        ks = np.full(nn, 0.12, np.float32)
        shin = np.full(nn, 18.0, np.float32)
        wrap = np.full(nn, 0.35, np.float32)
        metal = np.zeros(nn, np.float32)
        side = part == 0
        if side.any():
            x, y, z = local[side, 0], local[side, 1], local[side, 2]
            phi = np.arctan2(x, z)
            u = (phi / (2 * math.pi) + 0.5) % 1.0
            v = np.clip(1 - y / BOTTOM_H, 0, 0.9999)
            t = _sample(strip, "text", u, v)
            g = _sample(strip, "garland", u, v)
            ink = np.clip(np.maximum(t, g), 0, 1)[:, None]
            base = CREAM * (1 - 0.025 * (0.5 + 0.5 * np.sin(v * 90 + np.sin(phi * 3) * 2)))[:, None]
            pink = ROSE * (1 - g[:, None]) + DRIP * g[:, None]
            col[side] = base * (1 - ink) + pink * ink
            ks[side] = 0.12 + 0.35 * ink[:, 0]  # piped icing is a little glossier
            shin[side] = 18 + 40 * ink[:, 0]
            # bump: raised piping
            gx = _sample(strip, "gx", u, v)
            gy = _sample(strip, "gy", u, v)
            T = np.stack([np.cos(phi), np.zeros_like(phi), -np.sin(phi)], -1)
            U = np.array([0, 1, 0], np.float32)
            k = 9.0
            n[side] = normalize(n[side] - k * (gx[:, None] * T - gy[:, None] * U))
        return col, ks, shin, wrap, metal, n

    return mat


def top_tier_material(strip):
    def mat(local, part, n, prim):
        nn = local.shape[0]
        col = np.broadcast_to(BLUSH, (nn, 3)).copy()
        ks = np.full(nn, 0.12, np.float32)
        shin = np.full(nn, 20.0, np.float32)
        wrap = np.full(nn, 0.35, np.float32)
        metal = np.zeros(nn, np.float32)
        top = part == 2
        col[top] = DRIP
        ks[top] = 0.55
        shin[top] = 70
        side = part == 0
        if side.any():
            x, y, z = local[side, 0], local[side, 1], local[side, 2]
            phi = np.arctan2(x, z)
            u = (phi / (2 * math.pi) + 0.5) % 1.0
            v = np.clip(1 - y / TOP_H, 0, 0.9999)
            ombre = (BLUSH_LIGHT * (1 - v[:, None]) + BLUSH * v[:, None])
            dr = _sample(strip, "drip", u, v)[:, None]
            gd = _sample(strip, "gold", u, v)[:, None] * (1 - dr)
            c = ombre * (1 - dr) + DRIP * dr
            c = c * (1 - gd) + GOLD * gd
            col[side] = c
            ks[side] = (0.12 + 0.45 * dr + 0.9 * gd)[:, 0]
            shin[side] = (20 + 50 * dr + 60 * gd)[:, 0]
            metal[side] = gd[:, 0]
            gx = _sample(strip, "gx", u, v)
            gy = _sample(strip, "gy", u, v)
            T = np.stack([np.cos(phi), np.zeros_like(phi), -np.sin(phi)], -1)
            U = np.array([0, 1, 0], np.float32)
            n[side] = normalize(n[side] - 4.0 * (gx[:, None] * T - gy[:, None] * U))
        return col, ks, shin, wrap, metal, n

    return mat


def porcelain():
    def mat(local, part, n, prim):
        nn = local.shape[0]
        return (
            np.broadcast_to(PORCELAIN, (nn, 3)).copy(),
            np.full(nn, 0.75, np.float32),
            np.full(nn, 90.0, np.float32),
            np.full(nn, 0.1, np.float32),
            np.zeros(nn, np.float32),
            n,
        )

    return mat


def rosette_material(color):
    """Piped star rosette: ridges around the local y axis."""

    def mat(local, part, n, prim):
        nn = local.shape[0]
        a = np.arctan2(local[:, 0], local[:, 2])
        ridge = np.sin(a * 9 + local[:, 1] * 6)
        T = np.stack([np.cos(a), np.zeros(nn), -np.sin(a)], -1)
        n = normalize(n + 0.28 * ridge[:, None] * T)
        return (
            np.broadcast_to(color, (nn, 3)).copy(),
            np.full(nn, 0.22, np.float32),
            np.full(nn, 30.0, np.float32),
            np.full(nn, 0.4, np.float32),
            np.zeros(nn, np.float32),
            n,
        )

    return mat


def raspberry_material():
    def mat(local, part, n, prim):
        nn = local.shape[0]
        k = 13.0
        x, y, z = local[:, 0] * k, local[:, 1] * k, local[:, 2] * k
        g = np.stack(
            [np.cos(x) * np.sin(y) * np.sin(z), np.sin(x) * np.cos(y) * np.sin(z), np.sin(x) * np.sin(y) * np.cos(z)],
            -1,
        )
        n = normalize(n - 0.55 * g)
        shade = 0.85 + 0.15 * (np.sin(x) * np.sin(y) * np.sin(z))
        return (
            RASP * shade[:, None],
            np.full(nn, 0.6, np.float32),
            np.full(nn, 60.0, np.float32),
            np.full(nn, 0.45, np.float32),
            np.zeros(nn, np.float32),
            n,
        )

    return mat


def strawberry_material():
    def mat(local, part, n, prim):
        nn = local.shape[0]
        # seeds on a lattice in spherical coordinates
        th = np.arccos(np.clip(local[:, 1], -1, 1))
        ph = np.arctan2(local[:, 0], local[:, 2])
        a = (th * 7) % 1.0
        b = ((ph + (np.floor(th * 7) % 2) * 0.25) * 7) % 1.0
        seed = ((a - 0.5) ** 2 + (b - 0.5) ** 2 < 0.035).astype(np.float32)
        top = np.clip((local[:, 1] - 0.55) * 3, 0, 1)  # paler near the calyx
        base = STRAW * (1 - 0.35 * top[:, None]) + hexcol("#F7E2C9") * (0.35 * top[:, None])
        col = base * (1 - seed[:, None]) + hexcol("#F2D27A") * seed[:, None]
        return (
            col,
            np.full(nn, 0.7, np.float32),
            np.full(nn, 80.0, np.float32),
            np.full(nn, 0.3, np.float32),
            np.zeros(nn, np.float32),
            n,
        )

    return mat


def gold_material():
    def mat(local, part, n, prim):
        nn = local.shape[0]
        crinkle = vnoise(local, 9.0)
        n = normalize(n + 0.5 * np.stack([np.sin(crinkle * 6), np.zeros(nn), np.cos(crinkle * 5)], -1))
        return (
            np.broadcast_to(GOLD, (nn, 3)).copy(),
            np.full(nn, 1.6, np.float32),
            np.full(nn, 55.0, np.float32),
            np.full(nn, 0.0, np.float32),
            np.ones(nn, np.float32),
            n,
        )

    return mat


def macaron_shell(color):
    def mat(local, part, n, prim):
        nn = local.shape[0]
        # ruffled "foot" around the equator
        foot = np.clip(1 - np.abs(local[:, 1]) * 6, 0, 1)
        a = np.arctan2(local[:, 0], local[:, 2])
        rough = np.sin(a * 60) * np.sin(a * 23 + 1.3)
        T = np.stack([np.cos(a), np.zeros(nn), -np.sin(a)], -1)
        n = normalize(n + (0.45 * foot * rough)[:, None] * T + (0.25 * foot)[:, None] * np.array([0, -1, 0]))
        col = color * (1 - 0.12 * foot)[:, None]
        return (
            col,
            np.full(nn, 0.18, np.float32),
            np.full(nn, 24.0, np.float32),
            np.full(nn, 0.3, np.float32),
            np.zeros(nn, np.float32),
            n,
        )

    return mat


def add_macaron(prims, base, R, color, filling, scale=1.0):
    """base = centre of the bottom shell's flat face, R orients the macaron (local y = its axis)."""
    r = 0.2 * scale
    sh = 0.065 * scale
    # Shells are full ellipsoids, so at the filling's radius (0.9r) each shell only
    # reaches ~0.44–0.55 of its half-height. The gap leaves a visible cream band.
    gap = sh * 1.45
    up = R @ np.array([0, 1, 0], np.float32)
    prims.append(Ellipsoid(base, (r, sh, r), R, macaron_shell(color)))
    prims.append(Cylinder(base, r * 0.9, gap, R, flat_material(filling, ks=0.3, shin=30, wrap=0.4)))
    prims.append(Ellipsoid(base + up * gap, (r, sh * 1.25, r), R, macaron_shell(color)))
    return gap + sh * 2.25  # total height, bottom of lower shell to top of upper shell


# ================================================================ hero cake
_STRIPS = {}


def cake_prims(theta: float):
    if "bottom" not in _STRIPS:
        _STRIPS["bottom"] = build_bottom_strip()
        _STRIPS["top"] = build_top_strip()
    Ry = rot_y(theta)
    P = []

    # porcelain cake stand (rotationally symmetric, so it doesn't need theta)
    P.append(Cylinder((0, 0, 0), 0.62, 0.07, material=porcelain()))
    P.append(Frustum((0, 0.07, 0), 0.30, 0.16, 0.10, material=porcelain()))
    P.append(Cylinder((0, 0.17, 0), 0.15, 0.36, material=porcelain()))
    P.append(Frustum((0, 0.53, 0), 0.16, 1.28, 0.05, material=porcelain()))
    P.append(Cylinder((0, STAND_TOP - 0.04, 0), 1.30, 0.04, material=porcelain()))

    b0 = STAND_TOP
    P.append(Cylinder((0, b0, 0), BOTTOM_R, BOTTOM_H, Ry, bottom_tier_material(_STRIPS["bottom"])))
    t0 = b0 + BOTTOM_H
    P.append(Cylinder((0, t0, 0), TOP_R, TOP_H, Ry, top_tier_material(_STRIPS["top"])))

    def place(local):
        return Ry @ np.asarray(local, np.float32)

    # piped bead borders
    for i in range(46):
        a = 2 * math.pi * i / 46
        P.append(Sphere(place((math.sin(a) * (BOTTOM_R + 0.005), b0 + 0.06, math.cos(a) * (BOTTOM_R + 0.005))), 0.07,
                        flat_material(BLUSH, ks=0.25, shin=35, wrap=0.4)))
    for i in range(34):
        a = 2 * math.pi * (i + 0.5) / 34
        P.append(Sphere(place((math.sin(a) * (TOP_R + 0.005), t0 + 0.05, math.cos(a) * (TOP_R + 0.005))), 0.055,
                        flat_material(CREAM, ks=0.2, shin=30, wrap=0.4)))
    # rosettes round the top edge
    top_y = t0 + TOP_H
    for i in range(16):
        a = 2 * math.pi * i / 16
        p = place((math.sin(a) * (TOP_R - 0.07), top_y + 0.035, math.cos(a) * (TOP_R - 0.07)))
        P.append(Ellipsoid(p, (0.075, 0.06, 0.075), Ry, rosette_material(CREAM)))

    # crown: macarons, berries, gold leaf
    add_macaron(P, place((-0.18, top_y + 0.215, -0.12)), Ry @ rot_y(0.5) @ rot_x(math.pi / 2 - 0.25), MAC_PINK, CREAM, 1.05)
    add_macaron(P, place((0.16, top_y + 0.2, -0.2)), Ry @ rot_y(-0.6) @ rot_x(math.pi / 2 - 0.3), PISTACHIO, CREAM, 0.95)
    for loc, r in [((0.24, 0.07, 0.18), 0.085), ((0.02, 0.07, 0.28), 0.08), ((-0.26, 0.065, 0.16), 0.078), ((0.34, 0.06, -0.05), 0.07)]:
        P.append(Sphere(place((loc[0], top_y + loc[1], loc[2])), r, raspberry_material()))
    P.append(Ellipsoid(place((-0.05, top_y + 0.1, 0.05)), (0.09, 0.12, 0.09), Ry @ rot_z(0.5) @ rot_x(0.4), strawberry_material()))
    rng = random.Random(11)
    for _ in range(7):
        a = rng.uniform(0, 2 * math.pi)
        rr = rng.uniform(0.1, 0.48)
        R = Ry @ rot_y(rng.uniform(0, 6.28)) @ rot_x(rng.uniform(-0.6, 0.6)) @ rot_z(rng.uniform(-0.6, 0.6))
        P.append(Ellipsoid(place((math.sin(a) * rr, top_y + 0.03 + rng.uniform(0, 0.12), math.cos(a) * rr)),
                           (0.05, 0.005, 0.035), R, gold_material(), casts_shadow=False))
    return P


def hero_camera(size, ss=2):
    return Camera(size, eye=(0, 3.15, 6.6), target=(0, 1.2, 0), fov_deg=31, ss=ss)


def _ground(cam, center=(0, 0, 0), rx=0.75, rz=0.75, strength=0.32, blur=0.025):
    cx, cy, _ = cam.project(center)
    ex, _, _ = cam.project((rx, 0, 0))
    _, ez, _ = cam.project((0, 0, rz))
    s = cam.ss
    return (cx / s, cy / s, abs(ex - cx) / s, abs(ez - cy) / s + 2, strength, cam.size * blur)


HERO_FRAMES, HERO_SIZE, HERO_MOBILE = 96, 960, 640


def _render_hero_frame(i: int) -> int:
    d = os.path.join(OUT, "hero-cake")
    cam = hero_camera(HERO_SIZE, 2)
    ground = _ground(cam, rx=1.05, rz=1.05, strength=0.28, blur=0.03)
    theta = 2 * math.pi * i / HERO_FRAMES
    img = render(cake_prims(theta), cam, ground_shadow=ground)
    save_webp(img, os.path.join(d, f"frame-{i + 1:04d}.webp"), quality=80)
    if i % 2 == 0:  # mobile gets every other frame at a smaller size
        save_webp(img, os.path.join(d, "mobile", f"frame-{i // 2 + 1:04d}.webp"), size=HERO_MOBILE, quality=76)
    if i == 0:
        save_webp(img, os.path.join(d, "poster.webp"), quality=86)
        save_webp(img, os.path.join(d, "poster-mobile.webp"), size=HERO_MOBILE, quality=82)
    return i


def render_cake():
    from multiprocessing import Pool

    os.makedirs(os.path.join(OUT, "hero-cake", "mobile"), exist_ok=True)
    t_start = time.time()
    workers = max(1, (os.cpu_count() or 2) - 1)
    with Pool(workers) as pool:
        for n, _ in enumerate(pool.imap_unordered(_render_hero_frame, range(HERO_FRAMES)), 1):
            print(f"  hero frame {n}/{HERO_FRAMES}  ({time.time() - t_start:.0f}s)", flush=True)


# ================================================================ secondary assets
def render_cupcake(size=800):
    P = []
    liner_col = BLUSH

    def liner(local, part, n, prim):
        nn = local.shape[0]
        a = np.arctan2(local[:, 0], local[:, 2])
        pleat = np.sin(a * 28)
        T = np.stack([np.cos(a), np.zeros(nn), -np.sin(a)], -1)
        side = part == 0
        n[side] = normalize(n[side] + 0.35 * pleat[side, None] * T[side])
        stripe = (np.sin(a * 14) > 0.6).astype(np.float32)
        col = liner_col * (1 - 0.25 * stripe[:, None]) + ROSE * 0.25 * stripe[:, None]
        return col, np.full(nn, 0.25, np.float32), np.full(nn, 30.0, np.float32), np.full(nn, 0.2, np.float32), np.zeros(nn, np.float32), n

    P.append(Frustum((0, 0, 0), 0.40, 0.54, 0.62, material=liner))
    P.append(Ellipsoid((0, 0.66, 0), (0.6, 0.16, 0.6), material=flat_material(SPONGE, ks=0.1, wrap=0.3)))

    def swirl(local, part, n, prim):
        nn = local.shape[0]
        a = np.arctan2(local[:, 0], local[:, 2])
        ridge = np.sin(a * 5 + local[:, 1] * 9)
        T = np.stack([np.cos(a), np.zeros(nn), -np.sin(a)], -1)
        n = normalize(n + 0.35 * ridge[:, None] * T)
        col = hexcol("#F6B7CB") * (0.94 + 0.06 * ridge)[:, None]
        return col, np.full(nn, 0.3, np.float32), np.full(nn, 40.0, np.float32), np.full(nn, 0.45, np.float32), np.zeros(nn, np.float32), n

    layers = [((0, 0.78, 0), (0.62, 0.24, 0.62)), ((0.02, 1.02, 0.01), (0.49, 0.21, 0.49)),
              ((-0.01, 1.23, 0.02), (0.35, 0.18, 0.35)), ((0.01, 1.4, 0), (0.2, 0.15, 0.2))]
    for c, r in layers:
        P.append(Ellipsoid(c, r, rot_y(c[0] * 30), swirl))
    P.append(Sphere((0.02, 1.6, 0.03), 0.11, raspberry_material()))

    rng = random.Random(3)
    cols = [ROSE, CREAM, GOLD, hexcol("#3F3F46"), BLUSH_LIGHT, hexcol("#F28AB0")]
    for _ in range(46):
        c, r = layers[rng.randrange(len(layers))]
        a = rng.uniform(0, 2 * math.pi)
        el = rng.uniform(0.1, 1.2)
        local = np.array([math.cos(el) * math.sin(a) * r[0], math.sin(el) * r[1], math.cos(el) * math.cos(a) * r[2]])
        pos = np.asarray(c) + local * 1.01
        R = rot_y(rng.uniform(0, 6.3)) @ rot_z(rng.uniform(-0.5, 0.5))
        col = cols[rng.randrange(len(cols))]
        P.append(Ellipsoid(pos, (0.045, 0.012, 0.012), R, flat_material(col, ks=0.5, shin=60, metal=1.0 if col is GOLD else 0.0), casts_shadow=False))

    cam = Camera(size, eye=(0, 2.1, 4.6), target=(0, 0.82, 0), fov_deg=30, ss=2)
    img = render(P, cam, ground_shadow=_ground(cam, rx=0.5, rz=0.5, strength=0.3))
    return img


def render_slice(size=900):
    P = []

    def slice_mat(local, part, n, prim):
        nn = local.shape[0]
        y = local[:, 1]
        rad = np.sqrt(local[:, 0] ** 2 + local[:, 2] ** 2)
        col = np.broadcast_to(CREAM, (nn, 3)).copy()
        ks = np.full(nn, 0.12, np.float32)
        shin = np.full(nn, 20.0, np.float32)
        wrap = np.full(nn, 0.35, np.float32)
        cut = (part == 3) | (part == 4)
        if cut.any():
            yc = y[cut]
            layer = np.full(yc.shape, 0, np.int8)  # 0 sponge
            for lo, hi, code in [(0.29, 0.35, 1), (0.35, 0.37, 2), (0.6, 0.66, 1), (0.66, 0.68, 2), (0.88, 1.0, 3)]:
                layer[(yc >= lo) & (yc < hi)] = code
            crumb = hash3(np.floor(local[cut] * 160), 1.0)
            spong = SPONGE * (0.86 + 0.14 * crumb)[:, None]
            c = spong.copy()
            c[layer == 1] = BLUSH
            c[layer == 2] = GANACHE
            c[layer == 3] = CREAM
            rim = rad[cut] > prim.r - 0.05
            c[rim] = CREAM
            col[cut] = c
            n[cut] = normalize(n[cut] + (0.25 * (crumb - 0.5))[:, None] * (layer == 0)[:, None])
            ks[cut] = np.where(layer == 2, 0.6, 0.06)
        top = part == 2
        col[top] = CREAM
        return col, ks, shin, wrap, np.zeros(nn, np.float32), n

    Rw = rot_y(-0.55)
    P.append(Wedge((0, 0, 0), 1.0, 1.0, 0.33, Rw, slice_mat))
    # toppers near the outer crust
    def onslice(lx, ly, lz):
        return Rw @ np.array([lx, ly, lz], np.float32)

    P.append(Ellipsoid(onslice(0.0, 1.05, 0.82), (0.07, 0.06, 0.07), Rw, rosette_material(CREAM)))
    P.append(Sphere(onslice(0.12, 1.08, 0.66), 0.075, raspberry_material()))
    P.append(Ellipsoid(onslice(-0.1, 1.1, 0.62), (0.08, 0.11, 0.08), rot_z(0.9) @ rot_y(0.3), strawberry_material()))
    P.append(Ellipsoid(onslice(0.02, 1.02, 0.5), (0.05, 0.005, 0.035), rot_x(0.3) @ rot_y(0.8), gold_material(), casts_shadow=False))
    cam = Camera(size, eye=(1.4, 2.2, 3.7), target=(0.1, 0.5, 0.45), fov_deg=30, ss=2)
    return render(P, cam, ground_shadow=_ground(cam, center=(0.1, 0, 0.55), rx=0.55, rz=0.5, strength=0.3))


def render_macaron_stack(size=700):
    P = []
    sh = 0.065 * 2.0
    stack = [(MAC_PINK, CREAM, (0.0, 0.0), 0.0), (MAC_CREAM, BLUSH, (0.04, -0.02), 0.12), (PISTACHIO, CREAM, (-0.03, 0.02), -0.1)]
    y = sh  # lower shell sits on the ground
    for col, fill, (ox, oz), tilt in stack:
        R = rot_z(tilt * 0.6) @ rot_x(tilt * 0.4)
        height = add_macaron(P, np.array([ox, y, oz], np.float32), R, col, fill, scale=2.0)
        y += height - sh * 0.15  # nest slightly into the macaron below
    cam = Camera(size, eye=(0, 1.9, 4.3), target=(0, 0.62, 0), fov_deg=30, ss=2)
    return render(P, cam, ground_shadow=_ground(cam, rx=0.42, rz=0.42, strength=0.3))


def render_single_macaron(size=520):
    P = []
    # mostly side-on so the cream filling and ruffled feet read clearly
    add_macaron(P, np.array([0, -0.2, 0], np.float32), rot_z(0.32) @ rot_x(-0.12), MAC_PINK, CREAM, scale=2.4)
    cam = Camera(size, eye=(0, 0.55, 3.0), target=(0, 0.02, 0), fov_deg=26, ss=2)
    return render(P, cam)


def render_strawberries(size=700):
    P = []
    calyx = flat_material(LEAF, ks=0.3, shin=30, wrap=0.3)
    for pos, R in [((-0.32, 0.22, 0.05), rot_z(1.4) @ rot_y(0.2)), ((0.22, 0.24, -0.12), rot_z(-0.25)), ((0.18, 0.2, 0.36), rot_z(1.2) @ rot_y(2.4))]:
        pos = np.array(pos, np.float32)
        P.append(Ellipsoid(pos, (0.2, 0.26, 0.2), R, strawberry_material()))
        up = R @ np.array([0, 1, 0], np.float32)
        for k in range(6):
            Rl = R @ rot_y(k * math.pi / 3) @ rot_x(0.9)
            P.append(Ellipsoid(pos + up * 0.24 + (R @ rot_y(k * math.pi / 3) @ np.array([0, 0, 0.06], np.float32)), (0.035, 0.01, 0.09), Rl, calyx))
    cam = Camera(size, eye=(0, 2.0, 3.4), target=(0, 0.2, 0.05), fov_deg=30, ss=2)
    return render(P, cam, ground_shadow=_ground(cam, center=(0, 0, 0.08), rx=0.65, rz=0.45, strength=0.28))


def render_raspberries(size=560):
    P = []
    for c, r in [((-0.16, 0.12, 0.0), 0.13), ((0.13, 0.12, -0.06), 0.13), ((0.02, 0.12, 0.17), 0.12), ((0.0, 0.31, 0.02), 0.12)]:
        P.append(Sphere(c, r, raspberry_material()))
    cam = Camera(size, eye=(0, 1.3, 2.6), target=(0, 0.18, 0.03), fov_deg=28, ss=2)
    return render(P, cam, ground_shadow=_ground(cam, rx=0.38, rz=0.32, strength=0.28))


def render_sprinkles(size=640):
    P = []
    rng = random.Random(21)
    cols = [ROSE, CREAM, GOLD, BLUSH, hexcol("#F28AB0"), hexcol("#3F3F46")]
    for _ in range(64):
        r = rng.uniform(0.0, 1.0) ** 0.7 * 1.1
        a = rng.uniform(0, 2 * math.pi)
        pos = (math.sin(a) * r, 0.03, math.cos(a) * r * 0.9)
        col = cols[rng.randrange(len(cols))]
        R = rot_y(rng.uniform(0, 6.3)) @ rot_x(rng.uniform(-0.3, 0.3))
        P.append(Ellipsoid(pos, (0.09, 0.025, 0.025), R, flat_material(col, ks=0.5, shin=60, metal=1.0 if col is GOLD else 0.0)))
    cam = Camera(size, eye=(0, 3.4, 1.7), target=(0, 0, 0), fov_deg=42, ss=2)
    return render(P, cam)


def render_gold_flakes(size=420):
    """Gold leaf is flatter and more irregular than a primitive allows, so it is
    painted in 2D with a crinkled metallic gradient."""
    rng = random.Random(5)
    img = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
    for _ in range(5):
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        cx, cy = rng.uniform(0.2, 0.8) * size * 2, rng.uniform(0.2, 0.8) * size * 2
        r = rng.uniform(0.07, 0.16) * size * 2
        pts = []
        k = rng.randint(7, 11)
        for j in range(k):
            ang = 2 * math.pi * j / k + rng.uniform(-0.25, 0.25)
            rr = r * rng.uniform(0.45, 1.15)
            pts.append((cx + math.cos(ang) * rr, cy + math.sin(ang) * rr * 0.75))
        d.polygon(pts, fill=(255, 255, 255, 255))
        a = np.asarray(layer)[..., 3].astype(np.float32) / 255
        # crumpled foil: blurred random facets, then sharpened into creases
        nrng = np.random.default_rng(rng.randint(0, 10_000))
        facets = Image.fromarray((nrng.random((img.size[1] // 18, img.size[0] // 18)) * 255).astype(np.uint8))
        facets = facets.resize(img.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(3))
        f = np.asarray(facets, np.float32) / 255
        gy, gx = np.gradient(f)
        tone = np.clip(0.55 + (gx * -0.6 + gy * 0.8) * 18 + (f - 0.5) * 0.5, 0, 1)
        g0 = np.array([0.95, 0.80, 0.45])
        g1 = np.array([0.62, 0.43, 0.15])
        rgb = g1 + (g0 - g1) * np.clip(tone, 0, 1)[..., None]
        arr = np.dstack([rgb, a]) * 255
        img = Image.alpha_composite(img, Image.fromarray(arr.astype(np.uint8), "RGBA"))
    return img.resize((size, size), Image.LANCZOS)


def render_assets():
    os.makedirs(OUT, exist_ok=True)
    jobs = [
        ("cupcake.webp", render_cupcake, 800),
        ("cake-slice.webp", render_slice, 900),
        ("macaron-stack.webp", render_macaron_stack, 700),
        ("macaron.webp", render_single_macaron, 520),
        ("strawberries.webp", render_strawberries, 700),
        ("raspberries.webp", render_raspberries, 560),
        ("sprinkles.webp", render_sprinkles, 640),
        ("gold-flakes.webp", render_gold_flakes, 420),
    ]
    for name, fn, size in jobs:
        t = time.time()
        img = fn(size)
        save_webp(img, os.path.join(OUT, name), quality=84)
        print(f"  {name} ({time.time() - t:.1f}s)", flush=True)


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what == "preview":
        os.makedirs(OUT, exist_ok=True)
        cam = hero_camera(int(sys.argv[2]) if len(sys.argv) > 2 else 480, 2)
        theta = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
        t = time.time()
        img = render(cake_prims(theta), cam, ground_shadow=_ground(cam, rx=1.05, rz=1.05, strength=0.28, blur=0.03))
        p = os.path.join(HERE, "_preview.png")
        img.save(p)
        print(f"preview -> {p} ({time.time() - t:.1f}s)")
    elif what == "asset":
        name = sys.argv[2]
        fn = globals()[f"render_{name}"]
        img = fn(int(sys.argv[3]) if len(sys.argv) > 3 else 600)
        p = os.path.join(HERE, f"_preview_{name}.png")
        img.save(p)
        print(f"asset preview -> {p}")
    else:
        if what in ("all", "assets"):
            render_assets()
        if what in ("all", "cake"):
            render_cake()
