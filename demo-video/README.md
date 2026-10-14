# Customer-feedback explainer video

This Remotion project produces a 148-second, 1920 × 1080, 30 fps explainer (opening page 7 s, closing page 10 s). It uses the actual recorded call in `public/audio/new-call.wav`, synchronized captions, and original background music from `public/audio/music/`. Names, brand, and product references are demo examples; the opening page says so clearly.

## Current state

- The opening and closing pages are branded **Voice Agent** (the `serviceName` prop). "Aurelia Perfumes" appears only as the labelled demo brand.
- `src/scenes/Disclaimer.tsx` (opening) and `src/scenes/Offer.tsx` (closing) use real CSS 3D: cards with visible thickness from `src/components/Depth.tsx`, perspective tilt that settles in the first 3 seconds, and floor glow.
- The opening has a mini QR (112 px); the closing "Live demo pass" has the full-size QR (304 px). Both link to `https://voiceagent.zohobookings.in/488248000000028078`, a free 30-minute Google Meet demo.
- Page colours come from `src/palette.ts`: `volt` (yellow & black, default), `crimson`, `ruby`, `wine`, `oxblood`, `noir`, `midnight`, `emerald`. Change the default in `src/config.ts` or pass `'{"palette":"crimson"}'` to the render script. Older colour previews are in `out/palettes/`.
- `out/preview-opening-3d.png` and `out/preview-offer-3d.png` show the approved yellow & black pages.

## Music

Five original tracks, each exactly as long as the video. Every track is light on the opening page, grooves through the explanation, drops to a quiet bed under the recorded call (the video lowers it a further 20 dB), and comes back for the results and booking page, ending on a final chord.

| `music` value | Feel |
| --- | --- |
| `warm-piano` | calm, premium, trustworthy |
| `bright-uplift` | positive, upbeat startup feel |
| `lofi-chill` | relaxed, friendly, modern |
| `modern-tech` | sleek, AI / tech product feel |
| `acoustic-hopeful` | warm, human, relatable (default) |

Listening samples (start of the video + ending) are in `out/music-samples/`. Pick a track with `'{"music":"lofi-chill"}'` as the render script's second argument, or change the default in `src/config.ts`. To change or recompose the music, edit `scripts/build_music.py` and run `.venv/bin/python scripts/build_music.py` (needs `python3 -m venv .venv && .venv/bin/pip install numpy` once).

## Render

Requires Node.js, npm, Python 3, and ffmpeg. Dependencies are installed in `node_modules`; if that directory is removed, run `npm ci` first. The render scripts use Remotion's bundled headless Chrome (downloaded automatically on first use). Do not point them at desktop Google Chrome: it renders the 3D cards on the opening and closing pages with occasional single-frame dropouts.

```bash
npm run typecheck
npm run studio
bash scripts/render.sh voice-agent-demo-3d
```

The render script creates a 1080p MP4 and thumbnail in `out/`. Pass `2` as the third argument for 4K, or `0.5` for a 540p draft. The optional second argument is a JSON object of composition props:

```bash
bash scripts/render.sh another-brand '{"brand":"Your Brand","product":"Your Product","music":"warm-piano"}'
```

If the browser crashes during a render (usually low memory), `bash scripts/render-safe.sh <name>` uses fewer parallel workers.

The default brand, contact line, and booking link are in `src/config.ts`. If `bookingUrl` is empty, the closing page shows product artwork instead of a QR. Check that any public booking page displays **Free** before distributing a video that advertises a free appointment. Changing text props does not change the names spoken in the recorded call.

## Source map

- `src/captions.ts` and `src/callFeedback.ts`: transcript timing and recorded feedback facts.
- `src/Explainer.tsx`: scene sequence and audio.
- `src/scenes/`: the seven video scenes.
- `src/components/`: shared vector artwork, layout, and animation helpers.
- `scripts/render.sh` / `scripts/render-safe.sh`: video render and audio mastering.
- `scripts/build_music.py`: composes the five music options and the listening samples.
- `raw/new-call-transcript.json`: reference transcript for the selected recording.

The illustrated live notes and Google Sheet rows are visual examples; they are not a connection to a live sheet. The music lowers during the recorded call so the speech remains clear.
