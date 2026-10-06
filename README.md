# DevFest Noida 2026 — Badge Generator

Static page. No build step, no server code, no dependencies besides Google Fonts (Outfit).

## Deploy

Copy this folder's contents so that `index.html` is served at `/badge`:

```
/badge/index.html
/badge/badge.js
/badge/assets/*
```

Asset paths are relative, so it also works at any other path or as a subfolder of a static host (Netlify, Vercel, GitHub Pages, Firebase Hosting, S3).

## Editing

- Copy, links, event date/venue in the page: `index.html`
- Caption, venue line on the badge, colours, layout coordinates: top of `badge.js`
- Badge backgrounds (1080×1920): `assets/df-story-{green,yellow,blue,red}.png`
  Post format (1080×1350) crops the top of the same image.

## Privacy

Photos are processed entirely in the browser with Canvas. Nothing is uploaded.
