# Style library (original cards)

One file per style. A card describes a *look recipe* for a given production route. It is not a playbook:
`styles/*.yaml` playbooks (colours, type, pacing for the whole video) stay the project-level identity; a card is picked
per scene via `production.style_id` in the scene plan and tells the route how to build that scene.

Credit: the card structure (Look / Motion / Light / Camera / Good for) is inspired by the public style-atlas format
shown on Futurepedia. The specs here are written from scratch; nothing is copied.

Card frontmatter: `id` (= filename), `name`, `routes` (allowed `production.route` values), `status`.
`status: untested` means nobody has rendered this card as a finished look on this machine. Update it to `verified` only after a real render.
Route-level small tests (2026-11-20) passed for manim, threejs (blockout) and hyperframes, so every route a card names has rendered at least once; that is not the same as the card looking right.

Cards: blueprint-isometric, paper-cutout-diorama, tabletop-miniature, chalkboard-derivation, clean-data-motion, night-city-neon.
