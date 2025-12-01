declare module 'hyphenation.de' {
  const pattern: unknown;
  export default pattern;
}

declare module 'hyphenation.en-us' {
  const pattern: unknown;
  export default pattern;
}

declare module 'hypher' {
  export default class Hypher {
    constructor(languagePattern: unknown);
    /**
     * Hyphenates a word.
     * Returns an array of syllables, or the original word in an array if it cannot be hyphenated.
     */
    hyphenate(word: string): string[];
  }
}
