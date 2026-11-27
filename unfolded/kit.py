"""Unfolded kit (Blender 4.5, run inside blender -b). Reusable across the whole series.
Usage in a scene script:  import sys; sys.path.insert(0, "<repo>/unfolded"); import kit
Functions: reset(), setup_render(), golden_world(), felt(), paper(), glossy(), wood(), box(), Character, Crease3D, lights(), camera(), backdrop()
"""
import bpy, math, bmesh
from mathutils import Vector

P = {"honey": "#F5B841", "amber": "#E08A2E", "peach": "#F7C9A0", "cream": "#FBEFD5", "tealShadow": "#1F5560", "deepTeal": "#123B47",
     "coral": "#E8685A", "sky": "#8CC4D8", "sage": "#9DB88A", "plum": "#5B3E6B", "skin": "#F0C29C", "skin2": "#B5764F", "ink": "#1B2B30", "white": "#F6F0E0"}

def hexc(h, k=1.0):
    h = h.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: (c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4) * k
    return (f(r), f(g), f(b), 1)

def reset(res=(1080, 1920), samples=64):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    try: sc.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError: sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = res
    for k, v in dict(taa_render_samples=samples, use_raytracing=True, use_gtao=True, use_soft_shadows=True).items():
        try: setattr(sc.eevee, k, v)
        except Exception: pass
    names = bpy.types.ColorManagedViewSettings.bl_rna.properties["view_transform"].enum_items.keys()
    sc.view_settings.view_transform = "AgX" if "AgX" in names else "Filmic"
    try: sc.view_settings.look = "AgX - Medium High Contrast"
    except Exception: pass
    return sc

def golden_world(top="#6B4A6A", horizon="#F2A65A", strength=0.9):
    w = bpy.data.worlds.new("golden"); bpy.context.scene.world = w; w.use_nodes = True
    n = w.node_tree.nodes; l = w.node_tree.links; bg = n["Background"]
    tc = n.new("ShaderNodeTexCoord"); sp = n.new("ShaderNodeSeparateXYZ"); ramp = n.new("ShaderNodeValToRGB")
    l.new(tc.outputs["Generated"], sp.inputs[0]); l.new(sp.outputs["Z"], ramp.inputs[0])
    ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = hexc(horizon)
    ramp.color_ramp.elements[1].position = 0.75; ramp.color_ramp.elements[1].color = hexc(top)
    l.new(ramp.outputs["Color"], bg.inputs["Color"]); bg.inputs["Strength"].default_value = strength

def _bump(m, scale, strength, aniso=(1, 1, 1), dist=0.02):
    n = m.node_tree.nodes; l = m.node_tree.links; b = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = aniso
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = scale; nz.inputs["Detail"].default_value = 10
    bp = n.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = strength; bp.inputs["Distance"].default_value = dist
    l.new(tc.outputs["Object"], mp.inputs["Vector"]); l.new(mp.outputs["Vector"], nz.inputs["Vector"])
    l.new(nz.outputs["Fac"], bp.inputs["Height"]); l.new(bp.outputs["Normal"], b.inputs["Normal"])

def _set(b, name, v):
    try: b.inputs[name].default_value = v
    except Exception: pass

def felt(name, color, fuzz=0.9):
    """fuzzy wool felt: rough, sheen for the fuzz halo, fine fibre bump"""
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    _set(b, "Base Color", hexc(color)); _set(b, "Roughness", 1.0)
    _set(b, "Sheen Weight", fuzz); _set(b, "Sheen Roughness", 0.5); _set(b, "Sheen Tint", hexc(color, 1.6))
    _set(b, "Subsurface Weight", 0.15); _set(b, "Subsurface Radius", (0.3, 0.2, 0.1))
    _bump(m, 260, 0.55, dist=0.01); return m

def paper(name, color, rough=0.9, bump=0.25):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    _set(b, "Base Color", hexc(color)); _set(b, "Roughness", rough); _set(b, "Subsurface Weight", 0.08)
    _bump(m, 90, bump, aniso=(1, 14, 1)); return m

def glossy(name, color, rough=0.12, sss=0.3):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    _set(b, "Base Color", hexc(color)); _set(b, "Roughness", rough); _set(b, "Subsurface Weight", sss); _set(b, "Coat Weight", 0.5); return m

def wood(name="wood", color="#B88A5A"):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    _set(b, "Base Color", hexc(color)); _set(b, "Roughness", 0.55); _bump(m, 40, 0.2, aniso=(1, 1, 6)); return m

