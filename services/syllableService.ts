import { Language, LineStats, WordStats } from '../types';
import { syllable as countEnglishSyllables } from 'syllable';
import { germanSyllableCuts } from './germanSyllables';
import { LOANWORD_CUTS } from './loanwords';

const SOFT_HYPHEN = '­';
const WORD_TOKEN_REGEX = /\S+/gu;
const LEXICAL_SEGMENT_REGEX = /[\p{L}\p{M}]+(?:[’'][\p{L}\p{M}]+)*/gu;
const GERMAN_SIGNAL_REGEX = /[äöüÄÖÜß]|\b(?:ich|wir|und|der|die|das|den|dem|ein|eine|einer|einen|nicht|uns|mich|dich|durch|nacht|augen|liebe|zeit|stadt)\b/iu;

/** Lyrics repeat themselves; caches turn re-analysis of a refrain into lookups. */
const CACHE_LIMIT = 20000;
const segmentCache = new Map<string, SegmentSyllables>();
const lineCache = new Map<string, LineStats>();

type Hyphenator = (text: string, options: Record<string, unknown>) => string;

/**
 * The German pattern file is ~144 kB gzipped - more than everything else in the
 * app put together - and English readers never need it. So the patterns load on
 * demand; until they arrive the vowel rules carry German on their own and
 * `syllable` carries the English counts, and the editor re-renders when they land.
 */
const hyphenators = new Map<Language, Hyphenator>();
const pendingPatterns = new Map<Language, Promise<void>>();
const patternListeners = new Set<() => void>();
let patternVersion = 0;

export function loadPatterns(lang: Language): Promise<void> {
  if (hyphenators.has(lang)) {
    return Promise.resolve();
  }

  const pending = pendingPatterns.get(lang);
  if (pending) {
    return pending;
  }

  const load = (lang === Language.DE ? import('hyphen/de') : import('hyphen/en-us'))
    .then(module => {
      hyphenators.set(lang, module.hyphenateSync as unknown as Hyphenator);
      segmentCache.clear();
      lineCache.clear();
      patternVersion += 1;
      patternListeners.forEach(listener => listener());
    })
    .catch(() => {
      // Keep the rule-based fallback rather than breaking the editor.
    })
    .finally(() => {
      pendingPatterns.delete(lang);
    });

  pendingPatterns.set(lang, load);
  return load;
}

export function subscribeToPatterns(listener: () => void): () => void {
  patternListeners.add(listener);
  return () => patternListeners.delete(listener);
}

export const getPatternVersion = (): number => patternVersion;

interface SegmentSyllables {
  parts: string[];
  /** May exceed `parts.length` in English, where we know the count but not every boundary. */
  count: number;
}

const isSectionHeader = (line: string): boolean => /^\s*\[[^\]\n]+\]\s*$/.test(line);
const isCommentLine = (line: string): boolean => /^\s*#/.test(line);

function remember<T>(cache: Map<string, T>, key: string, value: T): T {
  if (cache.size >= CACHE_LIMIT) {
    cache.clear();
  }

  cache.set(key, value);
  return value;
}

/**
 * Boundary offsets the hyphenation patterns suggest. These are typographic
 * break points, not syllable boundaries, but where they exist they encode
 * morphology ("Glücks-ge-füh-le") that no letter rule can recover.
 */
function patternCuts(segment: string, lang: Language): number[] {
  const hyphenate = hyphenators.get(lang);
  if (!hyphenate) {
    return [];
  }

  let marked: string;
  try {
    marked = hyphenate(segment, { hyphenChar: SOFT_HYPHEN, minWordLength: 2, html: false });
  } catch {
    return [];
  }

  const cuts: number[] = [];
  const parts = marked.split(SOFT_HYPHEN);
  let offset = 0;

  for (let index = 0; index < parts.length - 1; index += 1) {
    offset += parts[index].length;
    cuts.push(offset);
  }

  return cuts;
}

function applyCuts(segment: string, cuts: readonly number[]): string[] {
  // A boundary at the very edge of a word would produce an empty syllable.
  const usable = [...new Set(cuts)]
    .filter(cut => cut > 0 && cut < segment.length)
    .sort((a, b) => a - b);

  if (usable.length === 0) {
    return [segment];
  }

  const parts: string[] = [];
  let previous = 0;

  for (const cut of usable) {
    parts.push(segment.slice(previous, cut));
    previous = cut;
  }

  parts.push(segment.slice(previous));
  return parts;
}

/**
 * German: the vowel nuclei decide how many syllables there are, the patterns
 * decide where the boundaries sit. English: `syllable` decides the count - TeX
 * patterns miss roughly half of all two-syllable words - while the boundaries
 * we can show still come from the patterns, so a word may legitimately carry
 * fewer visible markers than its count.
 */
function syllabifySegment(segment: string, lang: Language): SegmentSyllables {
  const key = `${lang}\u0000${segment}`;
  const cached = segmentCache.get(key);
  if (cached) {
    return cached;
  }

  const normalized = segment.normalize('NFC');
  const cuts = patternCuts(normalized, lang);

  if (lang === Language.DE) {
    const loanword = LOANWORD_CUTS.get(normalized.toLowerCase());
    const germanCuts = loanword ?? germanSyllableCuts(normalized, cuts);
    const parts = applyCuts(normalized, germanCuts);

    return remember(segmentCache, key, { parts, count: parts.length });
  }

  const parts = applyCuts(normalized, cuts);
  const count = Math.max(countEnglishSyllables(normalized), parts.length);

  return remember(segmentCache, key, { parts, count });
}

function analyzeToken(token: string, from: number, lang: Language): WordStats {
  const syllables: string[] = [];
  const markerOffsets: number[] = [];
  let count = 0;

  for (const match of token.matchAll(LEXICAL_SEGMENT_REGEX)) {
    const index = match.index ?? 0;
    const { parts, count: segmentCount } = syllabifySegment(match[0], lang);

    syllables.push(...parts);
    count += segmentCount;

    let markerOffset = 0;
    for (const part of parts.slice(0, -1)) {
      markerOffset += part.length;
      markerOffsets.push(index + markerOffset);
    }
  }

  return {
    word: token,
    syllables,
    count,
    markerOffsets,
    from,
    to: from + token.length,
  };
}

export function detectLanguage(text: string): Language {
  return GERMAN_SIGNAL_REGEX.test(text) ? Language.DE : Language.EN;
}

function analyzeLine(line: string, lang: Language): LineStats {
  const key = `${lang}\u0000${line}`;
  const cached = lineCache.get(key);
  if (cached) {
    return cached;
  }

  const isHeader = isSectionHeader(line);
  const isComment = isCommentLine(line);

  if (isHeader || isComment || line.trim().length === 0) {
    return remember(lineCache, key, {
      text: line,
      syllableCount: 0,
      isHeader,
      isComment,
      words: [],
    });
  }

  const words: WordStats[] = [];
  let syllableCount = 0;

  for (const match of line.matchAll(WORD_TOKEN_REGEX)) {
    const word = analyzeToken(match[0], match.index ?? 0, lang);
    syllableCount += word.count;
    words.push(word);
  }

  return remember(lineCache, key, {
    text: line,
    syllableCount,
    isHeader,
    isComment,
    words,
  });
}

export const analyzeText = (text: string, lang: Language): LineStats[] =>
  text.split('\n').map(line => analyzeLine(line, lang));

export const getDocumentStats = (lines: LineStats[]) => {
  const contentLines = lines.filter(
    line => !line.isHeader && !line.isComment && line.text.trim().length > 0,
  );

  const totalSyllables = contentLines.reduce((acc, line) => acc + line.syllableCount, 0);
  const wordCount = contentLines.reduce(
    (acc, line) => acc + line.words.filter(word => word.count > 0).length,
    0,
  );
  const avgSyllablesPerLine = contentLines.length > 0 ? totalSyllables / contentLines.length : 0;

  return {
    totalSyllables,
    wordCount,
    avgSyllablesPerLine,
    lines,
  };
};

export const __testing = {
  isSectionHeader,
  isCommentLine,
  syllabifySegment,
  patternCuts,
  clearCaches: () => {
    segmentCache.clear();
    lineCache.clear();
  },
};
