# Cadence 3

A lyric editor with live syllable counts and inline syllable markers, for German
and English. Static site, no backend: <https://opj161.github.io/cadence-3>

## How the syllables are worked out

Most tools count syllables with TeX hyphenation patterns. Those patterns encode
where a word may be *broken across a line*, which is not the same thing as where
it is *sung*. They deliberately leave out any break that would strand one letter,
so "Atemlos", "ewig" and "oral" come out one syllable short, and they have no
entry at all for hiatus like "The-a-ter". Measured against a hand-checked word
list, plain patterns get 82 % of German and 53 % of English words right.

So Cadence uses the patterns for what they are good at and nothing else:

- **German** - the vowel nuclei decide how many syllables a word has, because
  German spelling is regular enough for that. The patterns decide *where* each
  boundary sits, because they know morphology ("Glücks-ge-füh-le") that no letter
  rule recovers. Where the patterns are silent, a maximum-onset rule places the
  boundary. Over a whole song that fallback decides about 2 boundaries in 57 -
  the patterns still do the heavy lifting.
- **English** - spelling is too irregular for vowel counting (silent "e", "ea"
  as one vowel or two), so the count comes from the `syllable` package, which
  gets 96 % right. The visible markers still come from the patterns, so an
  English word may legitimately show fewer markers than its counted syllables.
- **English words in German lyrics** are read German-style by any letter rule
  ("li-ke", "te-am"). There is no reliable way to spot a loanword from its
  spelling, so `services/loanwords.ts` is a hand-checked whitelist. Add a word
  there when the editor over-counts it.

`services/syllableService.test.ts` holds the word lists this is measured against.

### Known limits

- Latinate words where two vowel letters may or may not be one sound
  ("Spa-ni-en" vs "Fa-mi-lie") are right only when the patterns have an opinion.
- The German rules over-count English words that are not in the whitelist.
- "every" is counted as sung ("ev'ry", 2), not as carefully spoken (3).

## Performance

The analysis is cached per line and per word, so typing re-analyses one line, not
the document. On a 400-line document: 3.6 ms for a full cold analysis, 0.2 ms per
keystroke, about 3 ms for CodeMirror to rebuild its decorations.

The German pattern file is ~102 kB gzipped - half of everything else put
together - so it is loaded on demand after first paint, and English readers never
download it. Until it arrives the vowel rules carry the counts on their own; the
editor re-renders when the patterns land.

## Run locally

Prerequisites: Node.js.

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=moderate
```
