#!/usr/bin/env python3
"""Simple studio-style mesh renderer (numpy z-buffer). Output WebP/PNG."""
from __future__ import annotations
import math
from pathlib import Path
import numpy as np
from PIL import Image

BG = np.array([176, 176, 176], dtype=np.float32)

def load_stl(path):
    import struct
    data = Path(path).read_bytes()
    if data[:5] == b"solid" and b"facet" in data[:200]:
        verts, faces = [], []
        for line in data.decode("latin1", "replace").splitlines():
            p = line.strip().split()
            if p[:1] == ["vertex"]:
                verts.append([float(p[1]), float(p[2]), float(p[3])])
        v = np.array(verts, dtype=np.float32)
        if len(v) % 3:
            raise ValueError(path)
        f = np.arange(len(v), dtype=np.int32).reshape(-1, 3)
        return v, f
    n = struct.unpack_from("<I", data, 80)[0]
    verts = np.zeros((n * 3, 3), np.float32)
    off = 84
    for i in range(n):
        # skip normal (12) then 3 verts
        verts[i * 3] = np.frombuffer(data, np.float32, 3, off + 12)
        verts[i * 3 + 1] = np.frombuffer(data, np.float32, 3, off + 24)
        verts[i * 3 + 2] = np.frombuffer(data, np.float32, 3, off + 36)
        off += 50
    f = np.arange(n * 3, dtype=np.int32).reshape(-1, 3)
    return verts, f

def load_mesh(path):
    path = str(path)
    if path.lower().endswith(".stl"):
        return load_stl(path)
    import trimesh
    m = trimesh.load(path, force="mesh")
    if not isinstance(m, trimesh.Trimesh):
        m = m.dump(concatenate=True)
    return np.asarray(m.vertices, np.float32), np.asarray(m.faces, np.int32)

def look_at(eye, target, up):
    f = target - eye
    f = f / (np.linalg.norm(f) + 1e-9)
    u = up / (np.linalg.norm(up) + 1e-9)
    s = np.cross(f, u)
    s = s / (np.linalg.norm(s) + 1e-9)
    u = np.cross(s, f)
    M = np.eye(4, dtype=np.float32)
    M[0, :3] = s
    M[1, :3] = u
    M[2, :3] = -f
    M[0, 3] = -np.dot(s, eye)
    M[1, 3] = -np.dot(u, eye)
    M[2, 3] = np.dot(f, eye)
    return M

def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], dtype=np.float32)

