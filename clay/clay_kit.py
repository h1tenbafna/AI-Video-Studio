"""Clay stop-motion kit for Blender 4.x (run inside Blender).

  blender -b --factory-startup -P clay/clay_kit.py -- --spec ep.json --out frames/f_#### [--res 1080 1920] [--samples 24]
                                                       [--frames A B] [--still N]

Everything is data: the episode spec (see clay/README.md) lists the cast, the set and a timeline of lines with word timings.
The kit builds characters from primitives, gives them a clay material (lumpy surface, fingerprint noise, soft subsurface),
and animates "on twos" at 12 fps with stepped (CONSTANT) keys, per-frame "boil" jitter and replacement-animation mouths
(a different mouth mesh is shown per frame, like real stop-motion).
No external assets are used.
"""
import bpy, bmesh, sys, math, json, random, colorsys
from mathutils import Vector, Euler

VISEMES = ["closed", "small", "wide", "smile", "oh"]

# ---------------------------------------------------------------- helpers
def hexrgb(h, k=1.0):
    h = h.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: (c / 12.92) if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r) * k, lin(g) * k, lin(b) * k, 1)

def args():
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    d = {"spec": None, "out": "//frames/f_####", "res": (1080, 1920), "samples": 24, "frames": None, "still": None}
    i = 0
    while i < len(a):
        if a[i] == "--spec": d["spec"] = a[i + 1]; i += 2
        elif a[i] == "--out": d["out"] = a[i + 1]; i += 2
        elif a[i] == "--res": d["res"] = (int(a[i + 1]), int(a[i + 2])); i += 3
        elif a[i] == "--samples": d["samples"] = int(a[i + 1]); i += 2
        elif a[i] == "--frames": d["frames"] = (int(a[i + 1]), int(a[i + 2])); i += 3
        elif a[i] == "--still": d["still"] = int(a[i + 1]); i += 2
        else: i += 1
    return d

