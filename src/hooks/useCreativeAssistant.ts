import { useState, useCallback } from 'react';
import { streamCreativeSuggestion } from '../services/geminiService';
import { Language } from '../types/index';

export type AssistType = 'rhyme' | 'continue' | 'custom';

export const useCreativeAssistant = (contextText: string, language: Language) => {
  const [suggestion, setSuggestion] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLastWord = (text: string): string => {
      const lines = text.split('\n').filter(l => l.trim() !== '' && !l.startsWith('[') && !l.startsWith('#'));
      if (lines.length === 0) return '';
      const lastLine = lines[lines.length - 1];
      const words = lastLine.replace(/[^\p{L}\p{M}\s'-]/gu, '').trim().split(/\s+/);
      return words.length > 0 ? words[words.length - 1] : '';
  };

  const generate = useCallback(async (type: AssistType, customPrompt?: string) => {
    if (isStreaming) return;
    
    setSuggestion('');
    setError(null);
    setIsStreaming(true);
    
    let prompt = customPrompt || '';
    const langName = language === Language.DE ? "German" : "English";
    const systemInstruction = `You are a sophisticated songwriting assistant. User writes in ${langName}. Provide concise, artistic output. No conversational filler.`;

    try {
        if (type === 'rhyme') {
            const word = getLastWord(contextText);
            if (!word) throw new Error("Need lyrics to find a rhyme.");
            prompt = `List 8-10 creative rhymes for "${word}". Format as simple list.`;
        } else if (type === 'continue') {
            const context = contextText.slice(-600);
            prompt = `Continue these lyrics with 4 lines matching rhythm/tone:\n\n"${context}"`;
        }
        
        const stream = streamCreativeSuggestion(prompt, systemInstruction, language);
        
        for await (const chunk of stream) {
            setSuggestion(prev => prev + chunk);
        }

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to generate suggestion.";
        setError(message);
    } finally {
        setIsStreaming(false);
    }
  }, [contextText, language, isStreaming]);

  return {
    suggestion,
    isStreaming,
    error,
    generate
  };
};