def render(parts, dest, size=(1600, 1200), azim=38, elev=24, roll=0, pad=1.22, samples=2):
    """parts: list of (vertices, faces, hex_color)"""
    W, H = size[0] * samples, size[1] * samples
    all_v, all_f, all_c = [], [], []
    base = 0
    for v, f, col in parts:
        all_v.append(v)
        all_f.append(f + base)
        all_c.append(np.repeat(hex_rgb(col)[None, :], len(f), 0))
        base += len(v)
    V = np.vstack(all_v)
    F = np.vstack(all_f)
    C = np.vstack(all_c)
    mn, mx = V.min(0), V.max(0)
    center = (mn + mx) * 0.5
    span = float(np.linalg.norm(mx - mn) * 0.5)
    if span < 1e-4:
        span = 1.0
    az, el, rl = map(math.radians, (azim, elev, roll))
    # camera on a sphere
    dist = span * 3.15
    eye = center + np.array([
        dist * math.cos(el) * math.sin(az),
        -dist * math.cos(el) * math.cos(az),
        dist * math.sin(el),
    ], dtype=np.float32)
    up = np.array([0, 0, 1], dtype=np.float32)
    M = look_at(eye, center, up)
    if roll:
        R = np.eye(4, dtype=np.float32)
        c, s = math.cos(rl), math.sin(rl)
        R[0, 0], R[0, 1], R[1, 0], R[1, 1] = c, -s, s, c
        M = R @ M
    # to camera
    vh = np.c_[V, np.ones(len(V), np.float32)]
    vc = (M @ vh.T).T[:, :3]
    # perspective
    fov = math.radians(28)
    f = 0.5 * H / math.tan(fov * 0.5)
    # fit object in frame
    # first pass: project, scale f so it fits
    z = np.clip(-vc[:, 2], 1e-4, None)
    x = vc[:, 0] * f / z
    y = vc[:, 1] * f / z
    # compute scale to fit
    xs, ys = x.max() - x.min(), y.max() - y.min()
    fit = min((W * 0.92) / max(xs, 1), (H * 0.86) / max(ys, 1)) / pad
    f *= fit
    x = vc[:, 0] * f / z
    y = vc[:, 1] * f / z
    px = x + W * 0.5
    py = -y + H * 0.52  # slightly above center, leave ground room
    # faces
    i0, i1, i2 = F[:, 0], F[:, 1], F[:, 2]
    p0 = np.stack([px[i0], py[i0], z[i0]], 1)
    p1 = np.stack([px[i1], py[i1], z[i1]], 1)
    p2 = np.stack([px[i2], py[i2], z[i2]], 1)
    # normals in world for lighting (after camera? world)
    e1 = V[i1] - V[i0]
    e2 = V[i2] - V[i0]
    n = np.cross(e1, e2)
    nn = np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
    n = n / nn
    # flip toward camera
    to_cam = eye - (V[i0] + V[i1] + V[i2]) / 3
    flip = np.sign(np.sum(n * to_cam, axis=1, keepdims=True))
    flip[flip == 0] = 1
    n = n * flip
    light = np.array([0.55, -0.35, 0.76], np.float32)
    light = light / np.linalg.norm(light)
    fill = np.array([-0.4, 0.5, 0.35], np.float32)
    fill = fill / np.linalg.norm(fill)
    ndl = np.clip(n @ light, 0, 1)
    ndf = np.clip(n @ fill, 0, 1)
    # rim
    view = to_cam / (np.linalg.norm(to_cam, axis=1, keepdims=True) + 1e-9)
    rim = np.clip(1 - np.sum(n * view, axis=1), 0, 1) ** 2
    shade = 0.18 + 0.72 * ndl + 0.18 * ndf + 0.08 * rim
    col = np.clip(C * shade[:, None], 0, 255)
    # z buffer raster
    img = np.full((H, W, 3), BG, dtype=np.float32)
    zbuf = np.full((H, W), np.inf, dtype=np.float32)
    # ground contact shadow first (projected onto z = mn[2])
    # skip if too costly; add soft ellipse later via compositing
    area = 0.5 * ((p1[:, 0] - p0[:, 0]) * (p2[:, 1] - p0[:, 1]) - (p2[:, 0] - p0[:, 0]) * (p1[:, 1] - p0[:, 1]))
    keep = np.abs(area) > 0.25
    p0, p1, p2, col, zf = p0[keep], p1[keep], p2[keep], col[keep], (p0[:, 2] + p1[:, 2] + p2[:, 2])[keep] / 3
    # rasterize
    minx = np.clip(np.floor(np.minimum(np.minimum(p0[:, 0], p1[:, 0]), p2[:, 0])).astype(np.int32), 0, W - 1)
    maxx = np.clip(np.ceil(np.maximum(np.maximum(p0[:, 0], p1[:, 0]), p2[:, 0])).astype(np.int32), 0, W - 1)
    miny = np.clip(np.floor(np.minimum(np.minimum(p0[:, 1], p1[:, 1]), p2[:, 1])).astype(np.int32), 0, H - 1)
    maxy = np.clip(np.ceil(np.maximum(np.maximum(p0[:, 1], p1[:, 1]), p2[:, 1])).astype(np.int32), 0, H - 1)
    a01x, a01y = p1[:, 0] - p0[:, 0], p1[:, 1] - p0[:, 1]
    a02x, a02y = p2[:, 0] - p0[:, 0], p2[:, 1] - p0[:, 1]
    den = a01x * a02y - a01y * a02x
    den[den == 0] = 1e-9
    ntri = len(p0)
    for i in range(ntri):
        x0, x1 = minx[i], maxx[i]
        y0, y1 = miny[i], maxy[i]
        if x1 < x0 or y1 < y0:
            continue
        xs = np.arange(x0, x1 + 1, dtype=np.float32) + 0.5
        ys = np.arange(y0, y1 + 1, dtype=np.float32) + 0.5
        # vectors from p0
        vx = xs[None, :] - p0[i, 0]
        vy = ys[:, None] - p0[i, 1]
        u = (vx * a02y[i] - vy * a02x[i]) / den[i]
        v = (vy * a01x[i] - vx * a01y[i]) / den[i]
        w = 1 - u - v
        mask = (u >= 0) & (v >= 0) & (w >= 0)
        if not mask.any():
            continue
        # interp z (1/z affine-ish: use barycentric of 1/z)
        iz = w / p0[i, 2] + u / p1[i, 2] + v / p2[i, 2]
        zz = 1.0 / np.clip(iz, 1e-8, None)
        sl_z = zbuf[y0:y1 + 1, x0:x1 + 1]
        nearer = mask & (zz < sl_z)
        if not nearer.any():
            continue
        sl_z[nearer] = zz[nearer]
        img[y0:y1 + 1, x0:x1 + 1][nearer] = col[i]
        if i % 40000 == 0 and i:
            print(f"  {i}/{ntri}", flush=True)
    # soft contact shadow: darken near projected footprint on the lower third
    # Downsample
    img = np.clip(img, 0, 255).astype(np.uint8)
    im = Image.fromarray(img, "RGB")
    if samples > 1:
        im = im.resize(size, Image.Resampling.LANCZOS)
    dest = Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.suffix.lower() == ".webp":
        im.save(dest, "WEBP", quality=90, method=6)
    else:
        im.save(dest)
    print("wrote", dest, im.size, dest.stat().st_size // 1024, "KB")
    return dest

def merge_dir(pattern, color):
    from glob import glob
    vs, fs, base = [], [], 0
    files = sorted(glob(pattern))
    if not files:
        raise FileNotFoundError(pattern)
    for p in files:
        v, f = load_mesh(p)
        vs.append(v)
        fs.append(f + base)
        base += len(v)
    return np.vstack(vs), np.vstack(fs), color

if __name__ == "__main__":
    out = Path("/workspace/projects/3d-store-site/site/assets/img/products")
    # Gyroscope — gold PLA, assembled + slightly posed
    print("gyro...")
    gdir = "/workspace/projects/gyroscope/out"
    gv, gf, gc = merge_dir(gdir + "/asm_*.stl", "#E4BD68")
    render([(gv, gf, gc)], out / "gyroscope-1.webp", azim=42, elev=26, pad=1.18)
    # a second angle
    render([(gv, gf, gc)], out / "gyroscope-2.webp", azim=-28, elev=18, pad=1.18)
    # Hideout — teak, entrance toward camera
    print("hideout...")
    hdir = "/workspace/projects/cat-hideout/out"
    # shells + dowels
    hv, hf, hc = merge_dir(hdir + "/asm_*.stl", "#8B5A2B")
    render([(hv, hf, hc)], out / "cat-hideout-1.webp", size=(1600, 1200), azim=48, elev=18, pad=1.15, samples=1)
    render([(hv, hf, hc)], out / "cat-hideout-2.webp", size=(1600, 1200), azim=140, elev=22, pad=1.15, samples=1)
    # Brake lever extender
    print("lever...")
    lv, lf = load_mesh("/workspace/projects/bike-brake-lever-extender/lever_extender.3mf")
    render([(lv, lf, "#FF8A1A")], out / "brake-extender-1.webp", azim=55, elev=52, pad=1.25)
    render([(lv, lf, "#FF8A1A")], out / "brake-extender-2.webp", azim=15, elev=12, pad=1.2)
    print("all done")