def clay_mat(name, color_hex, rough=0.62, lump=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Roughness"].default_value = rough
    for k, v in (("Subsurface Weight", 0.12), ("Specular IOR Level", 0.35)):
        try: b.inputs[k].default_value = v
        except KeyError: pass
    try: b.inputs["Subsurface Radius"].default_value = (0.25, 0.12, 0.08)
    except KeyError: pass
    texco = nt.nodes.new("ShaderNodeTexCoord")
    # colour: base colour with a faint hand-mixed variation
    n1 = nt.nodes.new("ShaderNodeTexNoise"); n1.inputs["Scale"].default_value = 3.0; n1.inputs["Detail"].default_value = 2
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs["Factor"].default_value = 0.0
    mix.inputs[6].default_value = hexrgb(color_hex, 1.0); mix.inputs[7].default_value = hexrgb(color_hex, 0.82)
    nt.links.new(texco.outputs["Object"], n1.inputs["Vector"]); nt.links.new(n1.outputs["Fac"], mix.inputs["Factor"])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    # surface: big soft lumps + fine fingerprint-like grain
    n2 = nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 7.0; n2.inputs["Detail"].default_value = 3
    bm1 = nt.nodes.new("ShaderNodeBump"); bm1.inputs["Strength"].default_value = 0.35 * lump; bm1.inputs["Distance"].default_value = 0.05
    n3 = nt.nodes.new("ShaderNodeTexNoise"); n3.inputs["Scale"].default_value = 55.0; n3.inputs["Detail"].default_value = 8; n3.inputs["Roughness"].default_value = 0.65
    bm2 = nt.nodes.new("ShaderNodeBump"); bm2.inputs["Strength"].default_value = 0.18 * lump; bm2.inputs["Distance"].default_value = 0.01
    nt.links.new(texco.outputs["Object"], n2.inputs["Vector"]); nt.links.new(texco.outputs["Object"], n3.inputs["Vector"])
    nt.links.new(n2.outputs["Fac"], bm1.inputs["Height"]); nt.links.new(n3.outputs["Fac"], bm2.inputs["Height"])
    nt.links.new(bm1.outputs["Normal"], bm2.inputs["Normal"]); nt.links.new(bm2.outputs["Normal"], b.inputs["Normal"])
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    return m

def plain_mat(name, color_hex, rough=0.35):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = hexrgb(color_hex)
    b.inputs["Roughness"].default_value = rough
    return m

def sphere(name, r, scale=(1, 1, 1), loc=(0, 0, 0), mat=None, parent=None, seg=40):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = scale
    bpy.ops.object.shade_smooth()
    if mat: o.data.materials.append(mat)
    if parent: o.parent = parent
    return o

def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(e)
    e.location = loc
    if parent: e.parent = parent
    return e

def capsule(name, r, length, mat, parent):
    """Arm: cylinder hanging down -Z from the parent pivot, with round ends."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=length, location=(0, 0, -length / 2))
    o = bpy.context.active_object; o.name = name + "_tube"; bpy.ops.object.shade_smooth(); o.data.materials.append(mat); o.parent = parent
    sphere(name + "_hand", r * 1.35, loc=(0, 0, -length), mat=mat, parent=parent, seg=24)
    sphere(name + "_shoulder", r * 1.02, loc=(0, 0, 0), mat=mat, parent=parent, seg=24)
    return o

def add_lumps(o, strength=0.035, scale=0.9):
    t = bpy.data.textures.new("lump_" + o.name, "CLOUDS"); t.noise_scale = scale
    d = o.modifiers.new("lumps", "DISPLACE"); d.texture = t; d.strength = strength; d.mid_level = 0.5

# ---------------------------------------------------------------- character
class Character:
    def __init__(self, cid, spec, x, face_yaw=0.0):
        self.id = cid; self.spec = spec
        col = spec.get("color", "#2bb3a3"); shape = spec.get("shape", "round")
        sx, sz = {"round": (1.0, 1.0), "tall": (0.82, 1.28), "wide": (1.2, 0.85)}.get(shape, (1, 1))
        self.m = clay_mat(cid + "_clay", col)
        self.m_dark = clay_mat(cid + "_dark", spec.get("accent", "#7a2e3b"), rough=0.5, lump=0.4)
        white = plain_mat(cid + "_white", "#fbf7ee", 0.3); black = plain_mat(cid + "_black", "#17141a", 0.2)
        self.root = empty(cid + "_root", (x, 0, 0)); self.root.rotation_euler[2] = face_yaw
        self.sq = empty(cid + "_squash", (0, 0, 0.0), self.root)   # squash & stretch pivot at the feet
        self.body = sphere(cid + "_body", 1.0, (0.95 * sx, 0.85 * sx, 1.1 * sz), (0, 0, 1.15 * sz), self.m, self.sq); add_lumps(self.body)
        self.body_top = 1.15 * sz + 1.1 * sz * 0.8
        self.head_p = empty(cid + "_head_p", (0, 0, self.body_top + 0.15), self.sq)
        hs = spec.get("head", 1.0)
        self.head = sphere(cid + "_head", 0.85 * hs, (1.0, 0.92, 0.95), (0, 0, 0.35 * hs), self.m, self.head_p); add_lumps(self.head)
        # eyes
        es = spec.get("eyes", 1.0)
        self.eyes = []; self.pupils = []
        for sgn, side in ((-1, "L"), (1, "R")):
            ew = sphere(f"{cid}_eye{side}", 0.23 * es, (1, 0.55, 1.1), (sgn * 0.31 * hs, -0.72 * hs, 0.68 * hs), white, self.head_p, seg=24)
            pu = sphere(f"{cid}_pupil{side}", 0.1 * es, (1, 0.5, 1), (0, -0.2 * es * 0.5, 0), black, ew, seg=16)
            self.eyes.append(ew); self.pupils.append(pu)
        # brows (small clay worms)
        self.brows = []
        for sgn, side in ((-1, "L"), (1, "R")):
            br = sphere(f"{cid}_brow{side}", 0.2 * es, (1.5, 0.3, 0.32), (sgn * 0.31 * hs, -0.70 * hs, 0.98 * hs), self.m_dark if spec.get("dark_brows") else self.m, self.head_p, seg=16)
            self.brows.append(br)
        # mouths (replacement animation)
        self.mouths = {}
        mdark = plain_mat(cid + "_mouth", "#8a1c33", 0.45)
        mz = -0.12 * hs; my = -0.76 * hs
        shapes = {"closed": ((0.30, 0.10, 0.05), 0.0), "small": ((0.22, 0.10, 0.10), 0.0), "wide": ((0.30, 0.10, 0.22), 0.0),
                  "smile": ((0.40, 0.10, 0.11), 0.0), "oh": ((0.15, 0.10, 0.17), 0.0)}
        for k, (sc, _) in shapes.items():
            mo = sphere(f"{cid}_mouth_{k}", 1.0, sc, (0, my, mz), mdark, self.head_p, seg=20)
            self.mouths[k] = mo
        # arms
        self.arms = {}
        for sgn, side in ((-1, "L"), (1, "R")):
            p = empty(f"{cid}_arm{side}_p", (sgn * 0.98 * sx, 0, 1.75 * sz), self.sq)
            capsule(f"{cid}_arm{side}", 0.17, 0.95 * sz + 0.2, self.m, p)
            p.rotation_euler[1] = sgn * -0.16
            self.arms[side] = p
        # feet
        for sgn in (-1, 1):
            sphere(f"{cid}_foot", 0.34, (1.0, 1.35, 0.55), (sgn * 0.45 * sx, -0.12, 0.17), self.m, self.root, seg=24)
        # accessories
        acc = spec.get("accessory", "none")
        if acc == "glasses":
            gm = plain_mat(cid + "_glasses", "#1f1c24", 0.3)
            for sgn in (-1, 1):
                bpy.ops.mesh.primitive_torus_add(major_radius=0.3 * es, minor_radius=0.045, location=(sgn * 0.31 * hs, -0.78 * hs, 0.68 * hs), rotation=(math.radians(90), 0, 0))
                t = bpy.context.active_object; t.data.materials.append(gm); t.parent = self.head_p
            sphere(cid + "_bridge", 0.04, (3.2, 1, 1), (0, -0.78 * hs, 0.68 * hs), gm, self.head_p, seg=12)
        elif acc == "hat":
            hm = clay_mat(cid + "_hat", spec.get("accent", "#e4572e"))
            bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.55 * hs, depth=0.6 * hs, location=(0, 0, 1.55 * hs)); h = bpy.context.active_object
            bpy.ops.object.shade_smooth(); h.data.materials.append(hm); h.parent = self.head_p
            bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.85 * hs, depth=0.1 * hs, location=(0, 0, 1.25 * hs)); h2 = bpy.context.active_object
            bpy.ops.object.shade_smooth(); h2.data.materials.append(hm); h2.parent = self.head_p
        elif acc == "bowtie":
            bm = clay_mat(cid + "_tie", spec.get("accent", "#e4572e"))
            for sgn in (-1, 1):
                sphere(cid + "_tie", 0.2, (1.4, 0.6, 0.9), (sgn * 0.22, -0.88 * sx, self.body_top - 0.45), bm, self.sq, seg=16)
            sphere(cid + "_knot", 0.1, (1, 0.8, 1), (0, -0.9 * sx, self.body_top - 0.45), bm, self.sq, seg=12)
        elif acc == "tuft":
            for i, ang in enumerate((-0.4, 0, 0.4)):
                sphere(cid + "_tuft", 0.09, (1, 1, 3.2), (math.sin(ang) * 0.22, 0, 1.28 * hs + 0.05), self.m, self.head_p, seg=12).rotation_euler[1] = ang
        self.rest = {k: tuple(v.rotation_euler) for k, v in self.arms.items()}
        self.base_x = x
        self.objs = [o for o in bpy.data.objects if o.name.startswith(cid + "_")]

    def pose(self, f, p, rng):
        """p: dict of pose values for this frame. Jitter ('boil') is added here."""
        j = lambda s=1.0: (rng.random() - 0.5) * 0.012 * s
        r = self.root
        r.location = (self.base_x + p.get("dx", 0) + j(), p.get("dy", 0) + j(), p.get("hop", 0))
        r.rotation_euler[2] = p.get("yaw", 0) + j(0.8)
        sq = p.get("squash", 0.0)
        self.sq.scale = (1 + sq * 0.5 + j(0.4), 1 + sq * 0.5 + j(0.4), 1 - sq + j(0.4))
        self.sq.rotation_euler = (p.get("lean", 0) * 0.35 + j(), p.get("roll", 0) + j(0.6), 0)
        self.head_p.rotation_euler = (p.get("nod", 0) + j(0.8), p.get("tilt", 0) + j(0.8), p.get("turn", 0) + j(0.8))
        for side, ar in self.arms.items():
            a = p.get("arm" + side, 0.0)
            rest = self.rest[side]
            ar.rotation_euler = (p.get("arm" + side + "_fwd", 0.0) + j(), rest[1] + (a if side == "R" else -a) + j(1.4), j())
        look = p.get("look", (0, 0))
        for pu in self.pupils:
            pu.location = (look[0] * 0.07, -0.1 - 0.02, look[1] * 0.06)
        blink = p.get("blink", 0.0)
        for e in self.eyes: e.scale = (1, 0.55, 1.1 * (1 - 0.88 * blink))
        for pu in self.pupils: pu.hide_render = blink > 0.5
        br = p.get("brow", 0.0)
        for i, b in enumerate(self.brows):
            b.location.z = (0.98 + 0.07 * br) * self.spec.get("head", 1.0)
            b.rotation_euler[1] = (-1 if i == 0 else 1) * (0.25 * p.get("brow_tilt", 0.0)) + j(0.5)
        vis = p.get("mouth", "closed")
        for k, m in self.mouths.items(): m.hide_render = (k != vis); m.hide_viewport = (k != vis)
        for ob in [r, self.sq, self.head_p, *self.arms.values(), *self.pupils, *self.eyes, *self.brows, *self.mouths.values()]:
            for dp in ("location", "rotation_euler", "scale", "hide_render"):
                try: ob.keyframe_insert(dp, frame=f)
                except Exception: pass

# ---------------------------------------------------------------- props (the literal visuals)
class Prop:
    """A clay prop with a lifetime and an animation. spec: id,type,pos,scale,color,at,until,anim,rot,to,move_at,move_len,text."""
    def __init__(self, sp):
        self.sp = sp; self.parts = []
        col = sp.get("color", "#ffd23f"); m = clay_mat("prop_" + sp["id"], col, rough=0.6)
        self.root = empty("prop_" + sp["id"], tuple(sp.get("pos", [0, 0, 6])))
        ty = sp["type"]
        def add(o): o.parent = self.root; self.parts.append(o); return o
        if ty == "ball": add(sphere("pb", 0.8, mat=m))
        elif ty == "sun":
            add(sphere("sun_core", 0.9, mat=m))
            for k in range(10):
                a = k / 10 * math.tau
                bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.09, depth=0.55, location=(math.cos(a) * 1.4, 0, math.sin(a) * 1.4))
                r = bpy.context.active_object; r.rotation_euler = (0, -a + math.pi / 2, 0); bpy.ops.object.shade_smooth(); r.data.materials.append(m); add(r)
        elif ty == "cloud":
            for dx, dz, rr in ((-0.7, 0, 0.6), (0, 0.25, 0.8), (0.75, 0, 0.62), (0.2, -0.1, 0.7)):
                add(sphere("cl", rr, (1, 0.7, 0.85), (dx, 0, dz), m))
        elif ty in ("ray", "arrow"):
            L = sp.get("length", 3.0)
            bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.11, depth=L, location=(L / 2, 0, 0), rotation=(0, math.radians(90), 0))
            sh = bpy.context.active_object; bpy.ops.object.shade_smooth(); sh.data.materials.append(m); add(sh)
            if ty == "arrow":
                bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=0.36, depth=0.7, location=(L + 0.25, 0, 0), rotation=(0, math.radians(90), 0))
                hd = bpy.context.active_object; bpy.ops.object.shade_smooth(); hd.data.materials.append(m); add(hd)
            else:
                add(sphere("rt", 0.17, loc=(L, 0, 0), mat=m, seg=16))
        elif ty == "bulb":
            add(sphere("bulb", 0.85, (1, 1, 1.1), (0, 0, 0.2), m))
            bm = clay_mat("bulb_base", "#8d99ae")
            bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.38, depth=0.5, location=(0, 0, -0.85)); b = bpy.context.active_object
            bpy.ops.object.shade_smooth(); b.data.materials.append(bm); add(b)
        elif ty == "planet":
            add(sphere("pl", 0.95, mat=m))
            bpy.ops.mesh.primitive_torus_add(major_radius=1.55, minor_radius=0.1, rotation=(math.radians(80), 0, math.radians(-15)))
            t = bpy.context.active_object; bpy.ops.object.shade_smooth(); t.data.materials.append(clay_mat("ring", sp.get("accent", "#e4572e"))); add(t)
        elif ty == "box":
            bpy.ops.mesh.primitive_cube_add(size=sp.get("s", 1.4)); o = bpy.context.active_object
            bv = o.modifiers.new("b", "BEVEL"); bv.width = 0.16; bv.segments = 4; bpy.ops.object.shade_smooth(); o.data.materials.append(m); add(o)
        elif ty == "text":
            bpy.ops.object.text_add(); o = bpy.context.active_object; o.data.body = sp.get("text", "?"); o.data.size = sp.get("size", 1.6)
            o.data.extrude = 0.18; o.data.bevel_depth = 0.05; o.data.bevel_resolution = 3
            o.data.align_x = "CENTER"; o.data.align_y = "CENTER"; o.rotation_euler = (math.radians(90), 0, 0)
            o.data.materials.append(m); add(o)
        else:
            raise ValueError("unknown prop type " + ty)
        self.base_rot = math.radians(sp.get("rot", 0))
        self.base_scale = sp.get("scale", 1.0)

    def pose(self, f, t, rng):
        sp = self.sp; at = sp["at"]; until = sp.get("until", 1e9)
        on = at <= t < until
        k = 0.0
        if on:
            d = t - at
            k = min(1.0, d / 0.34)
            k = 1 - (1 - k) ** 3 * math.cos(k * 4.2)        # overshooting pop
            out = until - t
            if out < 0.25: k *= max(0.0, out / 0.25)
        anim = sp.get("anim", "pop"); sc = self.base_scale * max(0.0001, k)
        x, y, z = sp.get("pos", [0, 0, 6]); rot = self.base_rot; d = t - at
        if anim == "float": z += 0.28 * math.sin(d * 2.2)
        elif anim == "pulse": sc *= 1 + 0.07 * math.sin(d * 5.0)
        elif anim == "spin": rot += d * 0.9
        elif anim == "wiggle": rot += 0.12 * math.sin(d * 10.0); x += 0.08 * math.sin(d * 8)
        elif anim == "bounce": z += abs(math.sin(d * 4.0)) * 0.7
        if "to" in sp and on:
            ma = sp.get("move_at", 0.3); ml = max(0.1, sp.get("move_len", 1.2))
            u = min(1.0, max(0.0, (d - ma) / ml)); u = u * u * (3 - 2 * u)
            x = x + (sp["to"][0] - x) * u; y = y + (sp["to"][1] - y) * u; z = z + (sp["to"][2] - z) * u
        j = lambda a=1.0: (rng.random() - 0.5) * 0.02 * a
        self.root.location = (x + j(), y + j(), z + j()); self.root.scale = (sc, sc, sc)
        ty = sp["type"]
        if ty in ("ray", "arrow"): self.root.rotation_euler = (0, -rot, 0)       # rotate in the picture plane
        elif ty == "text": self.root.rotation_euler = (0, 0.04 * math.sin(d * 3), 0)
        else: self.root.rotation_euler = (j(0.3), j(0.3), rot)
        for o in self.parts: o.hide_render = not on
        for dp in ("location", "rotation_euler", "scale"): self.root.keyframe_insert(dp, frame=f)
        for o in self.parts: o.keyframe_insert("hide_render", frame=f)

# ---------------------------------------------------------------- lip sync
def viseme_seq(word):
    w = "".join(c for c in word.lower() if c.isalpha())
    seq = []
    for i, c in enumerate(w):
        if c in "bmp": seq.append("closed")
        elif c in "a": seq.append("wide")
        elif c in "ei": seq.append("smile")
        elif c in "ou": seq.append("oh")
        elif c in "fv": seq.append("closed")
    if not seq: seq = ["small"]
    # keep a small opening between repeats so the mouth visibly moves
    out = [seq[0]]
    for s in seq[1:]:
        if s == out[-1]: out.append("small")
        out.append(s)
    return out

def mouth_at(t, words):
    for w in words:
        if w["s"] - 0.02 <= t <= w["e"] + 0.03:
            seq = viseme_seq(w["w"]); prog = (t - w["s"]) / max(0.05, (w["e"] - w["s"]))
            return seq[min(len(seq) - 1, max(0, int(prog * len(seq))))]
    return "closed"

# ---------------------------------------------------------------- scene
def setup_scene(spec, a):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.fps = spec.get("stop_fps", 12); sc.render.fps_base = 1.0
    sc.render.resolution_x, sc.render.resolution_y = a["res"]; sc.render.resolution_percentage = 100
    try: sc.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError: sc.render.engine = "BLENDER_EEVEE"
    try: sc.eevee.taa_render_samples = a["samples"]
    except Exception: pass
    for k, v in (("use_raytracing", False), ("use_shadows", True), ("use_gtao", True)):
        try: setattr(sc.eevee, k, v)
        except Exception: pass
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    try: sc.view_settings.exposure = -0.2
    except Exception: pass
    sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGB"
    # world
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = hexrgb(spec["style"].get("world", "#f4e9d4")); bg.inputs["Strength"].default_value = 0.9
    st = spec["style"]
    # set: floor + back wall (curved with a bevel)
    floor = bpy.data.objects.new("floor", bpy.data.meshes.new("floor"))
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=2, y_segments=2, size=40); bm.to_mesh(floor.data); bm.free()
    bpy.context.collection.objects.link(floor); floor.data.materials.append(clay_mat("floor", st.get("floor", "#d9b27c"), rough=0.75, lump=0.5))
    wall = bpy.data.objects.new("wall", bpy.data.meshes.new("wall"))
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=2, y_segments=2, size=40); bm.to_mesh(wall.data); bm.free()
    bpy.context.collection.objects.link(wall); wall.rotation_euler[0] = math.radians(90); wall.location = (0, 7.5, 18)
    wall.data.materials.append(clay_mat("wall", st.get("wall", "#f2b84b"), rough=0.8, lump=0.6))
    # lights
    def light(name, kind, loc, energy, size, color=(1, 1, 1), target=(0, 0, 1.6)):
        l = bpy.data.lights.new(name, kind); l.energy = energy; l.color = color
        if kind == "AREA": l.size = size
        o = bpy.data.objects.new(name, l); bpy.context.collection.objects.link(o); o.location = loc
        d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        return o
    light("key", "AREA", (-7, -10, 11), 1900, 8, (1.0, 0.93, 0.82))
    light("fill", "AREA", (9, -9, 5), 600, 10, (0.85, 0.92, 1.0))
    light("rim", "AREA", (3, 4.5, 9), 500, 5, (1.0, 0.95, 0.9))
    # camera
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); bpy.context.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 50; cam.data.sensor_fit = "HORIZONTAL"
    try:
        cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 8.0
    except Exception: pass
    return sc, cam

CAMS = {  # name: (location, target)   portrait-friendly framing for two characters about 6 units apart
    "two_shot": ((0, -13.0, 3.4), (0, 0, 3.9)),
    "wide": ((0, -17.0, 4.2), (0, 0, 4.8)),
    "left": ((-1.5, -8.6, 3.0), (-1.5, 0, 3.6)),
    "right": ((1.5, -8.6, 3.0), (1.5, 0, 3.6)),
}

def smooth_cam(cam, name, t01):
    loc, tgt = CAMS.get(name, CAMS["two_shot"])
    push = 1.0 - 0.05 * t01
    c = Vector(loc); tg = Vector(tgt)
    c = tg + (c - tg) * push
    cam.location = c
    cam.rotation_euler = (tg - c).to_track_quat("-Z", "Y").to_euler()
    try: cam.data.dof.focus_distance = (tg - c).length
    except Exception: pass

def build_and_animate(spec, a):
    sc, cam = setup_scene(spec, a)
    fps = spec.get("stop_fps", 12)
    names = list(spec["cast"].keys())
    xs = spec.get("positions") or {n: (-2.5 if i == 0 else 2.5) if len(names) == 2 else (i - (len(names) - 1) / 2) * 5.5 for i, n in enumerate(names)}
    chars = {n: Character(n, spec["cast"][n], xs[n], face_yaw=0.0) for n in names}
    props = []
    for k, pr in enumerate(spec.get("props", [])):
        pr = dict(pr); pr.setdefault("id", f"p{k}"); pr.setdefault("at", 0.0)
        props.append(Prop(pr))
    dur = spec["duration"]; nfr = int(math.ceil(dur * fps)); sc.frame_start = 1; sc.frame_end = nfr
    tl = spec["timeline"]; rng = random.Random(spec.get("seed", 7))
    blink_at = {n: sorted(rng.uniform(0.8, dur) for _ in range(int(dur / 2.6) + 1)) for n in names}
    for f in range(1, nfr + 1):
        t = (f - 1) / fps
        seg = next((s for s in tl if s["start"] <= t < s["end"]), tl[-1])
        smooth_cam(cam, seg.get("cam", "two_shot"), (t - seg["start"]) / max(0.1, seg["end"] - seg["start"]))
        cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f)
        try: cam.data.dof.keyframe_insert("focus_distance", frame=f)
        except Exception: pass
        for pr_ in props: pr_.pose(f, t, random.Random(f * 31 + 5))
        for n in names:
            ch = chars[n]; speaking = seg.get("speaker") == n
            other = [m for m in names if m != n][0] if len(names) > 1 else n
            p = {}
            # idle breathing, stepped on twos
            p["squash"] = 0.018 * math.sin(t * 2.4 + hash(n) % 5) + (0.0 if f % 2 else 0.004)
            # look at partner (speaker looks to partner, listener looks at speaker)
            dirx = 1 if xs[other] > xs[n] else -1
            p["look"] = (dirx * 0.8, 0.1)
            p["turn"] = dirx * 0.22
            # blink
            p["blink"] = 1.0 if any(0 <= t - b < 1.0 / fps * 1.2 for b in blink_at[n]) else 0.0
            p["brow"] = 0.2 * math.sin(t * 1.3)
            if speaking:
                words = seg.get("words", [])
                p["mouth"] = mouth_at(t, words)
                # beat gestures on word starts
                for wi, w in enumerate(words):
                    d = t - w["s"]
                    if 0 <= d < 0.30 and len(w["w"].strip(".,!?")) > 3:
                        k = math.sin(d / 0.30 * math.pi)
                        side = "R" if wi % 2 == 0 else "L"
                        p["arm" + side] = 0.9 * k; p["arm" + side + "_fwd"] = -0.5 * k
                        p["nod"] = 0.18 * k; p["squash"] += 0.05 * k; p["brow"] = 0.8 * k
                        break
            else:
                if (int(t * 1.1) % 3) == 0 and (t * 1.1) % 1 < 0.35: p["nod"] = 0.14
            # authored actions
            for act in spec.get("actions", []):
                if act["who"] != n: continue
                d = t - act["t"]; L = act.get("len", 1.0)
                if not (0 <= d < L): continue
                k = math.sin(d / L * math.pi); do = act["do"]
                if do == "wave": p["armR"] = 2.4 * k; p["armR_fwd"] = 0.0; p["roll"] = 0.06 * math.sin(d * 14)
                elif do == "hop": p["hop"] = 1.3 * k; p["squash"] = 0.25 * (1 - k) * (1 if d < L * 0.15 or d > L * 0.85 else 0) - 0.08 * k
                elif do == "point": p["armR"] = 1.5 * k; p["armR_fwd"] = -1.1 * k; p["turn"] = dirx * 0.5
                elif do == "shrug": p["armL"] = 1.2 * k; p["armR"] = 1.2 * k; p["squash"] = -0.07 * k
                elif do == "cheer": p["armL"] = 2.6 * k; p["armR"] = 2.6 * k; p["hop"] = 0.6 * abs(math.sin(d * 9)); p["mouth"] = "wide"
                elif do == "lean": p["lean"] = 0.6 * k; p["dy"] = -0.6 * k
                elif do == "surprise": p["hop"] = 0.5 * k; p["brow"] = 1.0; p["mouth"] = "oh"; p["squash"] = -0.1 * k
            ch.pose(f, p, random.Random(f * 977 + hash(n) % 97))
    for ob in bpy.data.objects:
        ad = ob.animation_data
        if ad and ad.action:
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
    return sc

def main():
    a = args(); spec = json.load(open(a["spec"], encoding="utf-8"))
    sc = build_and_animate(spec, a)
    sc.render.filepath = a["out"]; sc.render.use_overwrite = False; sc.render.use_placeholder = True
    if a["frames"]: sc.frame_start, sc.frame_end = a["frames"]
    if a["still"]:
        sc.frame_set(a["still"]); sc.render.filepath = a["out"].replace("####", "%04d" % a["still"]); sc.render.use_overwrite = True
        bpy.ops.render.render(write_still=True)
    else:
        bpy.ops.render.render(animation=True)

if __name__ == "__main__":
    main()
