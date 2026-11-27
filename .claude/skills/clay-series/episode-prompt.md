# Episode script prompt (clay series)

```
Write a [30]-second dialogue for the clay characters [pip: curious kid who asks; moss: calm professor] about [one idea].
Output JSON lines for projects/<id>/episode.json: speaker, text, action (optional), props (optional).
Structure: line 1 the question (pip), lines 2-3 the answer in ONE image (moss), line 4-5 the reveal or the reaction (pip), last line the takeaway.
Rules: each line under 14 words; contractions; plain words; no em dashes; characters never read an on-screen word list.
The hook is the question: it must also work as frame-0 text (under 8 words). Give four hook options.
For each line give a prop plan: type, lane (z 5.5-8.5, x within +-2.5), the exact word it lands on, anim.
Every fact has a source URL; list unverified ones as UNVERIFIED.
Check: mute test (does each line move with sound off?), one idea, takeaway repeatable, ask appears once.
```
Formats that suit the cast: "Why is X?", "Myth vs fact" (two props: a red cross and a green tick are not in the kit yet; use `ball` colours), "Tiny story" (one prop per beat), "Two characters argue" (alternate lines, `lean`, `surprise`, `shrug` actions).
