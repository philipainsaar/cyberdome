# Three Outfit Select (GLB only)

A Next.js + Three.js outfit selection screen that loads only `.glb` models from `public/outfits/`.

## Features

- GLB-only outfit carousel
- Drag to rotate outfit
- Long swipe left/right to move between outfits
- Mobile-safe layout
- Auto-scan of `public/outfits/`
- Black cyber game-menu background
- Dense neon green Three.js sparkle particles
- Slow glowing particle drift
- Neon floor grid in the background scene
- Scanline and laser-sweep UI overlay
- Stronger green glow on cards, buttons, and HUD
- Optional autoplay background video or fallback JPG image

## Outfit folder

Put your models here:

```txt
public/outfits/
```

Example:

```txt
public/outfits/outfit-01.glb
public/outfits/outfit-02.glb
public/outfits/cyber-kawaii.glb
public/outfits/pastel-mecha.glb
```

## Optional background media

You can also add either of these files:

```txt
public/backgrounds/background.mp4
public/backgrounds/background.jpg
```

How it works:

- If `background.mp4` exists, it autoplay loops in the background.
- If the `.mp4` is missing or fails, it falls back to `background.jpg`.
- If both are missing, it stays black with neon green Three.js sparkle FX.

## Run

```bash
npm install
npm run dev
```

## Main files

- `components/OutfitSelect.jsx`
- `app/globals.css`
- `app/api/outfits/route.js`

## MP4 background note

The neon sparkle Three.js canvas is transparent, so `public/backgrounds/background.mp4` can show behind the particles. Keep the filename lowercase unless you update the path in `components/OutfitSelect.jsx`.
