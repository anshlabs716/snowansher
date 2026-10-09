# Nuclear / Safe Mode Build

**`index-nuclear.html`** — Single-file, zero-dependency, stripped-down safe mode.

## What It Is
- Everything inlined: Three.js r128 + all 30 game modules + CSS + SVG icons
- **Zero external requests** — works via `file://` (double-click)
- No Python, no server, no CDN, no fonts to load
- Emergency START button + diagnostics panel included
- Full game features, just bundled

## Use When
- Regular `index.html` fails to load (blocked CDN, CSP, file:// issues)
- Quick test on any machine (winBLOWS, Linux, Mac)
- Offline play

## Clean Up
```bash
cd && rm -rf snowansher
```

That's it. Clone, play, delete.
