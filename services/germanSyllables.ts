/**
 * German syllable boundaries for *spoken* syllables (Sprechsilben).
 *
 * TeX hyphenation patterns only encode boundaries that are typographically
 * acceptable, so they systematically miss single-letter syllables ("A-tem-los",
 * "e-wig", "o-ral") and hiatus ("The-a-ter", "A-or-ta"). German orthography is
 * phonologically transparent enough that vowel nuclei give the reliable syllable
 * *count*; the patterns give the better boundary *position* because they know
 * morphology ("Glücks-ge-füh-le"). So we take the count from the nuclei and only
 * fall back to phonotactics where the patterns have nothing to say.
 */

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö', 'ü']);

/**
 * Letter pairs that spell a single long vowel or diphthong. Only pairs that are
 * a diphthong in native German words - "ao", "ea", "oe", "iä", "ui" are hiatus
 * ("Cha-os", "The-a-ter", "Po-e-sie", "Di-ät", "Ru-i-ne"). The pairs listed here
 * can still be hiatus in Latinate words ("Mu-se-um", "Ju-bi-lä-um"); those are
 * caught by a hyphenation-pattern boundary falling inside the pair.
 */
const NUCLEUS_DIGRAPHS = new Set([
  'aa', 'ee', 'oo', // long vowels
  'ai', 'au', 'äu', 'ei', 'eu', 'ey', 'ay', // diphthongs
  'ie', // long i
]);

/**
 * Consonant letter groups that spell one sound and therefore never split; the
 * whole group becomes the onset of the next syllable ("Zu-cker", "wa-schen").
 */
const CONSONANT_UNITS = ['dsch', 'sch', 'ch', 'ck', 'ph', 'rh', 'th', 'qu'];

/**
 * Clusters that may start a syllable inside a word, as long as the preceding
 * syllable keeps at least one consonant ("Klemp-ner", but "Fens-ter": "st" is a
 * word-initial onset only). Single consonants are handled separately.
 */
const INTERNAL_ONSETS = new Set([
  'bl', 'br', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'pl', 'pr', 'tr', 'zw',
  'schl', 'schm', 'schn', 'schr', 'schw',
]);

export interface Nucleus {
  start: number;
  length: number;
}

/**
 * Vowel nuclei of a word, in order. One nucleus = one spoken syllable.
 */
export function findNuclei(word: string): Nucleus[] {
  const lower = word.toLowerCase();
  const nuclei: Nucleus[] = [];

  for (let index = 0; index < lower.length; ) {
    const char = lower[index];

    if (!VOWELS.has(char)) {
      index += 1;
      continue;
    }

    // "qu" spells /kv/ - the u belongs to the onset ("Quel-le", not "Qu-el-le").
    if (char === 'u' && index > 0 && lower[index - 1] === 'q') {
      index += 1;
      continue;
    }

    // A "y" right after a vowel is a glide, not a nucleus ("lo-yal").
    if (char === 'y' && index > 0 && VOWELS.has(lower[index - 1])) {
      index += 1;
      continue;
    }

    const length = NUCLEUS_DIGRAPHS.has(lower.slice(index, index + 2)) ? 2 : 1;
    nuclei.push({ start: index, length });
    index += length;
  }

  return nuclei;
}

/**
 * Where the boundary goes inside the consonant run between two nuclei, when the
 * hyphenation patterns offer no opinion. Maximum onset principle, limited by
 * what German actually allows syllable-internally.
 */
function phonotacticCut(word: string, spanStart: number, spanEnd: number): number {
  const cluster = word.slice(spanStart, spanEnd).toLowerCase();

  // Hiatus ("The|a|ter") or a single consonant ("o|ral", "se|hen").
  if (cluster.length <= 1) {
    return spanStart;
  }

  // A digraph spelling one sound moves to the next syllable as a whole.
  const unit = CONSONANT_UNITS.find(candidate => cluster.endsWith(candidate));
  if (unit && unit.length < cluster.length) {
    return spanEnd - unit.length;
  }
  if (unit && unit.length === cluster.length) {
    return spanStart;
  }

  // Longest legal internal onset that still leaves a coda behind.
  for (let length = Math.min(cluster.length - 1, 4); length >= 2; length -= 1) {
    if (INTERNAL_ONSETS.has(cluster.slice(cluster.length - length))) {
      return spanEnd - length;
    }
  }

  // Default: the last consonant starts the next syllable ("Was|ser", "sit|zen").
  return spanEnd - 1;
}

/**
 * A hyphenation pattern never puts a boundary inside a diphthong, so a pattern
 * cut inside one of our two-letter nuclei means the pair is really hiatus:
 * "Mu-se-um", "Ju-bi-lä-um", "Pe-tro-le-um".
 */
function splitHiatusDigraphs(nuclei: Nucleus[], patternCuts: readonly number[]): Nucleus[] {
  if (patternCuts.length === 0) {
    return nuclei;
  }

  return nuclei.flatMap(nucleus =>
    nucleus.length === 2 && patternCuts.includes(nucleus.start + 1)
      ? [{ start: nucleus.start, length: 1 }, { start: nucleus.start + 1, length: 1 }]
      : [nucleus],
  );
}

/**
 * Syllable boundary offsets for a German word.
 *
 * @param word         a single lexical segment (letters only, may contain an apostrophe)
 * @param patternCuts  boundary offsets suggested by the hyphenation patterns
 * @returns            one offset per syllable boundary; `cuts.length + 1` syllables
 */
export function germanSyllableCuts(word: string, patternCuts: readonly number[]): number[] {
  const nuclei = splitHiatusDigraphs(findNuclei(word), patternCuts);
  if (nuclei.length < 2) {
    return [];
  }

  const cuts: number[] = [];

  for (let index = 0; index < nuclei.length - 1; index += 1) {
    const spanStart = nuclei[index].start + nuclei[index].length;
    const spanEnd = nuclei[index + 1].start;
    const fromPatterns = patternCuts.find(cut => cut >= spanStart && cut <= spanEnd);

    cuts.push(fromPatterns ?? phonotacticCut(word, spanStart, spanEnd));
  }

  return cuts;
}
