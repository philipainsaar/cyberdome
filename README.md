# Three.js + Next.js GLB Outfit Select

This version is **GLB only**. It does not use placeholder 3D characters, OBJ, FBX, GLTF folders, or procedural outfit models.

## Add outfits

Put your `.glb` files here:

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

The website scans that folder through:

```txt
app/api/outfits/route.js
```

Only files ending in `.glb` are added to the carousel. The names are created from the filenames automatically.

## Controls

```txt
Drag character area = rotate current GLB
Long swipe left/right = next or previous GLB
Bottom cards = jump to GLB
Arrow buttons = next / previous
Keyboard arrows = next / previous
A / D keys = rotate
```

## Run

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Notes

- Client-side code cannot list files from `public/outfits` by itself, so this project uses a small Next.js API route to scan the folder.
- If you add new `.glb` files while the dev server is running, refresh the page.
- If a GLB loads blank, check that it opens correctly in a GLB viewer and that textures are embedded or correctly packed inside the `.glb`.
