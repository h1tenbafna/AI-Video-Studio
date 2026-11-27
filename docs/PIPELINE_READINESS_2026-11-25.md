Pipeline readiness (static + registry; READY does not mean a full run was done)

animated-explainer     PARTIAL                      stages=8  run evidence: end-to-end runs: 4 productions (solar, AI-compute v1-v4, relationships)
    PARTIAL  assets: image_selector (alternatives available: tts_selector, diagram_gen, code_snippet)
animation              READY                        stages=8  run evidence: none
avatar-spokesperson    PARTIAL                      stages=7  run evidence: none
    PARTIAL  assets: most listed tools unavailable (heygen_avatar, talking_head, lip_sync, image_selector, video_selector); usable: tts_selector, subtitle_gen, audio_enhance
character-animation    PARTIAL                      stages=10  run evidence: tool chain run (spec, rig, poses, timeline, preview render) 2026-11-25; no full pipeline run
    PARTIAL  character_design: most listed tools unavailable (image_selector); usable: character_spec_generator
    PARTIAL  assets: most listed tools unavailable (image_selector, music_gen); usable: tts_selector, character_rig_renderer
cinematic              PARTIAL                      stages=8  run evidence: none
    PARTIAL  assets: most listed tools unavailable (image_selector, video_selector, atlas_3d, fal_3d, freesound_music); usable: subtitle_gen, audio_enhance, threejs_world, threejs_asset_catalog, blender_world, pixabay_music
clip-factory           READY                        stages=7  run evidence: none
documentary-montage    BLOCKED                      stages=5  run evidence: none
    BLOCKED  assets: none of its tools work here (direct_clip_search, corpus_builder, clip_search, music_gen)
framework-smoke        READY                        stages=2  run evidence: none
hybrid                 READY                        stages=7  run evidence: none
localization-dub       READY                        stages=7  run evidence: none
podcast-repurpose      READY                        stages=7  run evidence: none
screen-demo            READY                        stages=7  run evidence: none
talking-head           READY                        stages=7  run evidence: none