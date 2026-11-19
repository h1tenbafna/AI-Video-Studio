---
name: cost-and-qa
description: Report cost, time and quality for a production. Use at a gate, after a render, or when the user asks what a video cost or how long it took.
---

# Cost, time and QA

## Report
Run `python scripts/studio_report.py <project_id> [--claude-usd N]`. It is read-only and prints:
- stage elapsed times (derived from checkpoint timestamps, including review waits, so not working time)
- tool calls, failures and seconds from `events.jsonl` (error messages are not recorded there)
- tool-reported external spend; this must be $0
- Claude usage, shown separately and only if the user supplies a figure (it is not measured in the project)

Label every number as measured, derived or estimated. Never present an estimate as a result.

## QA before calling a video done
1. Render, then look at real frames (start, middle of each scene, end), not just the file existing.
2. Check legibility, framing, audio levels (voiceover on top, effects under it), caption timing and the length against the script.
3. Any non-zero external spend, or a blocked tool being used, is a failure: stop and report.
4. State what was not verified.
