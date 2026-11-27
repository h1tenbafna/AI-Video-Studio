# Look test 1: origami world. blender -b --factory-startup -P look_origami.py -- out.png
import sys, os, math, random, bpy, bmesh
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import kit
from kit import P
out = sys.argv[sys.argv.index("--") + 1]
random.seed(3)
kit.reset(samples=48); kit.golden_world(top="#2B2F6B", horizon="#F29A7A", strength=1.0)
def flat(o):
    for p in o.data.polygons: p.use_smooth = False
def prim(kind, mat, loc, rot=(0, 0, 0), scale=(1, 1, 1), **kw):
    getattr(bpy.ops.mesh, f"primitive_{kind}_add")(location=loc, rotation=[math.radians(a) for a in rot], **kw)
    o = bpy.context.object; o.scale = scale; o.data.materials.append(mat); flat(o); return o
pm = lambda n, c: kit.paper(n, c, 0.85, 0.15)
# folded-paper ground: subdivided plane with random creases
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 4, 0)); g = bpy.context.object
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=9); bpy.ops.object.mode_set(mode="OBJECT")
for v in g.data.vertices: v.co.z += random.uniform(-0.12, 0.12)
g.data.materials.append(pm("ground", "#9DB88A")); flat(g)
# origami mountains and trees
for x, y, h, c in [(-7, 14, 7, "#5A4A8F"), (-1, 17, 9, "#3B3F7A"), (6, 15, 6.5, "#B8648A"), (11, 18, 8, "#5A4A8F")]:
    prim("cone", pm(f"m{x}", c), (x, y, h / 2), rot=(0, 0, 45), scale=(1, 1, 1), vertices=4, radius1=h * 0.8, depth=h)
for x, y, s in [(-5.2, 5, 1.0), (-4.2, 7, 1.3), (5.0, 6, 1.1), (6.2, 8.5, 1.4), (-6.5, 9, 1.5)]:
    prim("cone", pm(f"t{x}", "#4E8A6A"), (x, y, 1.1 * s), rot=(0, 0, 20), vertices=4, radius1=0.7 * s, depth=2.2 * s)
    prim("cone", pm(f"tt{x}", "#6FAF84"), (x, y, 2.0 * s), rot=(0, 0, 60), vertices=4, radius1=0.5 * s, depth=1.4 * s)
# bench: a folded paper table
prim("cube", pm("bench", "#F6F0E0"), (0.6, -0.2, 0.9), scale=(2.6, 1.3, 0.08))
for sx in (-1, 1): prim("cube", pm(f"leg{sx}", "#E8DCC4"), (0.6 + sx * 2.3, -0.2, 0.45), rot=(0, sx * 12, 0), scale=(0.08, 1.2, 0.45))
# origami scientist
W = pm("coat", "#F6F0E0"); S = pm("skin", "#F0C29C"); H = pm("hair", "#4A3226"); K = kit.glossy("bead", P["ink"], 0.1, 0)
prim("cone", W, (-1.9, 0.2, 1.2), rot=(0, 0, 45), vertices=4, radius1=0.95, radius2=0.25, depth=2.4)
prim("ico_sphere", S, (-1.9, 0.2, 2.75), subdivisions=1, radius=0.55)
prim("cone", H, (-1.9, 0.3, 3.25), rot=(-10, 0, 30), vertices=3, radius1=0.5, depth=0.5)
for sx in (-1, 1):
    prim("ico_sphere", K, (-1.9 + sx * 0.2, -0.27, 2.82), subdivisions=1, radius=0.07)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.15, minor_radius=0.025, location=(-1.9 + sx * 0.2, -0.32, 2.82), rotation=(math.pi / 2, 0, 0), major_segments=6, minor_segments=4)
    bpy.context.object.data.materials.append(K)
prim("cylinder", W, (-1.15, -0.1, 2.05), rot=(0, -60, 0), vertices=3, radius=0.16, depth=1.2)   # arm toward beaker
prim("cylinder", pm("flask", "#8CC4D8"), (-0.45, -0.15, 2.3), rot=(0, 120, 0), vertices=5, radius=0.22, depth=0.55)
# beaker + glue
prim("cylinder", kit.glossy("beaker", "#CFE8F2", 0.05, 0), (0.6, -0.3, 1.45), vertices=6, radius=0.42, depth=1.0)
prim("ico_sphere", kit.glossy("glue", "#FFF1B8", 0.12, 0.4), (0.6, -0.3, 1.2), subdivisions=2, radius=0.38, scale=(1, 1, 0.6))
cr = kit.Crease3D((2.7, -0.6, 1.7), 0.8, color="#E8685A", mood="wince"); cr.root.rotation_euler = (0, 0, math.radians(-15))
kit.bokeh([(-3, 22, 10, "#FFD6A5", 0.8), (4, 24, 12, "#FFF1C1", 0.6)])
t = kit.target((0.0, -0.2, 1.9)); kit.lights(t, 0.9)
kit.camera((0.4, -7.5, 3.2), t, lens=30, fstop=2.8, focus=t)
kit.render(out)
