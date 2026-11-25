/**
 * English words that appear constantly in German pop lyrics.
 *
 * German spelling is read one vowel letter group at a time, so an English word
 * with a silent final "e" or an English vowel digraph gets one syllable too many
 * ("li-ke", "so-und", "te-am"). There is no reliable way to detect an English
 * loanword from its spelling alone - published work uses a lexicon - so this is
 * a hand-checked whitelist, consulted before the German rules.
 *
 * Entries are the English pronunciation as sung: "-" marks a syllable boundary,
 * no "-" means one syllable. Add a word here when the editor over-counts it.
 */
const ENGLISH_IN_GERMAN = [
  // silent final "e"
  'like', 'time', 'life', 'live', 'love', 'line', 'mine', 'nine', 'fine', 'wine',
  'shine', 'smile', 'while', 'style', 'drive', 'five', 'move', 'close', 'nose',
  'rose', 'home', 'phone', 'stone', 'alone', 'change', 'chance', 'dance', 'face',
  'place', 'space', 'race', 'grace', 'price', 'nice', 'ice', 'voice', 'choice',
  'noise', 'game', 'name', 'same', 'fame', 'make', 'take', 'fake', 'wake', 'late',
  'safe', 'side', 'wide', 'ride', 'white', 'bite', 'here', 'there', 'where',
  'more', 'store', 'sure', 'pure', 'fire', 'desire',
  // English vowel digraphs read as hiatus in German
  'team', 'dream', 'scream', 'clean', 'mean', 'deal', 'feel', 'real', 'jeans',
  'sound', 'ground', 'round', 'found', 'house', 'mouse', 'out', 'loud', 'cloud',
  'cool', 'school', 'good', 'blood', 'book', 'look', 'down', 'now', 'how',
  'heart', 'head', 'dead', 'break', 'beat', 'feat', 'seat',
  // common multisyllables
  'ba-by', 'crazy:cra-zy', 'mo-ney', 'par-ty', 'hap-py', 'to-night', 'a-lright',
  'for-ever', 'to-gether', 'what-ever', 'may-be', 'any-way', 'some-thing',
  'every-thing', 'night-life', 'life-time', 'sun-shine', 'moon-light',
].map(entry => entry.includes(':') ? entry.slice(entry.indexOf(':') + 1) : entry);

/** word (lower case, no hyphens) -> syllable boundary offsets */
export const LOANWORD_CUTS: ReadonlyMap<string, readonly number[]> = new Map(
  ENGLISH_IN_GERMAN.map(entry => {
    const cuts: number[] = [];
    let offset = 0;

    for (const part of entry.split('-').slice(0, -1)) {
      offset += part.length;
      cuts.push(offset);
    }

    return [entry.replace(/-/g, ''), cuts] as const;
  }),
);
