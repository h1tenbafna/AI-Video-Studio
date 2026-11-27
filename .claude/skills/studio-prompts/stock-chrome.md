# Stock footage and photos via Pexels in Chrome

**Status (2026-11-25):** VERIFIED end to end: search, candidate list, licence read, download through the user's Chrome (2 clips), trim and 1080x1920 reframe with `video_trimmer` and `auto_reframe`. The API route (`pexels_image`, `pexels_video`) is BLOCKED: no key.
Learned in testing: the dropdown beside "Free download" offers sizes (SD 240p up to 4K); the file delivered can differ from what the page or filename says (a page listing 30 s / 2160x4096 gave 24.9 s / 720x1366), so ALWAYS probe the downloaded file with ffprobe and record the real size in the manifest. Files land in the browser's Downloads folder on C:, move them to D: straight away. Small clips are only 1-3 MB.

## Rules
- Public Pexels site in the user's own Chrome only (Claude in Chrome). No scraping with forged headers, no API tricks, no CAPTCHA bypass. If a CAPTCHA or block appears: stop and tell the user.
- **Downloads need an explicit yes.** Ask once per batch: list each file as `filename | source URL | creator | duration | dimensions` and say the size is shown only after download starts (Pexels does not state it on the page). One approval covers that list only.
- Read the licence on the file's own page (this test: the page said "Free"). Pexels files can carry restrictions; log what the page says. No logos or brand text; no recognisable person presented as the client's customer.
- Prefer portrait clips for 9:16. A 2160x4096 30 s clip can be tens of MB: pick the smallest size that is at least 1080 wide. Large downloads go to D: (C: is small); set Chrome's download folder or move the file straight after.

## Procedure per scene
1. Take the scene's `action_beat` and `visual_source` from the scene plan.
2. Navigate to `https://www.pexels.com/search/videos/<query>/?orientation=portrait` (photos: `/search/<query>/`).
3. List candidates with `javascript_tool` (anchors containing `/video/`), open the best 3 and read title, creator, duration, dimensions, FPS, licence.
4. Present a contact list to the user (3 per scene) with why each fits the narrated word. Wait for the pick and the download approval.
5. After approval: use the page's Download button (or the `/download/video/<id>/` link on the page), save to `projects/<id>/assets/stock/<scene>-<n>.<ext>`.
6. Write each into `asset_manifest`: `source_tool: "chrome-manual"`, `provider: "pexels-manual"`, `original_url`, `license`, `scene_id`, `path`.
7. On-screen credit tag if the user wants one; always list sources in the publish caption.
8. Trim and crop locally (`video_trimmer`, `auto_reframe`, both VERIFIED) to 1080x1920. Check frame 0 and motion.

## Test log
- 2026-11-25: downloaded `pexels-8165942` (hand with phone) and `pexels-8135207` (woman talking, Free licence line, 1080x1920 on the page, SD 540x960 chosen, 12.9 s) with the user's explicit yes; both moved to `projects/_route_tests/stock/`.
- 2026-11-24: query "person tapping phone", portrait. Found candidates incl. "Person Touching the Screen of a Cellphone" (30 s, 2160x4096, 25 fps, licence line "Free"). Nothing downloaded.
