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
  /** Replacement text used by the editor overlay/decorations. */
  display: string;
  /** Syllable parts for the token's lexical segments. */
  syllables: string[];
  /** Counted syllables for this token. */
  count: number;
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

export interface GeminiResponse {
  text: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
