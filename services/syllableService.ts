import { Language, LineStats } from '../types';
// @ts-ignore
import Hypher from 'hypher';
// @ts-ignore
import german from 'hyphenation.de';
// @ts-ignore
import english from 'hyphenation.en-us';

// Initialize Hyphenation Engines
const hyphenatorDE = new Hypher(german);
const hyphenatorEN = new Hypher(english);

// Helper to re-attach punctuation to the split parts
// Example: token "(feiern," -> clean "feiern" -> parts ["fei", "ern"]
// Result: ["(fei", "ern,"]
const reconstructParts = (original: string, clean: string, parts: string[]): string[] => {
    if (parts.length === 0) return [original];
    if (parts.length === 1 && parts[0] === clean && original !== clean) return [original];

    // Find where the clean word sits in the original token
    const cleanIndex = original.indexOf(clean);
    
    // Safety fallback if regex cleaning was too aggressive/mismatched
    if (cleanIndex === -1) return [original];

    const prefix = original.slice(0, cleanIndex);
    const suffix = original.slice(cleanIndex + clean.length);

    const result = [...parts];
    
    // Attach prefix to first syllable
    if (result.length > 0) {
        result[0] = prefix + result[0];
    }
    
    // Attach suffix to last syllable
    if (result.length > 0) {
        result[result.length - 1] = result[result.length - 1] + suffix;
    }
    
    return result;
}

export const analyzeText = (text: string, lang: Language): LineStats[] => {
  const lines = text.split('\n');
  
  return lines.map(line => {
    // Regex to identify headers more robustly, handling potential trailing spaces
    const trimmed = line.trim();
    const isHeader = /^\[.*\]$/.test(trimmed);
    const isComment = trimmed.startsWith('#');
    
    // For headers and comments, we treat the entire line as a single token to preserve it 
    // and prevent syllable logic from breaking it up.
    if (isHeader || isComment) {
      return {
        text: line,
        syllableCount: 0,
        isHeader,
        isComment,
        words: [{ word: line, syllables: [line], count: 0 }]
      };
    }

    // Split line into tokens, preserving whitespace for reconstruction
    const tokens = line.split(/(\s+)/);
    
    let totalLineSyllables = 0;
    
    const words = tokens.map(token => {
        // If token is empty string (split artifact), return safe empty
        if (token.length === 0) return { word: '', syllables: [], count: 0 };

        // If token is just whitespace, preserve it but count 0
        if (/^\s+$/.test(token)) {
            return { word: token, syllables: [token], count: 0 };
        }

        // Clean the word for hyphenation (remove punctuation like commas, parens, etc.)
        // We keep characters that might be part of the word structure or international chars.
        const cleanW = token.replace(/[^\w\säöüß'-]/g, "");
        
        // If word became empty after cleaning (e.g. just punctuation "-"), treat as 0 count
        if(!cleanW) {
            return { word: token, syllables: [token], count: 0 };
        }

        const hyphenator = lang === Language.DE ? hyphenatorDE : hyphenatorEN;
        
        // Get hyphenation parts (e.g. ["fei", "ern"])
        // Note: Hypher returns the word itself in an array if it can't hyphenate it (count 1)
        const parts = hyphenator.hyphenate(cleanW);
        
        // Re-attach original punctuation (e.g. ["fei", "ern,"])
        const finalParts = reconstructParts(token, cleanW, parts);
        
        const count = parts.length;
        totalLineSyllables += count;
        
        return {
            word: token,
            syllables: finalParts,
            count: count
        };
    });

    return {
      text: line,
      syllableCount: totalLineSyllables,
      isHeader,
      isComment,
      words
    };
  });
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