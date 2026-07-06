# Before/after demo video

Tooling that produced the "Frontend refresh — before & after" video: Playwright
records per-scene clips of the old and new frontend, ffmpeg composes them with
title cards and caption chips into a single 1440x900 mp4.

## How it works

- `lib.mjs` — shared recorder: per-scene video contexts, a fake cursor overlay
  that follows the Playwright mouse, smooth scrolling, and a `meta.json` with
  per-clip `readyAt` offsets so composition can trim page-load dead time.
- `before.mjs` / `after.mjs` — scene scripts (login, home tour, events, event
  dialog, leave/sick days, expenses, dark mode). Log in as `bert@sesam.straat`.
- `render-cards.mjs` — renders the intro/Before/After/outro title cards and the
  caption chips (reads `captions.json`, writes PNGs at 2x).
- `compose.mjs` — timeline: trims each clip, overlays captions, encodes
  segments, concatenates to `workday-before-after.mp4`.

## Regenerating

Requires ffmpeg, a Playwright chromium (scripts point at
`/opt/pw-browsers/chromium` — adjust for your machine), and Roboto installed.

1. Run backend (`-Pdevelop -Dspring-boot.run.profiles=develop`) + `npm start`
   for the **new** frontend, then:
   `node after.mjs <work>/clips-after http://localhost:3000`
2. Check out the pre-refresh commit (the video used `c58c987`, the parent of
   the design-token theme PR #522) in a worktree, build & run it, then:
   `node before.mjs <work>/clips-before http://localhost:<port>`
3. `mkdir <work>/cards && cp captions.json <work>/cards/ && node render-cards.mjs <work>/cards`
4. `node compose.mjs <work>` → `<work>/workday-before-after.mp4`

Scene timings, captions and per-clip trim tweaks live at the top of
`compose.mjs` (`timeline`) and in `captions.json`.