def _link(o):
    if o.name not in bpy.context.scene.collection.objects: bpy.context.scene.collection.objects.link(o)

def box(name, size, loc, mat, rot=(0, 0, 0), bevel=0.02):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2); o.rotation_euler = [math.radians(a) for a in rot]
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bm = o.modifiers.new("b", "BEVEL"); bm.width = bevel; bm.segments = 3
    o.data.materials.append(mat); return o

def sphere(name, r, loc, mat, scale=(1, 1, 1), parent=None, seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=seg // 2); o = bpy.context.object; o.name = name
    o.scale = scale; o.data.materials.append(mat); bpy.ops.object.shade_smooth()
    if parent: o.parent = parent  # locations are LOCAL to the parent (no inverse)
    return o

def capsule(name, r, length, mat, parent):
    """hangs along -Z from the parent pivot"""
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=length, location=(0, 0, -length / 2), vertices=32); c = bpy.context.object; c.name = name
    c.data.materials.append(mat); bpy.ops.object.shade_smooth(); c.parent = parent
    sphere(name + "_cap", r, (0, 0, 0), mat, parent=parent); return c

def empty(name, loc, parent=None):
    o = bpy.data.objects.new(name, None); _link(o); o.location = loc
    if parent: o.parent = parent
    return o

def curve(name, pts, radius, mat, parent=None):
    cd = bpy.data.curves.new(name, "CURVE"); cd.dimensions = "3D"; cd.bevel_depth = radius; cd.bevel_resolution = 4
    sp = cd.splines.new("POLY"); sp.points.add(len(pts) - 1)
    for p, (x, y, z) in zip(sp.points, pts): p.co = (x, y, z, 1)
    o = bpy.data.objects.new(name, cd); _link(o); o.data.materials.append(mat)
    if parent: o.parent = parent
    return o

