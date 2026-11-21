# Mac setup (Apple Silicon: MacBook Air/Pro M1 to M5)

**Status: written for a Mac but NOT yet run on one.** Everything here was built and verified on Windows. The scripts avoid Windows-only
paths and the dependencies all publish macOS arm64 builds, but your first run is the real test. If a step fails, copy the error to
Claude Code in this repo and it will fix the step.

Cost is still $0. Leave every API key in `.env` empty.

## 1. Prerequisites (once)
- macOS 12.3 or later. About 10 GB free disk for tools, plus room for renders (a 40 s short is about 6 MB; working files are far bigger).
- **Homebrew:** install from https://brew.sh, then open a new Terminal.
- **Claude Code:** `npm install -g @anthropic-ai/claude-code` (after step 2 installs Node), or the installer from the Claude Code docs. You need a Claude Pro/Max login.

## 2. Install everything
```bash
git clone <repo-url> OpenMontage && cd OpenMontage
git checkout studio/reusable-production      # or main, once merged
bash scripts/setup_mac.sh
```
The script installs ffmpeg, Node, Python 3.11 and Manim's drawing libraries with Homebrew, builds `.venv`, installs the Python and
Remotion packages, downloads two Piper voices, creates `.env`, and ends with the readiness check. It is safe to re-run.

## 3. Every new terminal
```bash
cd OpenMontage
source .venv/bin/activate
python scripts/studio_preflight.py        # expect 0 FAIL
claude                                    # then type /reel
```
Forgetting `source .venv/bin/activate` makes `piper_tts` and `math_animate` show as unavailable. The preflight prints a "venv on PATH" line for this.

## 4. What works and what to expect on a Mac
| Route | Mac status |
|---|---|
| Remotion (text, captions, composition), ffmpeg encode, Piper voice, Whisper timings | Expected to work (arm64 builds exist). Untested on Mac. |
| Kokoro voice via `npx hyperframes tts` | Needs `HYPERFRAMES_PYTHON=$PWD/.venv/bin/python`. First use downloads about 600 MB. Untested on Mac. |
| Manim (chalkboard route) | Needs cairo/pango (the script installs them). Plain text only; LaTeX maths (`MathTex`) needs a TeX install (`brew install --cask mactex-no-gui`, large) and is untested. |
| Three.js world via HyperFrames | Uses headless Chrome from npm. Expected to work. Untested on Mac. |
| Blender 3D route | Optional. Install Blender **4.5 LTS** from blender.org (the scripts were written against 4.5; newer versions may differ). Put `Blender.app` in `/Applications`, or set `BLENDER_PATH=/Applications/Blender.app/Contents/MacOS/Blender`. Untested on Mac. |
| Local AI video/image generation | Skip. 16 GB unified memory is too tight and it is not part of the $0 routes. |

Machine notes (estimates, not measured): a fanless Air throttles on long renders, so prefer shorts and keep Remotion concurrency at 2.
Close heavy apps while rendering. Renders that took about 2 minutes on the Windows PC may take similar or longer.

## 5. Project rules that still apply
Read `CLAUDE.md` once: every video goes through a pipeline, the agent stops at approval gates and waits for you, and nothing paid is used
without your approval. `docs/STUDIO_GUIDE.md` explains the loop and gates; ignore its Windows-specific paths. Recipes for the proven
looks are in `docs/route-probes/`.

## 6. Troubleshooting
- `brew: command not found` after installing: run `eval "$(/opt/homebrew/bin/brew shellenv)"` or open a new Terminal.
- `pycairo` / `ManimPango` build errors: `brew install cairo pango pkg-config`, then `pip install -r requirements-studio.txt` again.
- Remotion complains about a missing compositor: `cd remotion-composer && rm -rf node_modules && npm install`.
- Blender "not found": see the Blender row above, then re-run `python scripts/studio_preflight.py`.
- macOS blocks Blender or a binary ("cannot be opened"): System Settings > Privacy & Security > Open Anyway.
