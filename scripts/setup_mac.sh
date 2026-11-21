#!/usr/bin/env bash
# One-shot setup for macOS (Apple Silicon). Safe to re-run. Installs nothing paid and asks for no API keys.
# Usage:  bash scripts/setup_mac.sh
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\n==> %s\n' "$*"; }

if [[ "$(uname -s)" != "Darwin" ]]; then echo "This script is for macOS. See docs/MAC_SETUP.md."; exit 1; fi

say "Homebrew"
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is missing. Install it from https://brew.sh, open a NEW terminal, then re-run this script."; exit 1
fi
# Apple Silicon keeps brew in /opt/homebrew; make sure this shell can see it.
[[ -x /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"

say "System packages (ffmpeg, node, python 3.11, cairo/pango for Manim)"
brew install ffmpeg node python@3.11 cairo pango pkg-config

say "Python virtual environment (.venv)"
PY="$(brew --prefix python@3.11)/bin/python3.11"
[[ -x .venv/bin/python ]] || "$PY" -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt -r requirements-studio.txt

say "Remotion (video composer)"
(cd remotion-composer && npm install)

say "Piper voices (~/.piper/models)"
mkdir -p "$HOME/.piper/models"
for v in en_US-lessac-medium en_US-ryan-high; do
  [[ -f "$HOME/.piper/models/$v.onnx" ]] || python -m piper.download_voices --download-dir "$HOME/.piper/models" "$v"
done

say "Environment file"
[[ -f .env ]] || { cp .env.example .env; echo "Created .env (leave API keys EMPTY: this studio runs at \$0)."; }

say "Readiness check"
python scripts/studio_preflight.py || true

cat <<MSG

Done. Every new terminal needs the venv first:
    source .venv/bin/activate        (or: export PATH="\$PWD/.venv/bin:\$PATH")
Then run  claude  in this folder and type  /reel
Blender is optional (only the Blender 3D route). See docs/MAC_SETUP.md.
MSG