class Character:
    """Felt character facing -Y (toward the default camera). Parametric cast member.
    outfit: 'coat' | 'robe' | 'sweater'; hair: 'tuft' | 'bun' | 'cap' | 'curly' | 'bald'; glasses: bool"""
    def __init__(self, name, loc=(0, 0, 0), skin=P["skin"], body=P["sky"], hair_col="#3A2A22", hair="tuft", outfit="sweater", glasses=False, scale=1.0, accent=P["coral"]):
        self.root = empty(name, loc); self.root.scale = (scale,) * 3
        R = self.root; fm = lambda n, c: felt(f"{name}_{n}", c)
        mskin, mbody, mhair, macc = fm("skin", skin), fm("body", body), fm("hair", hair_col), fm("acc", accent)
        bead = glossy(f"{name}_bead", P["ink"], 0.08, 0)
        sphere("torso", 0.5, (0, 0, 1.15), mbody, (1.0, 0.78, 1.15), R)
        if outfit == "coat":
            bpy.ops.mesh.primitive_cone_add(radius1=0.66, radius2=0.5, depth=1.05, location=(0, 0, 0.75), vertices=48); c = bpy.context.object
            c.data.materials.append(felt(f"{name}_coat", P["white"])); bpy.ops.object.shade_smooth(); c.parent = R
            sphere("collar", 0.3, (0, -0.02, 1.55), felt(f"{name}_collar", P["white"]), (1.2, 0.9, 0.35), R)
        if outfit == "robe":
            bpy.ops.mesh.primitive_cone_add(radius1=0.75, radius2=0.45, depth=1.55, location=(0, 0, 0.8), vertices=48); c = bpy.context.object
            c.data.materials.append(fm("robe", body)); bpy.ops.object.shade_smooth(); c.parent = R
            sphere("stole", 0.3, (0, -0.28, 1.4), macc, (0.5, 0.25, 1.2), R)
        sphere("scarf", 0.34, (0, -0.02, 1.62), macc, (1.25, 1.0, 0.4), R)
        for sx in (-1, 1):
            sphere(f"leg{sx}", 0.17, (sx * 0.22, 0, 0.35), fm("leg", P["deepTeal"]), (1, 1, 2.0), R)
            sphere(f"shoe{sx}", 0.2, (sx * 0.22, -0.1, 0.08), fm("shoe", P["plum"]), (1, 1.5, 0.7), R)
        self.head = empty("headpivot", (0, 0, 1.7), R)
        sphere("head", 0.52, (0, 0, 0.32), mskin, (1, 0.95, 0.98), self.head)
        sphere("nose", 0.07, (0, -0.5, 0.26), fm("nose", skin), (1, 1, 1), self.head)
        for sx in (-1, 1):
            sphere(f"eye{sx}", 0.065, (sx * 0.19, -0.46, 0.36), bead, (1, 0.5, 1.3), self.head)
            sphere(f"cheek{sx}", 0.1, (sx * 0.33, -0.4, 0.2), fm("cheek", P["coral"]), (1, 0.4, 0.7), self.head)
        self.brows = []
        for sx in (-1, 1):
            b = box(f"brow{sx}", (0.17, 0.05, 0.05), (sx * 0.19, -0.5, 0.5), mhair, bevel=0.02); b.parent = self.head; self.brows.append(b)
        self.mouth = None
        if hair == "tuft":
            for i, a in enumerate((-35, -10, 15, 40)):
                sphere(f"tuft{i}", 0.17, (math.sin(math.radians(a)) * 0.36, 0.02, 0.84 + 0.04 * (i % 2)), mhair, (1, 1, 1.3), self.head)
            sphere("hairbase", 0.5, (0, 0.1, 0.45), mhair, (1.02, 0.9, 0.72), self.head)
        elif hair == "cap":
            sphere("hairbase", 0.55, (0, 0.06, 0.45), mhair, (1.04, 0.98, 0.78), self.head)
        elif hair == "bun":
            sphere("hairbase", 0.52, (0, 0.08, 0.45), mhair, (1.03, 0.95, 0.75), self.head); sphere("bun", 0.2, (0, 0.2, 0.98), mhair, parent=self.head)
        elif hair == "curly":
            for i in range(14):
                a = i / 14 * math.tau; sphere(f"curl{i}", 0.14, (math.cos(a) * 0.42, 0.06 + math.sin(a) * 0.15, 0.55 + 0.25 * abs(math.sin(a * 1.5))), mhair, parent=self.head)
        if glasses:
            gm = glossy(f"{name}_glasses", P["ink"], 0.2, 0)
            for sx in (-1, 1):
                bpy.ops.mesh.primitive_torus_add(major_radius=0.14, minor_radius=0.02, location=(sx * 0.19, -0.5, 0.36), rotation=(math.pi / 2, 0, 0)); t = bpy.context.object
                t.data.materials.append(gm); t.parent = self.head
            box("bridge", (0.1, 0.03, 0.03), (0, -0.5, 0.38), gm).parent = self.head
        self.arms = {}
        for sx, key in ((-1, "L"), (1, "R")):
            piv = empty(f"arm{key}", (sx * 0.5, 0, 1.45), R); capsule(f"arm{key}_m", 0.11, 0.62, mbody, piv)
            hand = empty(f"hand{key}", (0, 0, -0.66), piv); sphere(f"mitten{key}", 0.15, (0, 0, 0), mskin, parent=hand); self.arms[key] = piv
        self.set_mouth("smile")
    def set_mouth(self, mood):
        if self.mouth: bpy.data.objects.remove(self.mouth, do_unlink=True)
        pts = []
        for i in range(9):
            t = i / 8 * 2 - 1; k = {"smile": -0.07, "frown": 0.06, "o": 0.0, "flat": 0.0}[mood]
            pts.append((t * 0.14, -0.5, 0.1 - k * (1 - t * t)))
        if mood == "o": pts = [(0.07 * math.cos(a), -0.5, 0.08 + 0.09 * math.sin(a)) for a in [i / 8 * math.tau for i in range(9)]]
        self.mouth = curve("mouth", pts, 0.022, glossy("mouthm", P["ink"], 0.3, 0), self.head)
    def pose(self, armL=(0, 0, 0), armR=(0, 0, 0), head=(0, 0, 0), brow=0):
        r = math.radians
        self.arms["L"].rotation_euler = [r(a) for a in armL]; self.arms["R"].rotation_euler = [r(a) for a in armR]
        self.head.rotation_euler = [r(a) for a in head]
        for sx, b in zip((-1, 1), self.brows): b.rotation_euler = (0, r(sx * brow), 0)

