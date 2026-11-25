import { describe, expect, it } from 'vitest';
import { Language } from '../types';
import { analyzeText, __testing } from './syllableService';

/**
 * This file deliberately never calls `loadPatterns`, so it exercises the first
 * few hundred milliseconds after a cold load, when the hyphenation patterns are
 * still downloading. The counts have to be right even then - only the marker
 * positions may be rougher.
 */
describe('before the hyphenation patterns arrive', () => {
  it('still counts German syllables correctly', () => {
    const counts: Record<string, number> = {
      Atemlos: 3, ewig: 2, oral: 2, Glücksgefühle: 4, unzertrennlich: 4,
      Nacht: 1, heute: 2, Liebe: 2, zusammenhält: 4, Straßen: 2,
    };

    for (const [word, expected] of Object.entries(counts)) {
      expect(__testing.syllabifySegment(word, Language.DE).count).toBe(expected);
    }
  });

  it('still counts English syllables correctly', () => {
    const counts: Record<string, number> = { every: 2, city: 2, tonight: 2, beautiful: 3 };

    for (const [word, expected] of Object.entries(counts)) {
      expect(__testing.syllabifySegment(word, Language.EN).count).toBe(expected);
    }
  });

  it('counts a chorus line correctly', () => {
    const [line] = analyzeText('Atemlos durch die Nacht', Language.DE);
    expect(line.syllableCount).toBe(6);
  });
});
