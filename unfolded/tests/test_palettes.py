# Same scene, 4 palettes. blender -b --factory-startup -P test_palettes.py -- <palette> out.png
import sys, os, math, bpy
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import kit
from kit import P
name, out = sys.argv[sys.argv.index("--") + 1:][:2]
PAL = {
 "A_fresh_sky":   dict(top="#BFE3F2", hor="#FFF1DC", bench="#9FD3BE", hills=["#7FBFA8", "#A9D9C0", "#F4C9B0"], coat="#FBF6EA", acc="#F2705F", crease="#F2705F", key=(1.0, 0.95, 0.88), rim=(0.7, 0.85, 1.0), hair="#5A3B2E", bokeh=["#FFFFFF", "#F7C6C0", "#BFE3F2", "#FFE9A8"]),
 "B_dusk_indigo": dict(top="#232A5C", hor="#F28C6B", bench="#3B3F7A", hills=["#2B2F6B", "#5A4A8F", "#B8648A"], coat="#F3E9F5", acc="#FFB4A2", crease="#FF7F6B", key=(1.0, 0.78, 0.7), rim=(0.5, 0.6, 1.0), hair="#2A1A2E", bokeh=["#FFD6A5", "#FF9AA2", "#9AD1FF", "#FFF1C1"]),
 "C_sage_vintage": dict(top="#C9D6B8", hor="#F3E6D0", bench="#B7A27E", hills=["#8FA67F", "#B4C49B", "#E2D2A8"], coat="#F6F0E2", acc="#C96F5A", crease="#C96F5A", key=(1.0, 0.93, 0.8), rim=(0.8, 0.9, 0.8), hair="#4B3A2C", bokeh=["#F3E6D0", "#E7B9A4", "#C9D6B8", "#F2DC9B"]),
 "D_bold_toy":    dict(top="#12A4A0", hor="#FFE066", bench="#FF5D5D", hills=["#0B7A8C", "#16B7A8", "#FFD23F"], coat="#FFFFFF", acc="#FF5D5D", crease="#FF4D6D", key=(1.0, 0.97, 0.9), rim=(0.6, 0.95, 1.0), hair="#2B2B3A", bokeh=["#FFD23F", "#FF5D5D", "#7DF9FF", "#FFFFFF"]),
}
c = PAL[name]
kit.reset(samples=40); kit.golden_world(top=c["top"], horizon=c["hor"], strength=1.0)
kit.box("bench", (14, 6, 0.6), (0, 0, -0.3), kit.paper("bench", c["bench"], 0.9, 0.3), bevel=0.05)
kit.backdrop(((6, c["hills"][0]), (10, c["hills"][1]), (15, c["hills"][2])), width=60)
sci = kit.Character("Silver", (-1.9, 0.3, 0), body=c["coat"], outfit="coat", hair="tuft", hair_col=c["hair"], glasses=True, scale=1.7, accent=c["acc"])
sci.pose(armL=(0, 0, 8), armR=(-75, 0, -30), head=(0, 0, -8)); sci.set_mouth("o")
bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=1.5, location=(0.9, -0.6, 0.75), vertices=48); b = bpy.context.object; b.data.materials.append(kit.glossy("beaker", "#CFE8F2", 0.05, 0)); bpy.ops.object.shade_smooth()
kit.sphere("glue", 0.5, (0.9, -0.6, 0.45), kit.glossy("glue", "#FFF1B8", 0.12, 0.4), (1, 1, 0.7))
cr = kit.Crease3D((2.7, -1.3, 1.05), 1.1, color=c["crease"], mood="wince"); cr.root.rotation_euler = (0, 0, math.radians(-14))
kit.bokeh([(-5, 12, 6, c["bokeh"][0], 1.0), (6, 14, 8, c["bokeh"][1], 1.3), (1, 17, 9, c["bokeh"][2], 1.2), (-8, 16, 4, c["bokeh"][3], 1.0)])
t = kit.target((0.3, -0.3, 1.9))
d = [kit.area("key", (-6, -7, 9), 1500, c["key"], 5, t), kit.area("rim", (7, 5, 5), 450, c["rim"], 4, t), kit.area("fill", (2, -9, 4), 260, (1, 0.95, 0.9), 8, t)]
kit.camera((0.5, -7.2, 2.7), t, lens=34, fstop=2.0, focus=t)
kit.render(out)
