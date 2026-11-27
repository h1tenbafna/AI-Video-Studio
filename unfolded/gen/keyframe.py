"""Unfolded keyframe generator (local, $0). Runs in the diffusion env, not the repo venv:
  set HF_HOME=D:/AI-Video-Studio/_test-envs/hf-cache  (and HF_HUB_OFFLINE=1 once models are cached)
  D:/AI-Video-Studio/_test-envs/diffusion/Scripts/python.exe -I unfolded/gen/keyframe.py <jobs.json>
jobs.json: {"model": "Lykon/dreamshaper-8", "style": "<style block>", "negative": "...", "width": 512, "height": 896,
            "steps": 24, "cfg": 6.5, "ip_ref": null | "path.png", "ip_scale": 0.6, "ip_weight": "ip-adapter-plus_sd15.safetensors" | "ip-adapter-plus-face_sd15.safetensors",
            "shots": [{"id": "s01", "prompt": "...", "seed": 7, "out": "path.png"},
                      {"id": "s01B", "prompt": "<same scene, new pose>", "init": "s01.png", "strength": 0.55, "seed": 7, "out": "s01B.png"}]}
A shot with "init" runs img2img from that image (pose pairs: same picture, changed pose; strength 0.45-0.65).
The init image is encoded by the fp32 VAE and passed as latents, so the fp16 UNet / fp32 VAE split still holds.
GTX 16xx recipe (verified 2026-11-27): fp16 UNet with cuDNN OFF + classic attention processor (upcast), then UNet to CPU and
cuDNN ON for the fp32 VAE decode. 512x512 x 20 steps = 114 s, peak 2.9 GB VRAM. Other GPUs/Macs: the same code works (flags are harmless).
"""
import json, sys, time, torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from diffusers.models.attention_processor import AttnProcessor

def load(model, ip_ref, ip_weight="ip-adapter-plus_sd15.safetensors"):
    p = StableDiffusionPipeline.from_pretrained(model, torch_dtype=torch.float16, variant="fp16", safety_checker=None, requires_safety_checker=False, use_safetensors=True)
    p.scheduler = DPMSolverMultistepScheduler.from_config(p.scheduler.config, algorithm_type="dpmsolver++", solver_type="midpoint", use_karras_sigmas=True)
    p.vae.to(torch.float32)
    if ip_ref:
        p.load_ip_adapter("h94/IP-Adapter", subfolder="models", weight_name=ip_weight, image_encoder_folder="models/image_encoder")
    else:
        p.unet.set_attn_processor(AttnProcessor())
    for m in p.unet.modules():
        if m.__class__.__name__ == "Attention": m.upcast_attention = True; m.upcast_softmax = True
    p.unet.to("cuda"); p.text_encoder.to("cuda"); p.vae.to("cuda")   # image encoder (if any) stays on CPU until needed
    if not ip_ref: p.enable_attention_slicing(1)   # one head at a time at 512x896 on 4 GB; IP-Adapter keeps its own (SDPA) processors
    return p

def ip_embeds(p, img):
    """encode the cast reference once on the GPU, then move the encoder off so the UNet fits"""
    torch.backends.cudnn.enabled = True
    for c in (p.unet, p.text_encoder, p.vae): c.to("cpu")
    torch.cuda.empty_cache(); p.image_encoder.to("cuda", dtype=torch.float16)   # fp32 encoder is 2.5 GB; fp16 fits
    print("encoder on gpu, vram MB", round(torch.cuda.memory_allocated() / 1e6), flush=True)
    with torch.no_grad():   # without this the result keeps the encoder's GPU weights alive
        e = p.prepare_ip_adapter_image_embeds(ip_adapter_image=img, ip_adapter_image_embeds=None, device="cuda", num_images_per_prompt=1, do_classifier_free_guidance=True)
    e = [x.detach().to(torch.float16) for x in e]
    import gc; p.image_encoder = None; gc.collect(); torch.cuda.empty_cache()   # free 1.26 GB of RAM too (7.8 GB PC)
    for c in (p.unet, p.text_encoder): c.to("cuda")
    p.vae.to("cuda", dtype=torch.float32)
    print("ip embeds nan", any(bool(torch.isnan(x).any()) for x in e), flush=True)
    return e

def main(jobs_path, max_new=10**9):
    J = json.load(open(jobs_path, encoding="utf-8"))
    t0 = time.time(); p = load(J["model"], J.get("ip_ref"), J.get("ip_weight", "ip-adapter-plus_sd15.safetensors")); print("load s", round(time.time() - t0, 1), flush=True)
    ip_emb = None
    if J.get("ip_ref"):
        from PIL import Image
        p.set_ip_adapter_scale(J.get("ip_scale", 0.6)); ip_emb = ip_embeds(p, Image.open(J["ip_ref"]).convert("RGB"))
    i2i = None
    import os
    for s in J["shots"]:
        if os.path.exists(s["out"]) and not J.get("overwrite"): print(s["id"], "exists, skipped", flush=True); continue   # resume after a stopped run
        if max_new <= 0: print("chunk limit reached", flush=True); break
        max_new -= 1
        t = time.time()
        kw = dict(prompt=f'{s["prompt"]}, {J["style"]}', negative_prompt=s.get("negative", J.get("negative", "")),
                  num_inference_steps=J.get("steps", 24), guidance_scale=J.get("cfg", 6.5), generator=torch.Generator("cuda").manual_seed(s.get("seed", 7)), output_type="latent")
        if ip_emb is not None: kw["ip_adapter_image_embeds"] = ip_emb
        if s.get("init"):
            from PIL import Image
            from diffusers import StableDiffusionImg2ImgPipeline
            if i2i is None: i2i = StableDiffusionImg2ImgPipeline(**p.components)
            torch.backends.cudnn.enabled = True; p.vae.to("cuda", dtype=torch.float32)
            x = p.image_processor.preprocess(Image.open(s["init"]).convert("RGB").resize((J.get("width", 512), J.get("height", 896)))).to("cuda", torch.float32)
            with torch.no_grad(): init_lat = (p.vae.encode(x).latent_dist.mean * p.vae.config.scaling_factor).to(torch.float16)
            torch.backends.cudnn.enabled = False; p.unet.to("cuda"); p.text_encoder.to("cuda")
            lat = i2i(image=init_lat, strength=s.get("strength", 0.55), **kw).images
        else:
            torch.backends.cudnn.enabled = False; p.unet.to("cuda"); p.text_encoder.to("cuda")
            lat = p(width=J.get("width", 512), height=J.get("height", 896), **kw).images
        if torch.isnan(lat).any(): print(s["id"], "NaN latent, skipped", flush=True); continue
        p.unet.to("cpu"); p.text_encoder.to("cpu"); torch.cuda.empty_cache(); torch.backends.cudnn.enabled = True
        with torch.no_grad(): img = p.vae.decode(lat.to(torch.float32) / p.vae.config.scaling_factor).sample
        p.image_processor.postprocess(img, output_type="pil")[0].save(s["out"])
        print(s["id"], "ok", round(time.time() - t, 1), "s", flush=True)

if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 10**9)   # optional 2nd arg: max new images this call (foreground chunks)
