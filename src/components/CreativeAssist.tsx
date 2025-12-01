import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, X, Loader2, MessageSquarePlus, Music, Key, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useCreativeAssistant, AssistType } from '../hooks/useCreativeAssistant';
import { Language } from '../types/index';

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
  const [customPrompt, setCustomPrompt] = useState('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLPreElement>(null);
  
  // Custom Hook handles logic
  const { suggestion, isStreaming, error, generate } = useCreativeAssistant(contextText, language);

  useEffect(() => {
    if (isOpen) checkApiKey();
  }, [isOpen]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [suggestion]);

  const checkApiKey = async () => {
    if (window.aistudio) {
        setHasApiKey(await window.aistudio.hasSelectedApiKey());
    } else {
        setHasApiKey(true); // Dev fallback
    }
  };

  const handleConnectKey = async () => {
      if (window.aistudio) {
          await window.aistudio.openSelectKey();
          setTimeout(checkApiKey, 500);
      }
  };

  const handleGenerate = (type: AssistType) => {
    if (hasApiKey === false) {
        handleConnectKey();
        return;
    }
    generate(type, type === 'custom' ? customPrompt : undefined);
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
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Metaphors for silence..."
              className="flex-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow text-gray-900 dark:text-gray-100 placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate('custom')}
              disabled={isStreaming}
            />
            <Button variant="primary" size="icon" onClick={() => handleGenerate('custom')} disabled={isStreaming || !customPrompt}>
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center space-y-2">
            <div className="text-red-600 dark:text-red-500 font-medium text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Error
            </div>
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

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
               ref={scrollRef}
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
