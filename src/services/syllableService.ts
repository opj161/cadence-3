import { Language, LineStats } from '../types/index';
import Hypher from 'hypher';
import german from 'hyphenation.de';
import english from 'hyphenation.en-us';

// 1. Initialize Engines once
const hyphenatorDE = new Hypher(german);
const hyphenatorEN = new Hypher(english);

// 2. Pre-compile Regex (Performance Optimization)
// Using Unicode property escapes for better international support
const WORD_CLEANER_REGEX = /[^\p{L}\p{M}\s'-]/gu;
const HEADER_REGEX = /^\[.*\]$/;
const COMMENT_REGEX = /^#/;
const TOKEN_SPLITTER = /(\s+)/;

// 3. Line Cache (Performance Optimization)
// Maps: "Language:LineText" -> LineStats
const lineCache = new Map<string, LineStats>();
const MAX_CACHE_SIZE = 2000;

const getCacheKey = (text: string, lang: Language) => `${lang}:${text}`;

const reconstructParts = (original: string, clean: string, parts: string[]): string[] => {
    if (parts.length === 0) return [original];
    if (parts.length === 1 && parts[0] === clean && original !== clean) return [original];

    const cleanIndex = original.indexOf(clean);
    if (cleanIndex === -1) return [original];

    const prefix = original.slice(0, cleanIndex);
    const suffix = original.slice(cleanIndex + clean.length);
    
    const result = [...parts];
    
    if (result.length > 0) {
        result[0] = prefix + result[0];
        result[result.length - 1] = result[result.length - 1] + suffix;
    }
    
    return result;
}

const analyzeLine = (line: string, lang: Language): LineStats => {
    // Check Cache first
    const cacheKey = getCacheKey(line, lang);
    const cached = lineCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const trimmed = line.trim();
    const isHeader = HEADER_REGEX.test(trimmed);
    const isComment = COMMENT_REGEX.test(trimmed);

    if (isHeader || isComment) {
        const stats: LineStats = {
            text: line,
            syllableCount: 0,
            isHeader,
            isComment,
            words: [{ word: line, syllables: [line], count: 0 }]
        };
        cacheResult(cacheKey, stats);
        return stats;
    }

    const tokens = line.split(TOKEN_SPLITTER);
    let totalLineSyllables = 0;
    const hyphenator = lang === Language.DE ? hyphenatorDE : hyphenatorEN;

    const words = tokens.map(token => {
        if (token.length === 0) return { word: '', syllables: [], count: 0 };
        if (/^\s+$/.test(token)) return { word: token, syllables: [token], count: 0 };

        // Clean using pre-compiled regex
        const cleanW = token.replace(WORD_CLEANER_REGEX, "");
        
        if (!cleanW) {
            return { word: token, syllables: [token], count: 0 };
        }

        const parts = hyphenator.hyphenate(cleanW);
        const finalParts = reconstructParts(token, cleanW, parts);
        const count = parts.length;
        
        totalLineSyllables += count;
        
        return {
            word: token,
            syllables: finalParts,
            count: count
        };
    });

    const result: LineStats = {
        text: line,
        syllableCount: totalLineSyllables,
        isHeader,
        isComment,
        words
    };

    cacheResult(cacheKey, result);
    return result;
};

const cacheResult = (key: string, result: LineStats) => {
    if (lineCache.size >= MAX_CACHE_SIZE) {
        // Evict 10% of cache size using FIFO approach for better efficiency
        const entriesToRemove = Math.max(1, Math.floor(MAX_CACHE_SIZE * 0.1));
        const keysToRemove = Array.from(lineCache.keys()).slice(0, entriesToRemove);
        keysToRemove.forEach(k => lineCache.delete(k));
    }
    lineCache.set(key, result);
};

export const analyzeText = (text: string, lang: Language): LineStats[] => {
  // We use the cached analyzer per line. 
  // This reduces complexity from O(total_chars) to O(changed_lines_chars).
  const lines = text.split('\n');
  return lines.map(line => analyzeLine(line, lang));
};

export const getDocumentStats = (lines: LineStats[]) => {
    const contentLines = lines.filter(l => !l.isHeader && !l.isComment && l.text.trim().length > 0);
    const totalSyllables = contentLines.reduce((acc, l) => acc + l.syllableCount, 0);
    const wordCount = contentLines.reduce((acc, l) => acc + l.words.filter(w => w.count > 0).length, 0);
    const avgSyllablesPerLine = contentLines.length > 0 ? totalSyllables / contentLines.length : 0;

    return {
        totalSyllables,
        wordCount,
        avgSyllablesPerLine,
        lines
    };
};