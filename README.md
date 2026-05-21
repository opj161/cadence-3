# Cadence 3

Cadence is a lyric editor with live syllable counts and inline hyphenation markers.

## What changed in this fixed build

- Replaced the custom textarea/backdrop/gutter stack with a CodeMirror-based editor so syllable counts are attached to real editor lines.
- Restored stronger German syllable logic using the `hyphen` German and English pattern packages instead of the previous Hypher setup.
- Default language is now German, with a mismatch warning when the text appears to be in the other supported language.
- Fixed the dark theme so CodeMirror uses a real dark editor theme instead of inheriting light-mode defaults, and theme choice now persists across reloads.
- Removed deferred/stale text analysis from the visible editor path.
- Moved Tailwind into the Vite build pipeline and removed the browser Play CDN/import map setup.
- Removed production browser injection of Gemini API keys. AI assist now requires either a production-safe server proxy or a local-development-only `VITE_GEMINI_API_KEY`.
- Added a Vitest regression suite, `npm run typecheck`, and made `npm run build` run TypeScript before Vite.

## Run locally

Prerequisites: Node.js.

```bash
npm install
npm run dev
```

Optional local-only AI assist:

```bash
VITE_GEMINI_API_KEY=your_key npm run dev
```

Do not use browser-bundled API keys for production deployments. Route production AI calls through a server-side or edge-function proxy.

## Verify

```bash
npm test
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=moderate
```
