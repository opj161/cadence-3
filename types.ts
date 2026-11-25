export enum Language {
  EN = 'EN',
  DE = 'DE'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface WordStats {
  /** Original token text, including surrounding punctuation. */
  word: string;
  /** Syllable parts for the token's lexical segments. */
  syllables: string[];
  /** Counted syllables for this token; may exceed `syllables.length` in English. */
  count: number;
  /** Offsets inside the token where syllable markers should be inserted. */
  markerOffsets: number[];
  /** Start offset inside the containing line. */
  from: number;
  /** End offset inside the containing line. */
  to: number;
}

export interface LineStats {
  text: string;
  syllableCount: number;
  isHeader: boolean;
  isComment: boolean;
  words: WordStats[];
}

export interface DocumentStats {
  wordCount: number;
  totalSyllables: number;
  avgSyllablesPerLine: number;
  lines: LineStats[];
}
