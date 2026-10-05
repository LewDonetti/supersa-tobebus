import trimesh, numpy as np, fast_simplification as fs
m = trimesh.load('raw.ply')
b = m.bounds; ext = b[1] - b[0]
print('raw extents', ext)
sz = 250.0 / ext[2]; sx = 150.0 / ext[0]; sy = (sz + sx) / 2
m.apply_translation([-(b[0][0] + b[1][0]) / 2, -(b[0][1] + b[1][1]) / 2, -b[0][2]])
m.apply_scale([sx, sy, sz])
print('scale x,y,z', sx, sy, sz, 'final extents', m.extents)
def dec(mesh, n):
    v, f = fs.simplify(mesh.vertices.astype(np.float32), mesh.faces, target_reduction=1 - n / len(mesh.faces))
    out = trimesh.Trimesh(v, f, process=True)
    return out
hi = dec(m, 650_000)
hi.export('Escultura_25x15cm.3mf')
lo = dec(m, 320_000)
lo.export('preview.ply')
# compact GLB for the web viewer (y-up)
g = lo.copy(); g.apply_transform(trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0]))
g.export('preview.glb')
print('faces hi/lo', len(hi.faces), len(lo.faces), 'watertight', hi.is_watertight, 'vol cm3', hi.volume / 1000)
