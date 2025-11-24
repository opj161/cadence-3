import React, { useRef } from 'react';
import { LineStats } from '../types';

interface EditorProps {
  text: string;
  setText: (text: string) => void;
  lines: LineStats[];
  showSyllables: boolean;
  fontSize: number;
}

export const Editor: React.FC<EditorProps> = ({ 
  text, 
  setText, 
  lines, 
  showSyllables,
  fontSize 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between textarea, backdrop, and gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (backdropRef.current) backdropRef.current.scrollTop = scrollTop;
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  };

  // Adjust styling based on user preference
  const fontStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: '1.6',
    fontFamily: '"JetBrains Mono", monospace',
  };

  return (
    <div className="relative flex-1 flex overflow-hidden bg-white dark:bg-gray-950">
      {/* 1. Gutter (Syllable Count) */}
      <div 
        ref={gutterRef}
        className="w-12 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-right py-4 select-none overflow-hidden no-scrollbar"
      >
        {lines.map((line, i) => (
          <div 
            key={i} 
            style={{ ...fontStyle, height: 'auto' }} 
            className={`pr-3 ${
              line.isHeader || line.isComment || line.text.trim() === '' 
                ? 'text-transparent' 
                : 'text-gray-400 dark:text-gray-500 font-medium'
            }`}
          >
            {line.syllableCount > 0 ? line.syllableCount : '-'}
          </div>
        ))}
        {/* Extra space at bottom for scroll comfort */}
        <div className="h-64"></div>
      </div>

      {/* 2. Editor Area (Container for Overlay + Input) */}
      <div className="relative flex-1 h-full">
        
        {/* A. Backdrop Layer (Visualizer) */}
        {/* This layer handles syntax highlighting and dot visualization. */}
        <div 
          ref={backdropRef}
          className="absolute inset-0 p-4 pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
          style={{ ...fontStyle }}
          aria-hidden="true"
        >
          {lines.map((line, i) => {
            // Explicit rendering for Headers and Comments to ensure they appear
            if (line.isHeader) {
               return (
                 <div key={i} className="text-indigo-600 dark:text-indigo-400 font-bold">
                   {line.text}
                 </div>
               );
            }
            if (line.isComment) {
               return (
                 <div key={i} className="text-gray-400 italic">
                   {line.text}
                 </div>
               );
            }

            // Normal lines
            return (
              <div key={i} className="text-gray-900 dark:text-gray-100">
                {/* Handle empty lines that might just be a newline in textarea */}
                {line.text.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  line.words.map((w, wIdx) => {
                    // Check if we should show hyphenation for this word
                    const shouldHyphenate = showSyllables && w.syllables.length > 1;
                    
                    if (shouldHyphenate) {
                      return (
                        <span key={wIdx}>
                          {w.syllables.map((part, partIdx) => (
                            <React.Fragment key={partIdx}>
                              {part}
                              {partIdx < w.syllables.length - 1 && (
                                <span className="text-indigo-400 dark:text-indigo-500 font-bold opacity-75">·</span>
                              )}
                            </React.Fragment>
                          ))}
                        </span>
                      );
                    }
                    
                    return <span key={wIdx}>{w.word}</span>;
                  })
                )}
              </div>
            );
          })}
          <div className="h-64"></div>
        </div>

        {/* B. Textarea Layer (Input) */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-4 bg-transparent border-0 resize-none outline-none whitespace-pre-wrap break-words text-transparent caret-indigo-500"
          style={{ ...fontStyle }}
          placeholder="Start writing your lyrics..."
        />
      </div>
    </div>
  );
};