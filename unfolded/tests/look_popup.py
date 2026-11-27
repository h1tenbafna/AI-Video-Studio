# Look test 3: pop-up book. blender -b --factory-startup -P look_popup.py -- out.png
import sys, os, math, bpy, bmesh
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import kit
from kit import P
out = sys.argv[sys.argv.index("--") + 1]
kit.reset(samples=48); kit.golden_world(top="#1E2246", horizon="#6B4A6A", strength=0.6)
def card(name, pts, y, mat, thick=0.03, z0=0.0, x0=0.0):
    """flat cut-paper piece in the XZ plane at depth y"""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); vs = [bm.verts.new((x0 + x, y, z0 + z)) for x, z in pts]; bm.faces.new(vs); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); o.modifiers.new("s", "SOLIDIFY").thickness = thick; o.data.materials.append(mat); return o
def circle(r, n=28, cx=0, cz=0): return [(cx + r * math.cos(i / n * math.tau), cz + r * math.sin(i / n * math.tau)) for i in range(n)]
pm = lambda n, c: kit.paper(n, c, 0.88, 0.2)
kit.box("table", (30, 30, 0.5), (0, 6, -0.4), kit.wood("table", "#6B4A3A"), bevel=0.05)
# open book: two pages angled into a V plus a cover
kit.box("cover", (11.4, 7.6, 0.2), (0, 0, -0.05), pm("cover", "#B8484A"), bevel=0.05)
for sx in (-1, 1): kit.box(f"page{sx}", (5.4, 7.2, 0.12), (sx * 2.75, 0, 0.12), pm(f"pg{sx}", "#F6F0E0"), rot=(0, -sx * 4, 0), bevel=0.03)
# pop-up layers standing on the page (back to front)
wall = card("wall", [(-4, 0), (4, 0), (4, 4.2), (-4, 4.2)], 2.4, pm("wall", "#3B3F7A"))
card("window", [(-0.9, 0), (0.9, 0), (0.9, 1.6), (-0.9, 1.6)], 2.35, pm("win", "#F29A7A"), z0=2.0, x0=-2.2)
card("shelf", [(-1.6, 0), (1.6, 0), (1.6, 0.15), (-1.6, 0.15)], 2.33, pm("shelf", "#B88A5A"), z0=2.3, x0=2.0)
for i, c in enumerate(["#8CC4D8", "#F5B841", "#E8685A"]): card(f"jar{i}", [(-0.25, 0), (0.25, 0), (0.25, 0.7), (-0.25, 0.7)], 2.32, pm(f"j{i}", c), z0=2.45, x0=1.2 + i * 0.8)
# scientist cut-out (pieces stacked on a card)
y = 0.6
card("coat", [(-0.9, 0), (0.9, 0), (0.6, 2.2), (-0.6, 2.2)], y, pm("coat", "#F6F0E0"), x0=-1.6, z0=0.2)
card("head", circle(0.62), y - 0.04, pm("skin", "#F0C29C"), x0=-1.6, z0=3.0)
card("hair", [(math.cos(a) * 0.66, math.sin(a) * 0.66) for a in [i / 16 * math.pi for i in range(17)]], y - 0.07, pm("hair", "#4A3226"), x0=-1.6, z0=3.2)
for sx in (-1, 1):
    card(f"lens{sx}", circle(0.18, 16), y - 0.08, pm(f"gl{sx}", "#1B2B30"), x0=-1.6 + sx * 0.24, z0=3.05)
    card(f"lensin{sx}", circle(0.12, 16), y - 0.1, pm(f"gli{sx}", "#F0C29C"), x0=-1.6 + sx * 0.24, z0=3.05)
card("arm", [(0, 0), (1.5, 0.5), (1.5, 0.75), (0, 0.3)], y - 0.05, pm("arm", "#EDE3CF"), x0=-1.2, z0=1.9)
# beaker + glue cut-outs
card("beaker", [(-0.5, 0), (0.5, 0), (0.6, 1.4), (-0.6, 1.4)], y - 0.3, pm("bk", "#8CC4D8"), x0=0.9, z0=0.2)
card("glue", [(-0.45, 0), (0.45, 0), (0.48, 0.6), (-0.48, 0.6)], y - 0.33, pm("gl", "#FFF1B8"), x0=0.9, z0=0.25)
# V-fold tabs that hold the layers
for x in (-3.0, 3.0): kit.box(f"tab{x}", (0.5, 1.8, 0.02), (x, 1.5, 0.6), pm(f"tab{x}", "#E8DCC4"), rot=(55, 0, 0), bevel=0.01)
cr = kit.Crease3D((3.4, -1.6, 0.85), 0.7, color="#E8685A", mood="smile")
t = kit.target((0.0, 0.8, 1.8)); kit.lights(t, 1.1)
kit.area("lamp", (-3, -4, 7), 900, (1.0, 0.8, 0.6), 2, t)
kit.camera((0.6, -9.5, 5.2), t, lens=32, fstop=3.5, focus=t)
kit.render(out)
