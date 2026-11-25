import { beforeAll, describe, expect, it } from 'vitest';
import { Language } from '../types';
import { analyzeText, getDocumentStats, loadPatterns, __testing } from './syllableService';

beforeAll(async () => {
  await Promise.all([loadPatterns(Language.DE), loadPatterns(Language.EN)]);
});

const split = (word: string, lang: Language) =>
  __testing.syllabifySegment(word, lang).parts.join('·');
const count = (word: string, lang: Language) => __testing.syllabifySegment(word, lang).count;

/**
 * Spoken syllable counts, hand-checked. These are the numbers a songwriter
 * counts when singing the line, not Duden line-break positions.
 */
const GERMAN_COUNTS: Record<string, number> = {
  // the cases TeX patterns miss: a syllable spelled with one vowel letter
  oral: 2, ewig: 2, Atemlos: 3, aber: 2, oben: 2, Ofen: 2, Abend: 2, elend: 2,
  Ehe: 2, Über: 2, Übermut: 3, Idee: 2, Union: 3, Ahnung: 2, ehrlich: 2,
  // hiatus
  Theater: 3, Aorta: 3, Chaos: 2, Poesie: 3, Diät: 2, Ruine: 3, Museum: 3,
  Jubiläum: 4, Idiot: 3, kreativ: 3, Video: 3, Radio: 3, Stadion: 3, Aktion: 3,
  Nation: 3, Familie: 3, Energie: 3,
  // ordinary words that already worked
  normal: 2, Augen: 2, Nacht: 1, Straßen: 2, unsre: 2, Küsse: 2, Haut: 1,
  Liebestattoo: 4, Helene: 3, Fischer: 2, Glücksgefühle: 4, unzertrennlich: 4,
  irgendwie: 3, unsterblich: 3, schwindelfrei: 3, Großes: 2, Kino: 2, heute: 2,
  tausend: 2, Alles: 2, meine: 2, steigen: 2, höchste: 2, dieser: 2, Halten: 2,
  zusammenhält: 4, richtig: 2, süchtig: 2, berauscht: 2, Fallschirm: 2,
  Freiheit: 2, perfekt: 2, pulsiert: 2, Zeit: 1, erwacht: 2, einfach: 2,
  Gefühl: 2, genau: 2, Musik: 2, Beton: 2, Autobahn: 3, Dienstag: 2, Zuhause: 3,
  Mädchen: 2, Männer: 2, Eier: 2, eine: 2, Zahl: 1, Hand: 1, und: 1, ist: 1,
  Komm: 1, nimm: 1, Eltern: 2, Osten: 2, Insel: 2, Ohr: 1, Uhr: 1, Öl: 1,
  Ärzte: 2, ziehen: 2, sehen: 2, Liebe: 2, Stadt: 1, Blick: 1, gezeigt: 2,
  Bilder: 2, vergisst: 2, Tabu: 2, lösche: 2, jedes: 2, Arme: 2, pur: 1, weg: 1,
  Quelle: 2, Herbst: 1, Angst: 1, Fenster: 2, Klempner: 2, Zucker: 2, Engel: 2,
  sitzen: 2, Wasser: 2, Hochzeit: 2, Achse: 2, lachen: 2, waschen: 2,
};

/** Where the boundary has to sit, not just how many there are. */
const GERMAN_SPLITS: Record<string, string> = {
  oral: 'o·ral',
  ewig: 'e·wig',
  Atemlos: 'A·tem·los',
  Theater: 'The·a·ter',
  Aorta: 'A·or·ta',
  Union: 'U·ni·on',
  Glücksgefühle: 'Glücks·ge·füh·le',
  unzertrennlich: 'un·zer·trenn·lich',
  Liebestattoo: 'Lie·bes·tat·too',
  sehen: 'se·hen',
  ziehen: 'zie·hen',
  Ahnung: 'Ah·nung',
  lachen: 'la·chen',
  waschen: 'wa·schen',
  Zucker: 'Zu·cker',
  Wasser: 'Was·ser',
  Engel: 'En·gel',
  Fenster: 'Fens·ter',
  Mädchen: 'Mäd·chen',
  Hochzeit: 'Hoch·zeit',
  Quelle: 'Quel·le',
};

