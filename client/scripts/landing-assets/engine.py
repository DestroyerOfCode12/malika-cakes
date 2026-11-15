"""
Tiny vectorised ray tracer used to render the landing-page assets offline.

Everything is analytic (spheres/ellipsoids, cylinders, cone frustums, convex
wedges) so a frame renders in seconds with numpy. Output is premultiplied-free
RGBA with clean anti-aliased alpha, ready to be written as WebP.

This runs at build-asset time only. Nothing here ships to the browser.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Callable, Optional

import numpy as np
from PIL import Image, ImageFilter

INF = np.float32(1e9)
EPS = 1e-4


# --------------------------------------------------------------------------- math
def normalize(v: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(v, axis=-1, keepdims=True)
    return v / np.maximum(n, 1e-9)


def rot_x(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], dtype=np.float32)


def rot_y(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], dtype=np.float32)


def rot_z(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], dtype=np.float32)


def srgb_to_lin(c) -> np.ndarray:
    c = np.asarray(c, dtype=np.float32)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def hexcol(h: str) -> np.ndarray:
    h = h.lstrip("#")
    return srgb_to_lin([int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)])


# --------------------------------------------------------------------------- material
@dataclass
class Surface:
    """Per-hit shading inputs for a batch of points."""

    normal: np.ndarray  # (n,3) world
    color: np.ndarray  # (n,3) linear
    ks: np.ndarray  # (n,) specular strength
    shin: np.ndarray  # (n,) specular exponent
    wrap: np.ndarray  # (n,) wrap-lighting amount (soft, buttery surfaces)
    metal: np.ndarray  # (n,) 0..1 tint specular by base colour


def flat_material(color, ks=0.25, shin=40.0, wrap=0.25, metal=0.0):
    col = np.asarray(color, dtype=np.float32)

    def mat(local, part, normal_local, prim):
        n = local.shape[0]
        return (
            np.broadcast_to(col, (n, 3)).copy(),
            np.full(n, ks, np.float32),
            np.full(n, shin, np.float32),
            np.full(n, wrap, np.float32),
            np.full(n, metal, np.float32),
            normal_local,
        )

    return mat


# --------------------------------------------------------------------------- primitives
@dataclass
class Prim:
    center: np.ndarray
    R: np.ndarray = field(default_factory=lambda: np.eye(3, dtype=np.float32))
    material: Callable = field(default_factory=lambda: flat_material(hexcol("#ffffff")))
    casts_shadow: bool = True

    # bounding sphere in world space (set by subclasses)
    bc: np.ndarray = field(init=False)
    br: float = field(init=False)

    def to_local(self, O, D):
        RT = self.R.T
        return (O - self.center) @ RT.T, D @ RT.T

    def hit(self, O, D) -> np.ndarray:  # pragma: no cover - abstract
        raise NotImplementedError

    def surface(self, P) -> Surface:  # pragma: no cover - abstract
        raise NotImplementedError

    def _finish(self, local, part, n_local) -> Surface:
        col, ks, shin, wrap, metal, n_local = self.material(local, part, n_local, self)
        n_world = normalize(n_local @ self.R.T)
        return Surface(n_world, col, ks, shin, wrap, metal)


class Ellipsoid(Prim):
    def __init__(self, center, radii, R=None, material=None, casts_shadow=True):
        super().__init__(
            np.asarray(center, np.float32),
            np.eye(3, dtype=np.float32) if R is None else np.asarray(R, np.float32),
            material or flat_material(hexcol("#ffffff")),
            casts_shadow,
        )
        self.radii = np.asarray(radii, np.float32)
        self.bc = self.center
        self.br = float(self.radii.max())

    def hit(self, O, D):
        o, d = self.to_local(O, D)
        o = o / self.radii
        d = d / self.radii
        a = np.einsum("ij,ij->i", d, d)
        b = 2 * np.einsum("ij,ij->i", o, d)
        c = np.einsum("ij,ij->i", o, o) - 1
        disc = b * b - 4 * a * c
        t = np.full(O.shape[0], INF, np.float32)
        ok = disc > 0
        sq = np.sqrt(np.where(ok, disc, 0))
        t0 = (-b - sq) / (2 * a)
        t1 = (-b + sq) / (2 * a)
        tt = np.where(t0 > EPS, t0, t1)
        ok &= tt > EPS
        t[ok] = tt[ok]
        return t

    def surface(self, P):
        local = (P - self.center) @ self.R
        unit = local / self.radii
        n_local = normalize(unit / self.radii)
        return self._finish(unit, np.zeros(P.shape[0], np.int8), n_local)


def Sphere(center, r, material=None, casts_shadow=True):
    return Ellipsoid(center, (r, r, r), None, material, casts_shadow)


class Frustum(Prim):
    """Capped cone frustum (or cylinder when r0 == r1) along local +y, base at center."""

    def __init__(self, center, r0, r1, h, R=None, material=None, casts_shadow=True):
        super().__init__(
            np.asarray(center, np.float32),
            np.eye(3, dtype=np.float32) if R is None else np.asarray(R, np.float32),
            material or flat_material(hexcol("#ffffff")),
            casts_shadow,
        )
        self.r0, self.r1, self.h = float(r0), float(r1), float(h)
        self.k = (self.r1 - self.r0) / self.h
        self.bc = self.center + (self.R @ np.array([0, h / 2, 0], np.float32))
        self.br = math.sqrt(max(r0, r1) ** 2 + (h / 2) ** 2)

    def hit(self, O, D):
        o, d = self.to_local(O, D)
        n = O.shape[0]
        k, r0, h = self.k, self.r0, self.h
        best = np.full(n, INF, np.float32)

        # side
        rr = r0 + k * o[:, 1]
        a = d[:, 0] ** 2 + d[:, 2] ** 2 - (k * d[:, 1]) ** 2
        b = 2 * (o[:, 0] * d[:, 0] + o[:, 2] * d[:, 2]) - 2 * k * d[:, 1] * rr
        c = o[:, 0] ** 2 + o[:, 2] ** 2 - rr**2
        disc = b * b - 4 * a * c
        ok = (disc > 0) & (np.abs(a) > 1e-9)
        sq = np.sqrt(np.where(ok, disc, 0))
        a_safe = np.where(np.abs(a) > 1e-9, a, 1)
        for tt in ((-b - sq) / (2 * a_safe), (-b + sq) / (2 * a_safe)):
            y = o[:, 1] + tt * d[:, 1]
            good = ok & (tt > EPS) & (y >= 0) & (y <= h) & (tt < best)
            best[good] = tt[good]

        # caps
        for yc, rc in ((0.0, self.r0), (h, self.r1)):
            dy = np.where(np.abs(d[:, 1]) > 1e-9, d[:, 1], 1e-9)
            tt = (yc - o[:, 1]) / dy
            x = o[:, 0] + tt * d[:, 0]
            z = o[:, 2] + tt * d[:, 2]
            good = (tt > EPS) & (x * x + z * z <= rc * rc) & (tt < best)
            best[good] = tt[good]
        return best

    def surface(self, P):
        local = (P - self.center) @ self.R
        y = local[:, 1]
        tol = 2e-3 * max(self.h, 0.05)
        part = np.zeros(P.shape[0], np.int8)  # 0 side, 1 bottom, 2 top
        part[y <= tol] = 1
        part[y >= self.h - tol] = 2
        rr = self.r0 + self.k * y
        n_side = normalize(np.stack([local[:, 0], -self.k * rr, local[:, 2]], -1))
        n_local = n_side.copy()
        n_local[part == 1] = (0, -1, 0)
        n_local[part == 2] = (0, 1, 0)
        return self._finish(local, part, n_local)


def Cylinder(center, r, h, R=None, material=None, casts_shadow=True):
    return Frustum(center, r, r, h, R, material, casts_shadow)


class Wedge(Prim):
    """Convex cake-slice wedge: cylinder sector of radius r, height h, half-angle a
    around local +z (the cut faces are the planes either side of +z)."""

    def __init__(self, center, r, h, half_angle, R=None, material=None, casts_shadow=True):
        super().__init__(
            np.asarray(center, np.float32),
            np.eye(3, dtype=np.float32) if R is None else np.asarray(R, np.float32),
            material or flat_material(hexcol("#ffffff")),
            casts_shadow,
        )
        self.r, self.h, self.a = float(r), float(h), float(half_angle)
        ca, sa = math.cos(self.a), math.sin(self.a)
        self.planes = np.array([[ca, 0, -sa], [-ca, 0, -sa]], np.float32)  # outward normals, through axis
        self.bc = self.center + (self.R @ np.array([0, h / 2, r / 2], np.float32))
        self.br = math.sqrt(r**2 + (h / 2) ** 2)

    def hit(self, O, D):
        o, d = self.to_local(O, D)
        n = O.shape[0]
        t_in = np.full(n, -INF, np.float32)
        t_out = np.full(n, INF, np.float32)
        valid = np.ones(n, bool)

        # y slab
        dy = np.where(np.abs(d[:, 1]) > 1e-9, d[:, 1], 1e-9)
        ta = (0 - o[:, 1]) / dy
        tb = (self.h - o[:, 1]) / dy
        t_in = np.maximum(t_in, np.minimum(ta, tb))
        t_out = np.minimum(t_out, np.maximum(ta, tb))

        # infinite cylinder
        a = d[:, 0] ** 2 + d[:, 2] ** 2
        b = 2 * (o[:, 0] * d[:, 0] + o[:, 2] * d[:, 2])
        c = o[:, 0] ** 2 + o[:, 2] ** 2 - self.r**2
        disc = b * b - 4 * a * c
        valid &= disc > 0
        sq = np.sqrt(np.where(disc > 0, disc, 0))
        a_safe = np.where(a > 1e-9, a, 1)
        t_in = np.maximum(t_in, (-b - sq) / (2 * a_safe))
        t_out = np.minimum(t_out, (-b + sq) / (2 * a_safe))

        # half-spaces
        for nrm in self.planes:
            denom = d @ nrm
            num = -(o @ nrm)
            par = np.abs(denom) < 1e-9
            valid &= ~(par & (num < 0))
            tt = num / np.where(par, 1, denom)
            t_in = np.where(~par & (denom < 0), np.maximum(t_in, tt), t_in)
            t_out = np.where(~par & (denom > 0), np.minimum(t_out, tt), t_out)

        valid &= (t_in < t_out) & (t_out > EPS)
        t = np.where(t_in > EPS, t_in, t_out)
        return np.where(valid, t, INF).astype(np.float32)

    def surface(self, P):
        local = (P - self.center) @ self.R
        n = P.shape[0]
        tol = 2e-3 * self.r
        part = np.zeros(n, np.int8)  # 0 outer side, 1 bottom, 2 top, 3/4 cut faces
        n_local = normalize(np.stack([local[:, 0], np.zeros(n), local[:, 2]], -1))
        d0 = np.abs(local @ self.planes[0])
        d1 = np.abs(local @ self.planes[1])
        m3 = d0 < tol
        m4 = d1 < tol
        part[m3] = 3
        n_local[m3] = self.planes[0]
        part[m4] = 4
        n_local[m4] = self.planes[1]
        mb = local[:, 1] <= tol
        mt = local[:, 1] >= self.h - tol
        part[mb] = 1
        n_local[mb] = (0, -1, 0)
        part[mt] = 2
        n_local[mt] = (0, 1, 0)
        return self._finish(local, part, n_local)


# --------------------------------------------------------------------------- camera
class Camera:
    def __init__(self, size, eye, target, fov_deg=30.0, ss=2):
        self.W = self.H = size * ss
        self.size = size
        self.ss = ss
        self.eye = np.asarray(eye, np.float32)
        target = np.asarray(target, np.float32)
        self.fwd = normalize(target - self.eye)
        self.right = normalize(np.cross(self.fwd, np.array([0, 1, 0], np.float32)))
        self.up = np.cross(self.right, self.fwd)
        self.tan = math.tan(math.radians(fov_deg) / 2)

    def rays(self, x0, x1, y0, y1):
        xs = (np.arange(x0, x1, dtype=np.float32) + 0.5) / self.W * 2 - 1
        ys = 1 - (np.arange(y0, y1, dtype=np.float32) + 0.5) / self.H * 2
        X, Y = np.meshgrid(xs, ys)
        D = (
            self.fwd[None, None]
            + X[..., None] * self.tan * self.right[None, None]
            + Y[..., None] * self.tan * self.up[None, None]
        )
        return normalize(D.reshape(-1, 3))

    def project(self, p):
        v = np.asarray(p, np.float32) - self.eye
        z = v @ self.fwd
        x = (v @ self.right) / (z * self.tan)
        y = (v @ self.up) / (z * self.tan)
        return (x + 1) / 2 * self.W, (1 - y) / 2 * self.H, z

    def screen_bounds(self, center, radius):
        px, py, z = self.project(center)
        if z <= 0.01:
            return 0, self.W, 0, self.H
        rpx = radius / (z * self.tan) / 2 * self.W * 1.35 + 2
        return (
            int(max(0, px - rpx)),
            int(min(self.W, px + rpx + 1)),
            int(max(0, py - rpx)),
            int(min(self.H, py + rpx + 1)),
        )


# --------------------------------------------------------------------------- lights
@dataclass
class Light:
    direction: np.ndarray  # towards the light
    color: np.ndarray
    intensity: float
    shadow: bool = True


DEFAULT_LIGHTS = [
    Light(normalize(np.array([-0.6, 0.7, 0.55], np.float32)), hexcol("#fff1e6"), 1.25, True),  # warm key, upper-left
    Light(normalize(np.array([0.85, 0.2, 0.5], np.float32)), hexcol("#ffd3e2"), 0.28, False),  # pink fill, right
    Light(normalize(np.array([0.3, 0.5, -0.9], np.float32)), hexcol("#ffffff"), 0.6, False),  # rim, behind
]


# --------------------------------------------------------------------------- render
def render(
    prims: list[Prim],
    cam: Camera,
    lights: list[Light] = DEFAULT_LIGHTS,
    ground_shadow: Optional[tuple] = None,
    shadow_softness: float = 5.0,
) -> Image.Image:
    """Render prims to an RGBA PIL image of size cam.size (supersampled by cam.ss)."""
    W, H = cam.W, cam.H
    t_best = np.full((H, W), INF, np.float32)
    owner = np.full((H, W), -1, np.int32)

    # primary visibility, culled to each primitive's screen-space bounds
    for i, p in enumerate(prims):
        x0, x1, y0, y1 = cam.screen_bounds(p.bc, p.br)
        if x1 <= x0 or y1 <= y0:
            continue
        D = cam.rays(x0, x1, y0, y1)
        O = np.broadcast_to(cam.eye, D.shape)
        t = p.hit(O, D).reshape(y1 - y0, x1 - x0)
        region = t_best[y0:y1, x0:x1]
        closer = t < region
        region[closer] = t[closer]
        owner[y0:y1, x0:x1][closer] = i

    hit = owner >= 0
    ys, xs = np.nonzero(hit)
    D_all = cam.rays(0, W, 0, H).reshape(H, W, 3)
    D = D_all[ys, xs]
    P = cam.eye + D * t_best[ys, xs][:, None]
    V = -D
    nh = P.shape[0]

    normal = np.zeros((nh, 3), np.float32)
    color = np.zeros((nh, 3), np.float32)
    ks = np.zeros(nh, np.float32)
    shin = np.ones(nh, np.float32)
    wrap = np.zeros(nh, np.float32)
    metal = np.zeros(nh, np.float32)
    own = owner[ys, xs]
    for i, p in enumerate(prims):
        m = own == i
        if not m.any():
            continue
        s = p.surface(P[m])
        normal[m], color[m], ks[m], shin[m], wrap[m], metal[m] = s.normal, s.color, s.ks, s.shin, s.wrap, s.metal

    # face normals towards the viewer (thin shells seen from behind)
    flip = np.einsum("ij,ij->i", normal, V) < 0
    normal[flip] *= -1

    # hemispheric ambient: soft pink bounce from below, white sky above
    sky, ground = hexcol("#ffffff"), hexcol("#f6c9d6")
    hemi = 0.5 + 0.5 * normal[:, 1:2]
    out = color * (ground * (1 - hemi) + sky * hemi) * 0.26

    for L in lights:
        ndl = normal @ L.direction
        diff = np.clip((ndl + wrap) / (1 + wrap), 0, 1)
        vis = np.ones(nh, np.float32)
        if L.shadow:
            vis = _shadow(prims, P + normal * 2e-3, L.direction, own, (ys, xs), (H, W), shadow_softness * cam.ss)
            # soften the terminator a touch
        Hh = normalize(L.direction[None] + V)
        spec = np.clip(np.einsum("ij,ij->i", normal, Hh), 0, 1) ** shin * ks
        spec_col = (1 - metal[:, None]) * L.color + metal[:, None] * color * 1.6
        out += (color * L.color * diff[:, None] + spec_col * spec[:, None]) * L.intensity * vis[:, None]

    # fresnel rim to separate the subject from the cream page
    fres = (1 - np.clip(np.einsum("ij,ij->i", normal, V), 0, 1)) ** 4
    out += fres[:, None] * hexcol("#fff0f5") * 0.18

    # filmic-ish shoulder so whites stay creamy rather than clipping
    out = out * 1.08 / (1 + 0.28 * out)

    rgb = np.zeros((H, W, 3), np.float32)
    rgb[ys, xs] = out
    alpha = hit.astype(np.float32)

    # downsample (box filter in linear space, premultiplied)
    ss = cam.ss
    rgb_p = rgb * alpha[..., None]
    rgb_p = rgb_p.reshape(cam.size, ss, cam.size, ss, 3).mean((1, 3))
    a = alpha.reshape(cam.size, ss, cam.size, ss).mean((1, 3))
    rgb_s = np.where(a[..., None] > 1e-4, rgb_p / np.maximum(a[..., None], 1e-4), 0)

    img = np.dstack([lin_to_srgb(rgb_s), a])
    obj = Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")

    if ground_shadow is None:
        return obj

    # soft contact shadow composited underneath (alpha-only, warm charcoal tint)
    cx, cy, rx, ry, strength, blur = ground_shadow
    sh = Image.new("L", obj.size, 0)
    from PIL import ImageDraw

    ImageDraw.Draw(sh).ellipse(
        [cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * strength)
    )
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    shadow_rgba = Image.new("RGBA", obj.size, (92, 52, 66, 0))
    shadow_rgba.putalpha(sh)
    return Image.alpha_composite(shadow_rgba, obj)


def _shadow(prims, P, Ldir, own, idx, shape, blur_px):
    n = P.shape[0]
    occl = np.zeros(n, bool)
    Ld = np.broadcast_to(Ldir, P.shape)
    for i, p in enumerate(prims):
        if not p.casts_shadow:
            continue
        # cheap bounding-sphere reject before the exact test
        oc = P - p.bc
        b = oc @ Ldir
        c = np.einsum("ij,ij->i", oc, oc) - p.br * p.br
        cand = (~occl) & ((b < 0) | (c < 0)) & (b * b - c > 0) & (own != i)
        if not cand.any():
            continue
        t = p.hit(P[cand], Ld[cand])
        hit_idx = np.nonzero(cand)[0][t < INF]
        occl[hit_idx] = True

    # screen-space blur of the shadow mask fakes an area light (soft penumbra)
    H, W = shape
    m = np.ones((H, W), np.float32)
    m[idx] = 1 - occl.astype(np.float32) * 0.82
    img = Image.fromarray((m * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(blur_px))
    return np.asarray(img, np.float32)[idx] / 255.0


def save_webp(img: Image.Image, path: str, size: Optional[int] = None, quality: int = 82):
    if size and img.size[0] != size:
        img = img.resize((size, size), Image.LANCZOS)
    img.save(path, "WEBP", quality=quality, method=6, alpha_quality=90)
