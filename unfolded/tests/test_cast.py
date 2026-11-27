# Cast + lab test: scientist (felt) + Crease on a bench, golden light, depth. blender -b --factory-startup -P test_cast.py -- out.png
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import kit
from kit import P
out = sys.argv[sys.argv.index("--") + 1]
kit.reset(samples=64); kit.golden_world()
bench = kit.box("bench", (14, 6, 0.6), (0, 0, -0.3), kit.wood(), bevel=0.05)
kit.backdrop(((6, "#8A5E7A"), (10, "#C98A5E"), (15, "#F2A65A")), width=60)
sci = kit.Character("Silver", (-1.9, 0.3, 0), body=P["white"], outfit="coat", hair="tuft", hair_col="#4A3226", glasses=True, scale=1.7)
sci.pose(armL=(0, 0, 8), armR=(-75, 0, -30), head=(0, 0, -8)); sci.set_mouth("o")
# beaker with glowing glue
beaker = kit.glossy("beaker", P["sky"], 0.05, 0.0); beaker.blend_method = "BLEND" if hasattr(beaker, "blend_method") else None
import bpy
bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=1.5, location=(0.9, -0.6, 0.75), vertices=48); b = bpy.context.object; b.data.materials.append(beaker); bpy.ops.object.shade_smooth()
kit.sphere("glue", 0.5, (0.9, -0.6, 0.45), kit.glossy("glue", "#FFF1B8", 0.12, 0.4), (1, 1, 0.7))
crease = kit.Crease3D((2.7, -1.3, 1.05), 1.1, mood="wince"); crease.root.rotation_euler = (0, 0, math.radians(-14))
kit.bokeh([(-5, 12, 6, "#FFC93C", 1.0), (6, 14, 8, "#F2705F", 1.3), (1, 17, 9, "#8CC4D8", 1.2), (-8, 16, 4, "#FFE9A8", 1.0)])
t = kit.target((0.3, -0.3, 1.9)); kit.lights(t)
kit.camera((0.5, -7.2, 2.7), t, lens=34, fstop=2.0, focus=t)
kit.render(out)
