# Goat Player — Compact Version 1

This package uses the compact black-and-gold layout approved for Goat Player.

## Included

- Official Goat Player logo
- Goaty mascot
- Play and pause
- Restart and end controls
- Song seek bar
- Horizontal volume control at 78% startup
- Saved volume preference
- Goaty travels with song progress
- Responsive layout
- Original generated demo tone only

## Privacy note

No personal music supplied during development is included in this package.

## Add a real track

1. Put the permitted audio file in `assets/`.
2. In `index.html`, change:

```html
<audio id="audio" src="assets/demo-tone.wav" preload="metadata"></audio>
```

3. Update the displayed title and artist in `index.html`.

Only publish audio you own or have permission to distribute.

## GitHub Pages

Upload the complete contents of this folder to the repository root, then enable GitHub Pages from the `main` branch.

## License

The code is MIT licensed. Visual and audio assets may have separate terms; preserve proof of permission for each asset.
