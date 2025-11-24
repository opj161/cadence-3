import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { getCreativeSuggestion } from '../services/geminiService';
import { Language } from '../types';

interface CreativeAssistProps {
  isOpen: boolean;
  onClose: () => void;
  contextText: string;
  language: Language;
  onInsert: (text: string) => void;
}

export const CreativeAssist: React.FC<CreativeAssistProps> = ({ 
  isOpen, 
  onClose, 
  contextText, 
  language,
  onInsert 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const handleGenerate = async (type: string) => {
    setIsLoading(true);
    setSuggestion('');
    
    let instruction = prompt;
    if (type === 'rhyme') {
        instruction = "Suggest 5 creative rhymes for the last word in the lyrics provided.";
    } else if (type === 'continue') {
        instruction = "Write the next 2 lines following the rhythm and style of the provided lyrics.";
    }

    const result = await getCreativeSuggestion(contextText, instruction, language);
    setSuggestion(result);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl transform transition-transform duration-300 z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-5 h-5" />
          Creative Assist
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
            Quick Actions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleGenerate('rhyme')} disabled={isLoading}>
              Find Rhymes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleGenerate('continue')} disabled={isLoading}>
              Next Lines
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
            Custom Prompt
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Give me a metaphor about rain"
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate('custom')}
            />
            <Button variant="primary" size="sm" onClick={() => handleGenerate('custom')} disabled={isLoading || !prompt}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">Consulting the muse...</span>
          </div>
        )}

        {suggestion && !isLoading && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/50">
             <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">Suggestion:</h3>
             <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-300 font-mono mb-4">
               {suggestion}
             </pre>
             <Button variant="secondary" size="sm" className="w-full" onClick={() => onInsert(suggestion)}>
               Insert into Editor
             </Button>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 text-center">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};
