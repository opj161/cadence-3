export enum Language {
  EN = 'EN',
  DE = 'DE'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark' // Studio Mode
}

export interface LineStats {
  text: string;
  syllableCount: number;
  isHeader: boolean;
  isComment: boolean;
  words: {
    word: string;
    syllables: string[]; // e.g. ["beau", "ti", "ful"]
    count: number;
  }[];
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