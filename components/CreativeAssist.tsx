import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, X, Loader2, MessageSquarePlus, Music, Key } from 'lucide-react';
import { Button } from './Button';
import { streamCreativeSuggestion } from '../services/geminiService';
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  
  // Auto-scroll to bottom of suggestion as it streams
  const suggestionRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (isOpen) {
        checkApiKey();
    }
  }, [isOpen]);

  useEffect(() => {
    if (suggestionRef.current) {
        suggestionRef.current.scrollTop = suggestionRef.current.scrollHeight;
    }
  }, [suggestion]);

  const checkApiKey = async () => {
    if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
    } else {
        // Fallback for dev environments without the wrapper
        setHasApiKey(true);
    }
  };

  const handleConnectKey = async () => {
      if (window.aistudio) {
          await window.aistudio.openSelectKey();
          // Small delay to allow state propagation, then recheck
          setTimeout(checkApiKey, 500);
      }
  };

  // Helper: Extract the last meaningful word for rhyme lookups
  const getLastWord = (text: string): string => {
      const lines = text.split('\n').filter(l => l.trim() !== '' && !l.startsWith('[') && !l.startsWith('#'));
      if (lines.length === 0) return '';
      const lastLine = lines[lines.length - 1];
      // Clean punctuation
      const words = lastLine.replace(/[^\w\säöüß'-]/g, '').trim().split(/\s+/);
      return words.length > 0 ? words[words.length - 1] : '';
  };

  const handleGenerate = async (type: 'rhyme' | 'continue' | 'custom') => {
    if (isStreaming) return;
    
    // Safety check for API Key before starting
    if (hasApiKey === false) {
        handleConnectKey();
        return;
    }

    setSuggestion('');
    setIsStreaming(true);
    
    let userPrompt = prompt;
    const langName = language === Language.DE ? "German" : "English";
    const systemInstruction = `You are a sophisticated songwriting assistant for a musician. The user is writing in ${langName}. Provide concise, artistic, and usable output. Do not include conversational filler like "Here are some suggestions". Just the content.`;

    try {
        if (type === 'rhyme') {
            const word = getLastWord(contextText);
            if (!word) {
                setSuggestion("I need some lyrics first to find a rhyme!");
                setIsStreaming(false);
                return;
            }
            userPrompt = `List 8-10 creative rhymes (including slant rhymes) for the word "${word}". Format them as a simple list.`;
        } else if (type === 'continue') {
            const context = contextText.slice(-600); // Send last 600 chars
            userPrompt = `Continue these lyrics with 4 more lines, matching the rhythm, tone, and rhyme scheme:\n\n"${context}"`;
        }
        
        // If custom, use the state 'prompt' as is.

        const stream = streamCreativeSuggestion(userPrompt, systemInstruction, language);
        
        for await (const chunk of stream) {
            setSuggestion(prev => prev + chunk);
        }

    } catch (error) {
        setSuggestion("Error: Could not connect to AI service. Please check your API key.");
    } finally {
        setIsStreaming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 z-30 flex flex-col font-sans">
      
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
          Creative Assist
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        
        {/* API Key Gate */}
        {hasApiKey === false && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center space-y-3">
                <div className="text-amber-600 dark:text-amber-500 font-medium text-sm">
                    API Key Required
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                    Connect a Google Cloud project to enable AI features.
                </p>
                <Button variant="secondary" size="sm" onClick={handleConnectKey} className="w-full gap-2">
                    <Key className="w-3 h-3" />
                    Connect Key
                </Button>
            </div>
        )}

        {/* Quick Actions */}
        <div className={`space-y-3 transition-opacity ${hasApiKey === false ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Quick Actions
          </label>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => handleGenerate('rhyme')} 
              disabled={isStreaming}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Find Rhymes</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Match the last word</div>
              </div>
            </button>

            <button 
              onClick={() => handleGenerate('continue')} 
              disabled={isStreaming}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">Continue Flow</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Write next 4 lines</div>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Prompt */}
        <div className={`space-y-3 transition-opacity ${hasApiKey === false ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Custom Prompt
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Metaphors for silence..."
              className="flex-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow text-gray-900 dark:text-gray-100 placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate('custom')}
              disabled={isStreaming}
            />
            <Button variant="primary" size="icon" onClick={() => handleGenerate('custom')} disabled={isStreaming || !prompt}>
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Output Area */}
        {(suggestion || isStreaming) && (
          <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/50 shadow-inner flex flex-col max-h-[300px]">
             <div className="flex justify-between items-center mb-3 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                    {isStreaming && <Loader2 className="w-3 h-3 animate-spin" />}
                    Suggestion
                </h3>
             </div>
             
             <pre 
               ref={suggestionRef}
               className="flex-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-300 font-mono leading-relaxed mb-4 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 overflow-y-auto scrollbar-thin"
             >
               {suggestion}
               {isStreaming && <span className="inline-block w-1.5 h-3 ml-1 bg-indigo-500 animate-pulse align-middle"></span>}
             </pre>
             
             <Button 
                variant="primary" 
                size="sm" 
                className="w-full shadow-lg shadow-indigo-500/20 shrink-0" 
                onClick={() => onInsert(suggestion)}
                disabled={isStreaming}
            >
               Insert into Editor
             </Button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-400 text-center font-mono shrink-0">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};
