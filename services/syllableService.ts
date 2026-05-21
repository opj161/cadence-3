import { Language, LineStats, WordStats } from '../types';
import { hyphenateSync as hyphenateGerman } from 'hyphen/de';
import { hyphenateSync as hyphenateEnglish } from 'hyphen/en-us';

const SOFT_HYPHEN = '\u00ad';
const WORD_TOKEN_REGEX = /\S+/gu;
const LEXICAL_SEGMENT_REGEX = /[\p{L}\p{M}]+(?:[’'][\p{L}\p{M}]+)*/gu;
const GERMAN_SIGNAL_REGEX = /[äöüÄÖÜß]|\b(?:ich|wir|und|der|die|das|den|dem|ein|eine|einer|einen|nicht|uns|mich|dich|durch|nacht|augen|liebe|zeit|stadt)\b/iu;

const isSectionHeader = (line: string): boolean => /^\s*\[[^\]\n]+\]\s*$/.test(line);
const isCommentLine = (line: string): boolean => /^\s*#/.test(line);

function splitHyphenatedOutput(output: string): string[] {
  const parts = output
    .split(SOFT_HYPHEN)
    .map(part => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [output];
}

function hyphenateLexicalSegment(segment: string, lang: Language): string[] {
  const normalized = segment.normalize('NFC');
  const hyphenate = lang === Language.DE ? hyphenateGerman : hyphenateEnglish;

  try {
    const hyphenated = hyphenate(normalized, {
      hyphenChar: SOFT_HYPHEN,
      minWordLength: 2,
    });

    return splitHyphenatedOutput(hyphenated);
  } catch {
    return [segment];
  }
}

function analyzeToken(token: string, from: number, lang: Language): WordStats {
  let display = '';
  let cursor = 0;
  let count = 0;
  const syllables: string[] = [];
  const markerOffsets: number[] = [];

  for (const match of token.matchAll(LEXICAL_SEGMENT_REGEX)) {
    const index = match.index ?? 0;
    const segment = match[0];

    display += token.slice(cursor, index);

    const parts = hyphenateLexicalSegment(segment, lang);
    syllables.push(...parts);
    count += parts.length;
    display += parts.join('·');

    let markerOffset = 0;
    for (const part of parts.slice(0, -1)) {
      markerOffset += part.length;
      markerOffsets.push(index + markerOffset);
    }

    cursor = index + segment.length;
  }

  display += token.slice(cursor);

  return {
    word: token,
    display: display || token,
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

export const analyzeText = (text: string, lang: Language): LineStats[] => {
  const lines = text.split('\n');

  return lines.map(line => {
    const isHeader = isSectionHeader(line);
    const isComment = isCommentLine(line);

    if (isHeader || isComment || line.trim().length === 0) {
      return {
        text: line,
        syllableCount: 0,
        isHeader,
        isComment,
        words: [],
      };
    }

    const words: WordStats[] = [];
    let syllableCount = 0;

    for (const match of line.matchAll(WORD_TOKEN_REGEX)) {
      const token = match[0];
      const from = match.index ?? 0;
      const word = analyzeToken(token, from, lang);

      if (word.count > 0) {
        syllableCount += word.count;
      }

      words.push(word);
    }

    return {
      text: line,
      syllableCount,
      isHeader,
      isComment,
      words,
    };
  });
};

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
  hyphenateLexicalSegment,
};