class Crease3D:
    """Series mascot: folded-paper diamond with ear flaps. Original design."""
    def __init__(self, loc=(0, 0, 0), scale=1.0, color=P["coral"], mood="smile"):
        self.root = empty("Crease", loc); self.root.scale = (scale,) * 3
        mat = paper("crease_paper", color, 0.8, 0.2); mat2 = paper("crease_paper2", "#C9503F", 0.8, 0.2)
        me = bpy.data.meshes.new("creasebody"); bm = bmesh.new()
        v = [bm.verts.new(p) for p in [(0, 0, 1.0), (-0.85, 0, 0.1), (0, -0.3, 0.1), (0.85, 0, 0.1), (0, 0, -0.9), (0, 0.05, 0.1)]]
        for f in ((0, 1, 2), (0, 2, 3), (2, 1, 4), (3, 2, 4)): bm.faces.new([v[i] for i in f])
        bm.to_mesh(me); bm.free(); o = bpy.data.objects.new("creasebody", me); _link(o); o.parent = self.root
        o.modifiers.new("s", "SOLIDIFY").thickness = 0.06; o.data.materials.append(mat); bpy.context.view_layer.objects.active = o
        for p in o.data.polygons: p.use_smooth = False
        for sx in (-1, 1):
            me2 = bpy.data.meshes.new("ear"); b2 = bmesh.new()
            vs = [b2.verts.new(p) for p in [(sx * 0.12, 0, 0.85), (sx * 0.5, 0, 1.0), (sx * 0.62, 0, 0.45)]]; b2.faces.new(vs); b2.to_mesh(me2); b2.free()
            e = bpy.data.objects.new("ear", me2); _link(e); e.parent = self.root; e.modifiers.new("s", "SOLIDIFY").thickness = 0.05; e.data.materials.append(mat2)
        bead = glossy("crease_bead", P["ink"], 0.08, 0)
        for sx in (-1, 1): sphere(f"ceye{sx}", 0.06, (sx * 0.2, -0.33, 0.35), bead, (1, 0.5, 1.2), self.root)
        k = {"smile": -0.08, "wince": 0.07, "wow": 0.0}[mood]
        pts = [(t * 0.16, -0.32, 0.12 - k * (1 - t * t)) for t in [i / 6 * 2 - 1 for i in range(7)]]
        curve("cmouth", pts, 0.02, glossy("cm", P["ink"], 0.3, 0), self.root)

def area(name, loc, energy, color, size, tgt):
    d = bpy.data.lights.new(name, "AREA"); d.energy = energy; d.color = color; d.size = size
    o = bpy.data.objects.new(name, d); _link(o); o.location = loc
    c = o.constraints.new("TRACK_TO"); c.target = tgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"; return o

def lights(target, k=1.0):
    """golden-hour rig: warm key upper-left, teal rim, soft fill"""
    area("key", (-6, -7, 9), 1500 * k, (1.0, 0.82, 0.58), 5, target)
    area("rim", (7, 5, 5), 600 * k, (0.5, 0.8, 1.0), 4, target)
    area("fill", (2, -9, 4), 220 * k, (1.0, 0.9, 0.8), 8, target)

def camera(loc, target, lens=50, fstop=2.8, focus=None):
    cd = bpy.data.cameras.new("cam"); cd.sensor_fit = "HORIZONTAL"; cd.sensor_width = 36; cd.lens = lens; cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop
    o = bpy.data.objects.new("cam", cd); _link(o); bpy.context.scene.camera = o; o.location = loc
    c = o.constraints.new("TRACK_TO"); c.target = target; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
    cd.dof.focus_object = focus or target; return o

def target(loc):
    t = bpy.data.objects.new("target", None); _link(t); t.location = loc; return t

def bokeh(items):
    """out-of-focus warm lights for depth: (x, y, z, hex, radius)"""
    for i, (x, y, z, c, r) in enumerate(items):
        m = bpy.data.materials.new(f"bk{i}"); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
        _set(b, "Base Color", hexc(c)); _set(b, "Emission Color", hexc(c)); _set(b, "Emission Strength", 4.0)
        sphere(f"bokeh{i}", r, (x, y, z), m)

def backdrop(depth_layers=((-9, "#8A5E7A"), (-14, "#C98A5E"), (-20, "#F2A65A")), width=60):
    """layered paper hills receding in depth (back-to-front): gives parallax and depth of field"""
    for i, (y, col) in enumerate(depth_layers):
        h = 4.5 + i * 1.6; amp = 1.2 + i * 0.5
        me = bpy.data.meshes.new(f"hill{i}"); bm = bmesh.new(); pts = [(-width / 2, y, -1)] + [(-width / 2 + k * 2, y, h + math.sin(k * 0.45 + i) * amp) for k in range(int(width / 2) + 1)] + [(width / 2, y, -1)]
        vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(f"hill{i}", me); _link(o); o.modifiers.new("s", "SOLIDIFY").thickness = 0.3; o.data.materials.append(paper(f"hill{i}m", col, 0.95, 0.3))

def render(path):
    sc = bpy.context.scene; sc.render.filepath = path; sc.render.image_settings.file_format = "PNG"; bpy.ops.render.render(write_still=True)