const ENGLISH_COUNTS: Record<string, number> = {
  // "every" is sung "ev'ry", so 2 rather than the careful-speech 3
  oral: 2, every: 2, ever: 2, open: 2, even: 2, city: 2, baby: 2, money: 2,
  many: 2, very: 2, ready: 2, steady: 2, able: 2, about: 2, above: 2, idea: 3,
  item: 2, evil: 2, video: 3, like: 1, nine: 1, only: 2, early: 2, happy: 2,
  funny: 2, lady: 2, away: 2, rhythm: 2, under: 2, blanket: 2, decay: 2,
  cadence: 2, calling: 2, lighting: 2, again: 2, beautiful: 3, remember: 3,
  silence: 2, shadow: 2, people: 2, little: 2, listen: 2, tonight: 2, forever: 3,
};

describe('German syllables', () => {
  for (const [word, expected] of Object.entries(GERMAN_COUNTS)) {
    it(`counts ${word} as ${expected}`, () => {
      expect(count(word, Language.DE)).toBe(expected);
    });
  }

  for (const [word, expected] of Object.entries(GERMAN_SPLITS)) {
    it(`splits ${word} as ${expected}`, () => {
      expect(split(word, Language.DE)).toBe(expected);
    });
  }

  it('shows one marker per boundary', () => {
    const parts = __testing.syllabifySegment('Glücksgefühle', Language.DE);
    expect(parts.count).toBe(parts.parts.length);
  });

  it('reads English loanwords the way they are sung', () => {
    expect(count('like', Language.DE)).toBe(1);
    expect(count('Sound', Language.DE)).toBe(1);
    expect(count('Team', Language.DE)).toBe(1);
    expect(split('Baby', Language.DE)).toBe('Ba·by');
  });
});

describe('English syllables', () => {
  for (const [word, expected] of Object.entries(ENGLISH_COUNTS)) {
    it(`counts ${word} as ${expected}`, () => {
      expect(count(word, Language.EN)).toBe(expected);
    });
  }

  it('never shows more markers than the counted syllables', () => {
    for (const word of Object.keys(ENGLISH_COUNTS)) {
      const { parts, count: syllables } = __testing.syllabifySegment(word, Language.EN);
      expect(parts.length).toBeLessThanOrEqual(syllables);
    }
  });
});

describe('lines', () => {
  it('counts a chorus line the way it is sung', () => {
    const [line] = analyzeText('Atemlos durch die Nacht', Language.DE);
    expect(line.syllableCount).toBe(6);
  });

  it('keeps punctuation out of the syllables', () => {
    const [line] = analyzeText("Spür', was Liebe mit uns macht", Language.DE);
    expect(line.words.map(word => word.count)).toEqual([1, 1, 2, 1, 1, 1]);
  });

  it('splits a hyphenated compound at the hyphen', () => {
    const [line] = analyzeText('sixty-nine', Language.EN);
    expect(line.syllableCount).toBe(3);
    expect(line.words[0].markerOffsets).not.toContain(6);
  });

  it('ignores headers and comments', () => {
    const lines = analyzeText('[Refrain]\n# eine Notiz\nAtemlos', Language.DE);
    expect(lines[0].isHeader).toBe(true);
    expect(lines[1].isComment).toBe(true);
    expect(lines.map(line => line.syllableCount)).toEqual([0, 0, 3]);
    expect(getDocumentStats(lines).totalSyllables).toBe(3);
  });

  it('places markers at document offsets that stay inside the word', () => {
    const [line] = analyzeText('Wir ziehen durch die Straßen', Language.DE);

    for (const word of line.words) {
      for (const offset of word.markerOffsets) {
        expect(offset).toBeGreaterThan(0);
        expect(offset).toBeLessThan(word.to - word.from);
      }
    }
  });

  it('returns the same result from the cache', () => {
    const first = analyzeText('Atemlos durch die Nacht', Language.DE);
    const second = analyzeText('Atemlos durch die Nacht', Language.DE);
    expect(second[0].syllableCount).toBe(first[0].syllableCount);

    __testing.clearCaches();
    const third = analyzeText('Atemlos durch die Nacht', Language.DE);
    expect(third[0].syllableCount).toBe(first[0].syllableCount);
  });
});
