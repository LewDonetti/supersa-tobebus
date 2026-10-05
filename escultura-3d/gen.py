"""Procedural SDF sculpture of the bronze statue (front + invented back).
Units: mm. z up, -y is the front (viewer side), x to the viewer's right."""
import math, sys, time
import numpy as np
from scipy import ndimage
from skimage import measure
import trimesh

H = float(sys.argv[1]) if len(sys.argv) > 1 else 0.6
LO = np.array([-94., -64., -3.])
HI = np.array([84., 64., 262.])
xs = np.arange(LO[0], HI[0] + 1e-6, H, dtype=np.float32)
ys = np.arange(LO[1], HI[1] + 1e-6, H, dtype=np.float32)
zs = np.arange(LO[2], HI[2] + 1e-6, H, dtype=np.float32)
N = np.array([len(xs), len(ys), len(zs)])
F = np.full(tuple(N), 40.0, np.float32)
rng = np.random.default_rng(7)
T0 = time.time()


def P(u, v, y=0.0):
    """image pixel -> world mm"""
    return np.array([(u - 547) * 0.17, y, (1505 - v) * 0.17])


def nrm(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


# ---------------------------------------------------------------- field ops
def idx(bmin, bmax):
    i0 = np.maximum(0, np.floor((np.asarray(bmin) - LO) / H).astype(int))
    i1 = np.minimum(N, np.ceil((np.asarray(bmax) - LO) / H).astype(int) + 1)
    if np.any(i1 <= i0):
        return None
    return tuple(slice(a, b) for a, b in zip(i0, i1))


def grid(sl):
    return (xs[sl[0]][:, None, None], ys[sl[1]][None, :, None], zs[sl[2]][None, None, :])


def smin(a, b, k):
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b + (a - b) * h - k * h * (1 - h)


class Group:
    """Accumulates primitives into a temp block, then merges into F."""

    def __init__(self, k_inner=0.0):
        self.prims = []
        self.k = k_inner

    def add(self, bmin, bmax, fn):
        self.prims.append((np.asarray(bmin, float), np.asarray(bmax, float), fn))
        return self

    def build(self, pad):
        bmin = np.min([p[0] for p in self.prims], 0) - pad
        bmax = np.max([p[1] for p in self.prims], 0) + pad
        sl = idx(bmin, bmax)
        D = np.full(tuple(s.stop - s.start for s in sl), 40.0, np.float32)
        for a, b, fn in self.prims:
            s2 = idx(a, b)
            if s2 is None:
                continue
            s2 = tuple(slice(max(x.start, y.start), min(x.stop, y.stop)) for x, y in zip(s2, sl))
            if any(s.stop <= s.start for s in s2):
                continue
            loc = tuple(slice(x.start - y.start, x.stop - y.start) for x, y in zip(s2, sl))
            X, Y, Z = grid(s2)
            D[loc] = smin(D[loc], fn(X, Y, Z).astype(np.float32), self.k)
        return sl, D

    def union(self, k=0.0):
        if not self.prims:
            return
        sl, D = self.build(k + 1)
        if not np.isfinite(D).all():
            import traceback; print('NONFINITE in group', [(s.start*H+LO[i], s.stop*H+LO[i]) for i, s in enumerate(sl)]); traceback.print_stack(limit=3)
            D = np.nan_to_num(D, nan=40.0, posinf=40.0, neginf=40.0)
        F[sl] = smin(F[sl], D, k)

    def carve(self, k=0.0):
        sl, D = self.build(k + 1)
        F[sl] = -smin(-F[sl], D, k)


def add(bmin, bmax, fn, k=0.0):
    Group().add(bmin, bmax, fn).union(k)


def sample(p):
    c = ((np.atleast_2d(p) - LO) / H).T
    return ndimage.map_coordinates(F, c, order=1, mode="nearest")


def snap(origin, d, off=0.0, maxlen=60):
    """walk from inside `origin` along d until leaving the surface"""
    d = nrm(d)
    t = np.arange(0, maxlen, H * 0.5)
    pts = origin[None] + t[:, None] * d[None]
    v = sample(pts)
    out = np.where(v > 0)[0]
    i = out[0] if len(out) else len(t) - 1
    return pts[i] + d * off


# ---------------------------------------------------------------- primitives
def f_sphere(c, r):
    c = np.asarray(c, float)
    return c - r, c + r, lambda X, Y, Z: np.sqrt((X - c[0]) ** 2 + (Y - c[1]) ** 2 + (Z - c[2]) ** 2) - r


def rot_local(X, Y, Z, c, R):
    """R: 3x3 whose ROWS are local axes in world coords"""
    dx, dy, dz = X - c[0], Y - c[1], Z - c[2]
    return (R[0, 0] * dx + R[0, 1] * dy + R[0, 2] * dz,
            R[1, 0] * dx + R[1, 1] * dy + R[1, 2] * dz,
            R[2, 0] * dx + R[2, 1] * dy + R[2, 2] * dz)


def f_ellipsoid(c, r, R=None):
    c = np.asarray(c, float); r = np.asarray(r, float)
    m = r.max()

    def fn(X, Y, Z):
        if R is None:
            lx, ly, lz = X - c[0], Y - c[1], Z - c[2]
        else:
            lx, ly, lz = rot_local(X, Y, Z, c, R)
        k0 = np.sqrt((lx / r[0]) ** 2 + (ly / r[1]) ** 2 + (lz / r[2]) ** 2)
        k1 = np.sqrt((lx / r[0] ** 2) ** 2 + (ly / r[1] ** 2) ** 2 + (lz / r[2] ** 2) ** 2) + 1e-6
        return k0 * (k0 - 1) / k1
    return c - m, c + m, fn


def seg(X, Y, Z, a, b):
    ba = b - a
    L2 = float(ba @ ba) + 1e-9
    px, py, pz = X - a[0], Y - a[1], Z - a[2]
    t = np.clip((px * ba[0] + py * ba[1] + pz * ba[2]) / L2, 0, 1)
    dx, dy, dz = px - t * ba[0], py - t * ba[1], pz - t * ba[2]
    return dx, dy, dz, t


def f_capsule(a, b, r0, r1=None):
    a = np.asarray(a, float); b = np.asarray(b, float)
    r1 = r0 if r1 is None else r1
    m = max(r0, r1)

    def fn(X, Y, Z):
        dx, dy, dz, t = seg(X, Y, Z, a, b)
        return np.sqrt(dx * dx + dy * dy + dz * dz) - (r0 + (r1 - r0) * t)
    return np.minimum(a, b) - m, np.maximum(a, b) + m, fn


def f_torus(c, axis, R, r):
    c = np.asarray(c, float); ax = nrm(axis)

    def fn(X, Y, Z):
        qx, qy, qz = X - c[0], Y - c[1], Z - c[2]
        h = qx * ax[0] + qy * ax[1] + qz * ax[2]
        rad = np.sqrt(np.maximum(qx * qx + qy * qy + qz * qz - h * h, 0))
        return np.sqrt((rad - R) ** 2 + h * h) - r
    return c - R - r, c + R + r, fn


def tube(g, pts, rads):
    pts = np.asarray(pts, float); rads = np.broadcast_to(np.asarray(rads, float), (len(pts),))
    for i in range(len(pts) - 1):
        g.add(*f_capsule(pts[i], pts[i + 1], rads[i], rads[i + 1]))
    return g


def ribbon(g, pts, widths, thick, normals):
    """flat band; `normals` = thin direction per point"""
    pts = np.asarray(pts, float)
    widths = np.broadcast_to(np.asarray(widths, float), (len(pts),))
    normals = np.asarray(normals, float)
    if normals.ndim == 1:
        normals = np.tile(normals, (len(pts), 1))
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        t = nrm(b - a)
        n = normals[i] - (normals[i] @ t) * t
        n = nrm(n)
        bb = np.cross(t, n)
        w0, w1 = max(widths[i], 0.05), max(widths[i + 1], 0.05)
        m = max(w0, w1, thick)

        def fn(X, Y, Z, a=a, b=b, t=t, n=n, bb=bb, w0=w0, w1=w1):
            dx, dy, dz, s = seg(X, Y, Z, a, b)
            qn = dx * n[0] + dy * n[1] + dz * n[2]
            qb = dx * bb[0] + dy * bb[1] + dz * bb[2]
            qt = dx * t[0] + dy * t[1] + dz * t[2]
            w = w0 + (w1 - w0) * s
            th = min(thick, min(w0, w1))
            return (np.sqrt((qn / thick) ** 2 + (qb / w) ** 2 + (qt / w) ** 2) - 1) * th
        g.add(np.minimum(a, b) - m, np.maximum(a, b) + m, fn)
    return g


def catmull(ctrl, n=60):
    c = np.asarray(ctrl, float)
    c = np.vstack([2 * c[0] - c[1], c, 2 * c[-1] - c[-2]])
    out = []
    segs = len(c) - 3
    for i in range(segs):
        p0, p1, p2, p3 = c[i:i + 4]
        for t in np.linspace(0, 1, max(2, n // segs), endpoint=(i == segs - 1)):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return np.array(out)


def rodrigues(v, axis, ang):
    k = nrm(axis)
    return v * math.cos(ang) + np.cross(k, v) * math.sin(ang) + k * (k @ v) * (1 - math.cos(ang))


def frame_from_up(up):
    up = nrm(up)
    a = np.array([0, 0, 1.0]) if abs(up[2]) < 0.9 else np.array([1.0, 0, 0])
    x = nrm(np.cross(a, up))
    y = np.cross(up, x)
    return np.array([x, y, up])  # rows = local axes


def log(msg):
    print(f"[{time.time() - T0:6.1f}s] {msg}", flush=True)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ================================================================ BASE
def base():
    def fn(X, Y, Z):
        r = np.sqrt(X * X + Y * Y)
        th = np.arctan2(Y, X)
        rough = 0.5 * np.sin(3.1 * X + 1.3 * np.sin(0.4 * Y)) * np.sin(2.7 * Y) + 0.35 * np.sin(1.3 * th * 9 + 0.2 * r)
        top = 9.5 + rough * smoothstep(40, 52, r) * 0 + 0.6 * np.sin(0.35 * X) * np.cos(0.3 * Y)
        dside = r - (56 + 0.4 * np.sin(th * 23))
        dz = np.maximum(Z - top, -Z)
        e = np.maximum(dside, dz)
        return e - 0.0
    add((-58, -58, -1), (58, 58, 12), fn, 0)
    # bevel rim
    add(*f_torus((0, 0, 9.5), (0, 0, 1), 55.2, 1.1), k=0.8)
    add(*f_torus((0, 0, 0.9), (0, 0, 1), 56.0, 0.9), k=0.5)
    # rocky top surface lumps
    g = Group()
    for i in range(70):
        a = rng.uniform(0, 2 * math.pi); rr = 52 * math.sqrt(rng.uniform(0.02, 1))
        c = (rr * math.cos(a), rr * math.sin(a), 9.2)
        g.add(*f_ellipsoid(c, (rng.uniform(3, 7), rng.uniform(3, 7), rng.uniform(1.0, 2.2))))
    g.union(1.5)


# ================================================================ WAVES
def spiral_path(c, u, v, r0, r1, turns, a0, n=90):
    A = 2 * math.pi * turns
    k = math.log(r0 / r1) / A
    a = np.linspace(0, A, n)
    r = r0 * np.exp(-k * a)
    pts = c[None] + r[:, None] * (np.cos(a0 + a)[:, None] * u[None] + np.sin(a0 + a)[:, None] * v[None])
    return pts, r


def wave(anchor, c, u, v, r0, r1, turns, a0, strands=4, sep=3.6, rad=3.3, lead=None):
    c = np.asarray(c, float); u = nrm(u); v = nrm(v)
    w = nrm(np.cross(u, v))
    sp, r = spiral_path(c, u, v, r0, r1, turns, a0)
    tang = nrm(sp[1] - sp[0])
    anchor = np.asarray(anchor, float)
    L = np.linalg.norm(sp[0] - anchor)
    ctrl = [anchor, anchor + (sp[0] - anchor) * 0.45 + np.array([0, 0, 0.15 * L]) - tang * 0.25 * L, sp[0] - tang * 0.15 * L]
    if lead is not None:
        ctrl = [np.asarray(q, float) for q in lead] + ctrl
    tail = catmull(ctrl, 40)
    path = np.vstack([tail[:-1], sp])
    scale = np.concatenate([np.ones(len(tail) - 1) * 1.05, 0.45 + 0.6 * r / r0])
    g = Group()
    for j in range(strands):
        off = (j - (strands - 1) / 2) * sep
        # twist the band a little along the path
        tw = np.sin(np.linspace(0, 2.5, len(path)))[:, None] * 0.6
        pts = path + (off + tw) * w[None]
        tube(g, pts, rad * scale * (1 - 0.12 * abs(j - (strands - 1) / 2)))
    g.union(0.5)
    return path


def waves():
    ez = np.array([0, 0, 1.0])
    # front-left large breaking curl
    wave((-8, -30, 9), (-37, -22, 48), (1, 0.15, 0), ez, 23, 3.4, 1.55, math.radians(-55), strands=5)
    # big right-hand surge climbing into the skirt billow
    wave((30, -20, 9), (52, -8, 64), (-1, 0.2, 0), ez, 17, 3.0, 1.35, math.radians(-110), strands=4)
    wave((-30, 10, 9), (-40, 14, 58), (0.2, -1, 0), ez, 16, 3.0, 1.4, math.radians(-70), strands=4)
    # upper left curl beneath the rose
    wave((-25, -12, 30), (-45, -10, 72), (1, 0.3, 0), ez, 13, 2.6, 1.35, math.radians(-75), strands=3)
    # front right low curl
    wave((18, -34, 9), (44, -26, 27), (-1, 0.1, 0), ez, 14, 2.8, 1.45, math.radians(-60), strands=3)
    # the swell under the feet (front centre) rising into the dress
    g = Group()
    path = catmull([(-30, -40, 10), (-15, -30, 22), (-5, -18, 40), (2, -9, 52), (14, -2, 58)], 60)
    for j in range(4):
        tube(g, path + (j - 1.5) * 3.3 * np.array([0.5, -0.7, 0.5]), 3.0 * np.linspace(1.1, 0.8, len(path)))
    g.union(0.6)
    # back of the base: invented curls wrapping around
    for phi, zc, r0, turns, mir in [(150, 40, 16, 1.4, 1), (105, 55, 19, 1.5, -1), (60, 38, 15, 1.3, 1), (125, 30, 14, 1.3, 1), (80, 70, 14, 1.4, 1),
                                    (20, 30, 12, 1.3, -1), (-20, 26, 11, 1.2, 1), (200, 28, 13, 1.3, -1)]:
        ph = math.radians(phi)
        e = np.array([math.cos(ph), math.sin(ph), 0])
        t = np.array([-math.sin(ph), math.cos(ph), 0]) * mir
        c = e * 36 + np.array([0, 0, zc])
        anchor = e * 48 - t * (r0 * 1.2) + np.array([0, 0, 9])
        wave(anchor, c, t, ez, r0, 2.8, turns, math.radians(-60), strands=3)
    # central water mound the figure rises from
    g = Group(4.0)
    g.add(*f_ellipsoid((4, 2, 14), (40, 34, 16)))
    g.add(*f_ellipsoid((6, 2, 34), (24, 20, 20)))
    g.union(3.0)
    g = Group()
    for j in range(5):
        th = np.linspace(0, 2 * math.pi, 160)
        rr = 38 - j * 6.5
        z = 13 + j * 5.0
        pts = np.stack([4 + rr * np.cos(th), 2 + 0.85 * rr * np.sin(th), z + 2.2 * np.sin(th * 6 + j)], 1)
        tube(g, pts, 2.2)
    g.union(1.5)
    # low sea swell ring on the base top
    g = Group()
    th = np.linspace(0, 2 * math.pi, 220)
    for j, (rr, amp) in enumerate([(49, 2.2), (44, 2.6)]):
        pts = np.stack([rr * np.cos(th), rr * np.sin(th), 11 + amp * np.sin(th * 9 + j * 1.7)], 1)
        tube(g, pts, 1.9)
    g.union(1.2)


# ================================================================ DRESS + LEGS
def dress():
    thw = math.radians(18)

    def gwind(th):
        return np.maximum(np.cos(th - thw), 0) ** 1.6

    zw, zh = 147.0, 47.0

    def hem(th):
        return zh + 26 * gwind(th) + 3 * np.sin(5 * th)

    def Rad(z, th):
        s = np.clip((zw - z) / (zw - zh), 0, 1.3)
        R = 10.5 + 5 * smoothstep(0, 0.18, s) + 14 * s ** 1.3
        R = R + 29 * s ** 1.8 * gwind(th)
        R = R + (0.6 + 3.0 * s) * np.sin(9 * th + 7 * s + 1.4 * np.sin(3 * th))
        return R

    def axis(z):
        s = np.clip((zw - z) / (zw - zh), 0, 1.3)
        return 5 + 3 * s, 0.8 + 2.5 * s

    th_ = 2.4

    def fn(X, Y, Z):
        cx, cy = axis(Z)
        dx, dy = X - cx, (Y - cy) / 0.82
        r = np.sqrt(dx * dx + dy * dy)
        th = np.arctan2(dy, dx)
        R = Rad(Z, th)
        shell = (np.abs(r - R + th_ / 2) - th_ / 2) * 0.72
        return np.maximum(np.maximum(shell, hem(th) - Z), Z - zw - 2)
    add((-50, -50, 40), (80, 55, 152), fn, 1.0)
    # rolled hem
    th = np.linspace(-math.pi, math.pi, 260)
    zz = hem(th) + 0.6
    R = Rad(zz, th) - th_ / 2
    cx, cy = axis(zz)
    pts = np.stack([cx + R * np.cos(th), cy + 0.82 * R * np.sin(th), zz], 1)
    tube(Group(), pts, 1.5).union(1.0)
    # inner fill near the top (hips area so the shell reads as solid cloth)
    add(*f_ellipsoid((5.5, 1.0, 120), (12, 9, 22)), k=3)


def legs():
    g = Group(1.5)
    # front leg (viewer's left) bent, knee pushing through the fabric
    hip, knee, ank = np.array([-1, -2, 128.]), np.array([-7, -14, 94.]), np.array([-5, -8, 58.])
    g.add(*f_capsule(hip, knee, 7.0, 5.0))
    g.add(*f_capsule(knee, ank, 4.8, 2.8))
    g.add(*f_ellipsoid((-5.5, -12, 53.5), (3.0, 6.5, 2.6)))
    hip2, knee2, ank2 = np.array([11, 2, 128.]), np.array([15, 3, 92.]), np.array([14, 6, 56.])
    g.add(*f_capsule(hip2, knee2, 7.0, 4.8))
    g.add(*f_capsule(knee2, ank2, 4.6, 2.8))
    g.add(*f_ellipsoid((14, 1, 52), (3.0, 6.5, 2.6)))
    g.union(2.5)
    # a few cloth folds wrapping the front leg
    g = Group()
    for i, z in enumerate(np.linspace(70, 118, 6)):
        t = (z - 58) / (128 - 58)
        c = np.array([-5 - 2 * (1 - abs(t - 0.55) * 2), -10 - 4 * (1 - abs(t - 0.55) * 2), z])
        pts = np.array([c + np.array([7 * math.cos(a), 4.5 * math.sin(a) - 1, -3 + 2.5 * math.cos(a) + i * 0.0]) for a in np.linspace(-0.6, 3.5, 14)])
        tube(g, pts, 0.9)
    g.union(1.2)


# ================================================================ TORSO / ARMS
S_L, E_L, W_L = np.array([-6, 2.5, 183.]), np.array([-21.5, 4, 204.]), np.array([-35.5, 4.5, 222.])
S_R, E_R, W_R = np.array([20, 2.5, 183.]), np.array([41, 4, 200.]), np.array([56.5, 4.5, 211.5])
HAND_L, HAND_R = np.array([-37.6, 4.5, 227.]), np.array([59.2, 4.5, 216.5])


def torso():
    g = Group(3.0)
    g.add(*f_ellipsoid((7, 0.8, 168), (11.0, 7.6, 13)))
    g.add(*f_ellipsoid((5.5, 0.8, 150), (8.6, 6.6, 10)))
    g.add(*f_ellipsoid((5, 1.0, 133), (13.0, 9.0, 10)))
    g.add(*f_capsule(S_L + [0, 0, -1], S_R + [0, 0, -1], 4.8))
    g.add(*f_sphere(S_L, 5.0)); g.add(*f_sphere(S_R, 5.0))
    # shoulder blades (back)
    g.add(*f_ellipsoid((0.5, 6.0, 173), (4.2, 1.6, 5.5)))
    g.add(*f_ellipsoid((13.5, 6.0, 173), (4.2, 1.6, 5.5)))
    g.union(3)
    g = Group(1.2)
    g.add(*f_ellipsoid((1.8, -6.6, 166.5), (5.0, 4.4, 4.6)))
    g.add(*f_ellipsoid((12.4, -6.6, 166.5), (5.0, 4.4, 4.6)))
    g.union(1.8)
    # spine groove on the back
    Group().add(*f_capsule((7, 8.6, 140), (7, 8.4, 178), 1.0)).carve(1.5)
    # neck
    add(*f_capsule((6.8, 1.5, 181), (7.0, 1.6, 194), 4.6, 4.0), k=2.5)


def arm(S, E, W, hand, flip):
    g = Group(2.0)
    g.add(*f_capsule(S, E, 4.9, 3.8))
    g.add(*f_capsule(E, W, 3.7, 2.6))
    ua = nrm(E - S)
    g.add(*f_ellipsoid(S + (E - S) * 0.45 + np.array([0, -1.2, 0]), (3.9, 3.9, 6.5), frame_from_up(ua)))
    fa = nrm(W - E)
    g.add(*f_ellipsoid(E + (W - E) * 0.3 + np.array([0, -0.4, 0]), (3.4, 3.0, 6.0), frame_from_up(fa)))
    g.union(2.0)
    # fist
    g = Group(1.0)
    g.add(*f_ellipsoid(hand, (3.0, 2.8, 3.4), frame_from_up(fa)))
    for i in range(4):
        c = hand + fa * (-1.8 + i * 1.25) + np.array([0, -2.2, 0])
        g.add(*f_capsule(c + np.array([-1.8 * flip, 0.6, 0]), c + np.array([1.8 * flip, 0.3, 0]), 0.85))
    g.add(*f_capsule(hand + np.array([1.5 * flip, -1.0, -2.2]), hand + np.array([0.3 * flip, -2.8, -0.2]), 0.9))
    g.union(1.0)
    # bracelets
    g = Group()
    for t, R, r in [(0.88, 2.9, 0.75), (0.80, 3.1, 0.7), (0.20, 4.4, 0.85)]:
        if t > 0.5:
            c = E + (W - E) * ((t - 0.5) * 2); ax = fa
        else:
            c = S + (E - S) * (t * 2 + 0.25); ax = ua
        g.add(*f_torus(c, ax, R, r))
    g.union(0.4)


# ================================================================ HEAD
YAW, PITCH = math.radians(16), math.radians(-22)
Rz = np.array([[math.cos(YAW), -math.sin(YAW), 0], [math.sin(YAW), math.cos(YAW), 0], [0, 0, 1]])
Rx = np.array([[1, 0, 0], [0, math.cos(PITCH), -math.sin(PITCH)], [0, math.sin(PITCH), math.cos(PITCH)]])
RH = Rz @ Rx            # local -> world
HC = np.array([7.0, 1.0, 199.5])


def HW(p):
    return HC + RH @ np.asarray(p, float)


RHT = RH.T  # rows are local axes in world


def head():
    def ell(c, r, k=1.5, carve=False):
        g = Group().add(*f_ellipsoid(HW(c), r, RHT))
        g.carve(k) if carve else g.union(k)
    ell((0, 1.2, 1.0), (7.4, 8.6, 9.2), 0)
    ell((0, -2.8, -3.2), (5.9, 6.0, 6.6), 2.0)
    ell((0, -6.4, -8.6), (2.4, 2.0, 1.8), 1.5)      # chin
    ell((4.0, -5.4, -1.8), (2.4, 2.0, 2.0), 1.5)     # cheekbones
    ell((-4.0, -5.4, -1.8), (2.4, 2.0, 2.0), 1.5)
    ell((0, -8.5, -1.3), (1.0, 1.4, 2.4), 0.9)     # nose
    ell((0, -9.1, -3.2), (1.3, 0.9, 0.7), 0.6)       # nose tip / nostrils
    ell((0, -8.0, -5.2), (2.4, 1.1, 0.75), 0.5)      # upper lip
    ell((0, -7.8, -6.3), (2.1, 1.1, 0.85), 0.5)      # lower lip
    Group().add(*f_capsule(HW((-2.2, -9.0, -5.75)), HW((2.2, -9.0, -5.75)), 0.25)).carve(0.3)
    for s in (-1, 1):
        ell((2.8 * s, -8.1, 0.9), (1.6, 1.1, 1.0), 0.8, carve=True)   # eye socket
        ell((2.8 * s, -7.25, 0.8), (1.35, 0.8, 0.75), 0.4)              # eyeball / lid
        ell((2.9 * s, -7.6, 2.6), (2.4, 1.0, 0.8), 1.0)              # brow
        ell((7.2 * s, 0.6, -0.8), (1.0, 2.0, 3.0), 1.0)              # ear
    # turban: stacked wraps, tilted back
    ax = RH @ nrm((0, 0.35, 1))
    g = Group(0.8)
    for c, R, r in [((0, 1.4, 5.2), 7.8, 2.2), ((0, 2.0, 8.2), 6.4, 2.2), ((0, 2.6, 10.6), 4.4, 2.0)]:
        g.add(*f_torus(HW(c), ax, R, r))
    for tilt in (0.45, -0.45):
        g.add(*f_torus(HW((0, 2.0, 8.0)), RH @ nrm((tilt, 0.3, 1)), 6.2, 1.3))
    g.add(*f_ellipsoid(HW((0, 2.4, 8.4)), (6.6, 7.6, 4.8), RHT))
    g.union(1.0)
    # crown blocks on the front of the turban
    g = Group(0.3)
    for i, a in enumerate(np.linspace(-0.9, 0.9, 5)):
        base_ = HW((5.6 * math.sin(a), -5.2 * math.cos(a) + 1.0, 10.0))
        top = HW((5.6 * math.sin(a), -5.2 * math.cos(a) + 1.4, 14.2 + (0.8 if i == 2 else 0)))
        g.add(*f_capsule(base_, top, 1.1))
    g.add(*f_torus(HW((0, 0.8, 10.0)), ax, 5.8, 0.7))
    g.union(0.8)
    # earrings
    g = Group()
    for s in (-1, 1):
        c = HW((7.7 * s, -0.2, -6.0)) + np.array([0, 0, -1.6])
        g.add(*f_torus(c, (0, 1, 0), 1.9, 0.45))
        g.add(*f_sphere(c, 0.9))
        g.add(*f_capsule(HW((7.4 * s, 0.2, -3.6)), c + np.array([0, 0, 1.9]), 0.35))
    g.union(0.2)


# ================================================================ HAIR
def strand(root, d0, T, L, amp, freq, phase, curl, r0=2.3, r1=0.6, n=40):
    p = np.array(root, float); d = nrm(d0); T = nrm(T)
    ds = L / n
    pts = [p.copy()]
    ax = nrm(np.cross(T, [0, 0.3, 1]) + 1e-3)
    for i in range(n):
        s = i / n
        d = nrm(d + (T - d) * 0.16)
        if s > 0.72:
            d = rodrigues(d, ax, curl * ds / L * 6)
        p = p + d * ds
        pts.append(p.copy())
    pts = np.array(pts)
    s = np.linspace(0, 1, len(pts))
    perp = nrm(np.cross(T, [0.2, 1, 0.1]))
    perp2 = nrm(np.cross(T, perp))
    pts += (amp * np.sin(2 * math.pi * freq * s + phase) * smoothstep(0, 0.25, s))[:, None] * perp2[None]
    pts += (0.4 * amp * np.cos(2 * math.pi * freq * 0.7 * s + phase))[:, None] * perp[None] * s[:, None]
    rads = r0 + (r1 - r0) * s ** 1.3
    return pts, rads


def hair():
    # solid volume behind the skull and down the nape
    g = Group(2.0)
    g.add(*f_ellipsoid(HW((0, 4.0, -1.0)), (8.6, 7.5, 10.5), RHT))
    g.add(*f_ellipsoid(HC + np.array([1.5, 8.0, -14]), (10, 5.5, 12)))
    g.union(2.0)
    g = Group(0.8)
    count = 0
    while count < 96:
        v = nrm(rng.normal(size=3))
        if v[1] < -0.05 or v[2] > 0.75:      # roots only on the back half (face stays clear)
            continue
        root = HW(np.array([7.2, 8.0, 8.8]) * v + np.array([0, 1.6, 1.0]))
        out = RH @ v
        sx = (RH @ v)[0]
        if sx < -0.35:                        # viewer-left: falls down beside the shoulder
            T = (-0.35, 0.45, -1.0); L = rng.uniform(42, 60); curl = -2.2
            d0 = nrm(out + np.array([0, 0.5, -0.3]))
        elif v[2] < -0.2 or rng.uniform() < 0.3:   # down the back, drifting right
            T = (0.55 + rng.uniform(0, 0.35), 0.6, -1.0); L = rng.uniform(55, 88); curl = 2.4
            d0 = nrm(out + np.array([0, 0.6, -0.3]))
        else:                                 # wind-blown mass to the viewer's right
            T = (1.0, 0.35 + rng.uniform(-0.1, 0.35), -0.3 - rng.uniform(0, 0.55)); L = rng.uniform(55, 82); curl = 2.6
            d0 = nrm(out + np.array([0.6, 0.6, 0]))
        pts, rads = strand(root, d0, T, L, rng.uniform(2.5, 5.0), rng.uniform(0.9, 1.7), rng.uniform(0, 6.3), curl,
                           r0=rng.uniform(3.0, 3.8), r1=rng.uniform(0.6, 1.0))
        tube(g, pts, rads)
        count += 1
    g.union(1.5)
    log(f"hair locks {count}")


# ================================================================ HELD ITEMS
def torch():
    a = np.array([-34.0, 4.5, 212.0]); b = np.array([-41.5, 4.5, 241.0])
    ax = nrm(b - a)
    g = Group(0.3)
    g.add(*f_capsule(a, b, 2.0))
    g.add(*f_sphere(a, 2.4))
    for z in np.linspace(0.58, 0.9, 5):
        g.add(*f_torus(a + (b - a) * z, ax, 2.15, 0.55))
    g.add(*f_torus(b, ax, 2.4, 0.9))
    g.union(0.5)
    # wrapped criss-cross binding (helix)
    t = np.linspace(0.58, 0.95, 60)
    u = nrm(np.cross(ax, [0, 1, 0])); v = np.cross(ax, u)
    pts = a[None] + (b - a)[None] * t[:, None] + 2.2 * (np.cos(t * 70)[:, None] * u + np.sin(t * 70)[:, None] * v)
    tube(Group(), pts, 0.45).union(0.3)
    # plume / horse-tail whisk: fanning wavy locks
    g = Group(0.3)
    top = b + ax * 1.0
    for i in range(42):
        ang = math.radians(rng.uniform(150, 212))
        d0 = np.array([math.cos(ang) * 0.6 - 0.35, rng.uniform(-0.25, 0.25), math.sin(ang) * 0.6 + 0.55])
        T = np.array([math.cos(ang), rng.uniform(-0.25, 0.25), math.sin(ang)])
        L = rng.uniform(32, 54)
        pts, rads = strand(top, d0, T, L, rng.uniform(1.5, 3.2), rng.uniform(1.2, 2.2), rng.uniform(0, 6), rng.choice([-1, 1]) * 2.4,
                           r0=rng.uniform(2.3, 3.0), r1=0.55, n=34)
        tube(g, pts, rads)
    g.union(0.8)


def sword():
    Pm = np.array([66.0, 4.5, 197.0]); G = np.array([56.6, 4.5, 221.5])
    ax = nrm(G - Pm)
    g = Group(0.3)
    g.add(*f_capsule(Pm, G, 1.5))
    g.add(*f_sphere(Pm, 2.4))
    for t in (0.15, 0.3, 0.45):
        g.add(*f_torus(Pm + (G - Pm) * t, ax, 1.55, 0.45))
    perp = nrm(np.cross(ax, [0, 1, 0]))
    g.add(*f_capsule(G - perp * 4.8, G + perp * 4.8, 1.15))
    g.add(*f_sphere(G - perp * 4.8, 1.5)); g.add(*f_sphere(G + perp * 4.8, 1.5))
    g.union(0.5)
    # curved machete blade, flat in the x-z plane
    tip = np.array([53.0, 4.5, 249.5])
    s = np.linspace(0, 1, 40)
    centre = G[None] + (tip - G)[None] * s[:, None]
    left = np.array([-1, 0, 0.0])
    w = np.where(s < 0.72, 1.9 + 1.6 * s, (1.9 + 1.6 * 0.72) * (1 - (s - 0.72) / 0.28) ** 0.8 + 0.15)
    centre = centre + left[None] * (0.9 * w - 1.6 * np.sin(math.pi * s))[:, None]
    centre[0] = G
    ribbon(Group(), centre + ax * 0.8, w, 0.75, np.array([0, 1.0, 0])).union(0.4)
    # fuller (groove) along the spine
    Group().add(*f_capsule(G + ax * 3 + np.array([0.6, -0.8, 0]), G + ax * 18 + np.array([-0.4, -0.8, 0]), 0.45)).carve(0.3)


# ================================================================ ACCESSORIES (snapped to surface)
def jewellery():
    g = Group()
    cen = np.array([6.9, 1.0, 180.0])
    # choker + long beaded necklace with drops
    for zt, ry, rr, n, rad, drop in [(186.5, 1.0, 1.0, 17, 0.95, 4), (183.5, 1.0, 1.0, 15, 1.25, 9)]:
        for i, a in enumerate(np.linspace(math.radians(-175), math.radians(-5), n)):
            z = zt - drop * math.sin(-a) ** 2
            o = np.array([cen[0], cen[1], z])
            d = np.array([math.cos(a), math.sin(a), -0.35 if drop > 5 else 0.0])
            p = snap(o, d, off=rad * 0.55)
            g.add(*f_sphere(p, rad))
            if drop > 5 and i % 3 == 1:
                q = p + np.array([0, -0.2, -2.6])
                q = snap(q - np.array([0, -4, 0]) * 1.0 + np.array([0, 3, 0]), (0, -1, 0.15), off=0.7)
                g.add(*f_ellipsoid(q, (0.8, 0.7, 1.6)))
                g.add(*f_capsule(p, q, 0.35))
    # back of the necklace (clasp)
    for a in np.linspace(math.radians(10), math.radians(170), 9):
        p = snap(np.array([cen[0], cen[1], 186.0]), (math.cos(a), math.sin(a), 0), off=0.5)
        g.add(*f_sphere(p, 0.9))
    g.union(0.3)
    # waist sash: twisted bands all the way round
    g = Group()
    for ph, zc in [(0, 143.5), (math.pi, 141.2)]:
        pts = []
        for a in np.linspace(-math.pi, math.pi, 90):
            z = zc + 1.0 * math.sin(2 * a + ph)
            pts.append(snap(np.array([5.5, 0.8, z]), (math.cos(a), math.sin(a) * 0.9, 0), off=0.6))
        tube(g, np.array(pts), 1.45)
    g.union(0.8)
    # knot at the viewer-left hip with bead strands and tassels
    knot = snap(np.array([0.0, -1.0, 142.5]), (-0.75, -0.66, 0), off=1.5)
    g = Group(0.6)
    g.add(*f_ellipsoid(knot, (2.6, 2.2, 3.0)))
    g.add(*f_ellipsoid(knot + np.array([-1.5, -1.0, -3.5]), (1.6, 1.4, 2.4)))
    g.union(1.0)
    g = Group()
    for j, (dx, L) in enumerate([(-2.5, 40), (0.5, 33), (3.0, 26), (-4.5, 22)]):
        last = knot
        for i, z in enumerate(np.arange(knot[2] - 3, knot[2] - L, -2.6)):
            o = np.array([knot[0] + 8 + dx, knot[1] + 9, z])
            p = snap(o, (-0.72, -0.69, 0), off=1.0)
            g.add(*f_sphere(p, 1.15 if i % 3 else 1.45))
            last = p
        cone = Group().add(*f_capsule(last + np.array([0, 0, -1]), last + np.array([0, 0, -5.5]), 1.6, 0.5))
        g.prims += cone.prims
    g.union(0.3)
    # chest wrap folds (dress bodice)
    g = Group()
    for k, (a0, a1, z0, z1) in enumerate([(-2.6, -0.5, 175, 158), (-2.8, -0.4, 170, 154), (-2.4, -0.9, 162, 151),
                                          (-0.6, -2.4, 176, 161), (-0.3, -2.7, 172, 157)]):
        pts = []
        for t in np.linspace(0, 1, 26):
            a = a0 + (a1 - a0) * t; z = z0 + (z1 - z0) * t
            pts.append(snap(np.array([6.5, 0.8, z]), (math.cos(a), math.sin(a), 0), off=0.1))
        tube(g, np.array(pts), 0.7)
    # bust band
    pts = [snap(np.array([6.5, 0.8, 161.5]), (math.cos(a), math.sin(a), 0), off=0.2) for a in np.linspace(-math.pi, math.pi, 70)]
    tube(g, np.array(pts), 0.9)
    g.union(0.8)


def ribbons():
    g = Group()
    for j, (ctrl, w) in enumerate([
        ([(8, 9, 146), (25, 14, 138), (42, 12, 128), (58, 16, 120), (70, 10, 104), (76, 15, 92)], 3.2),
        ([(10, 9, 143), (28, 16, 128), (45, 18, 118), (60, 12, 108), (66, 18, 96), (61, 22, 86)], 2.8),
        ([(-2, 6, 144), (-14, 14, 132), (-6, 24, 118), (12, 28, 110), (30, 24, 100)], 2.5),
    ]):
        pts = catmull(ctrl, 70)
        s = np.linspace(0, 1, len(pts))
        nrms = np.stack([np.sin(s * 5 + j), np.cos(s * 5 + j) * 0.6 + 0.3, np.cos(s * 3) * 0.5 + 0.2], 1)
        ribbon(g, pts, w * 1.7 * (1 - 0.55 * s) + 0.6, 0.85, nrms)
    g.union(1.0)


# ================================================================ ROSES
def rose(c, axis, s, leaves=3, seed=0):
    c = np.asarray(c, float)
    R = frame_from_up(axis)
    r_ = np.random.default_rng(seed)
    phases = r_.uniform(0, 6.3, 6)

    def fn(X, Y, Z):
        lx, ly, lz = rot_local(X, Y, Z, c, R)
        lx, ly, lz = lx / s, ly / s, lz / s
        rr = np.sqrt(lx * lx + ly * ly + lz * lz)
        th = np.arctan2(ly, lx)
        d = np.full(np.broadcast(lx, ly, lz).shape, 9.0, np.float32)
        for i in range(5):
            Ri = 0.24 + 0.19 * i
            beta = math.radians(38 + 16 * i)
            npet = [3, 4, 5, 5, 6][i]
            rim = Ri * math.cos(beta) + 0.12 * Ri * np.cos(npet * th + phases[i]) + 0.05
            sh = np.abs(rr - Ri) - 0.065
            di = np.maximum(sh, lz - rim)
            # petals of the outer layers curl outward at the rim
            d = np.minimum(d, di)
        d = np.maximum(d, -lz - 0.62)
        bud = np.sqrt((lx / 0.2) ** 2 + (ly / 0.2) ** 2 + ((lz - 0.05) / 0.3) ** 2) - 1
        d = np.minimum(d, bud * 0.2)
        cal = rr - 0.42
        d = np.minimum(d, np.maximum(cal, lz + 0.2))
        return d * s
    m = s * 1.25
    add(c - m, c + m, fn, k=0.8)
    # outer petal lips (curled edges)
    g = Group()
    for i in range(6):
        a = i * math.pi / 3 + phases[0]
        dirv = R[0] * math.cos(a) + R[1] * math.sin(a)
        p = c + dirv * s * 1.0 + R[2] * s * (-0.02)
        g.add(*f_ellipsoid(p, (s * 0.42, s * 0.42, s * 0.09), frame_from_up(nrm(R[2] * 0.7 + dirv * 0.5))))
    g.union(0.6)
    # leaves
    g = Group()
    for i in range(leaves):
        a = phases[1] + i * 2 * math.pi / leaves + 0.4
        dirv = R[0] * math.cos(a) + R[1] * math.sin(a)
        t = np.linspace(0, 1, 18)
        pts = c[None] + dirv[None] * (s * (0.75 + 1.25 * t))[:, None] + R[2][None] * (s * (-0.35 - 0.35 * t ** 2))[:, None]
        w = s * 0.5 * np.sin(np.pi * np.clip(t * 0.95 + 0.05, 0, 1)) ** 0.75 + 0.2
        ribbon(g, pts, w, 0.45, R[2])
    g.union(0.8)
    # leaf veins
    g = Group()
    for i in range(leaves):
        a = phases[1] + i * 2 * math.pi / leaves + 0.4
        dirv = R[0] * math.cos(a) + R[1] * math.sin(a)
        p0 = c + dirv * s * 0.9 + R[2] * (-s * 0.35 + 0.5)
        p1 = c + dirv * s * 1.9 + R[2] * (-s * 0.62 + 0.5)
        g.add(*f_capsule(p0, p1, 0.35))
    g.carve(0.3)


def roses():
    rose((-46, -22, 76), (-0.4, -0.85, 0.35), 11.0, seed=1)
    rose((37, -33, 46), (0.25, -0.9, 0.35), 13.5, seed=2)
    rose((13, -43, 24), (0.05, -0.85, 0.55), 11.5, seed=3)
    # invented ones on the back side
    rose((-28, 36, 30), (-0.35, 0.8, 0.5), 9.0, seed=4)
    rose((34, 33, 40), (0.4, 0.75, 0.5), 8.5, seed=5)
    rose((-46, 8, 22), (-0.9, 0.1, 0.45), 7.0, seed=6)


# ================================================================ BUILD
base(); log("base")
waves(); log("waves")
legs(); log("legs")
dress(); log("dress")
torso(); log("torso")
arm(S_L, E_L, W_L, HAND_L, -1); arm(S_R, E_R, W_R, HAND_R, 1); log("arms")
head(); log("head")
torch(); sword(); log("held items")
import os
if not os.environ.get('NOHAIR'): hair()
jewellery(); log("jewellery")
ribbons(); log("ribbons")
roses(); log("roses")

# subtle cast-bronze surface texture
Xg, Yg, Zg = xs[:, None, None], ys[None, :, None], zs[None, None, :]
for zi in range(0, len(zs), 64):
    sl = slice(zi, zi + 64)
    Z = zs[sl][None, None, :]
    F[:, :, sl] += 0.06 * (np.sin(1.7 * Xg + 2.3 * Z) * np.sin(2.1 * Yg - 1.3 * Z) + np.sin(3.1 * Xg - 2.6 * Yg + 1.9 * Z))
log("texture")

np.save("field_meta.npy", np.array([H]))
v, f, nrm_, _ = measure.marching_cubes(F, 0.0, spacing=(H, H, H))
v += LO
m = trimesh.Trimesh(v, f, process=True)
if m.volume < 0: m.invert()
log(f"marching cubes: {len(m.faces)} faces")
# keep only the main connected body (drop tiny floating bits)
parts = m.split(only_watertight=False)
parts = sorted(parts, key=lambda p: -len(p.faces))
keep = [p for p in parts if len(p.faces) > 2000]
log(f"components {len(parts)}, kept {len(keep)}: {[len(p.faces) for p in keep][:8]}")
m = trimesh.util.concatenate(keep)
trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=6)
m.export("raw.ply")
log("saved raw.ply")
