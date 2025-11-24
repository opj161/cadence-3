import React, { useRef, useLayoutEffect } from 'react';
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

  // Synchronize scrolling precisely across all three panels
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    // Use requestAnimationFrame for smoother scroll locking
    requestAnimationFrame(() => {
        if (backdropRef.current) backdropRef.current.scrollTop = scrollTop;
        if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
    });
  };

  const fontStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: '1.6',
    fontFamily: '"JetBrains Mono", monospace',
    letterSpacing: '0.01em',
  };

  const paddingStyle = "p-6"; // Consistent padding

  return (
    <div className="relative flex-1 flex overflow-hidden bg-white dark:bg-gray-950">
      
      {/* 1. Gutter (Syllable Count) */}
      <div 
        ref={gutterRef}
        className={`w-14 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-right py-6 select-none overflow-hidden scrollbar-hidden editor-layer z-10`}
      >
        {lines.map((line, i) => (
          <div 
            key={i} 
            style={{ ...fontStyle, height: 'auto' }} 
            className={`pr-4 transition-colors duration-200 ${
              line.isHeader || line.isComment || line.text.trim().length === 0 
                ? 'text-transparent' 
                : 'text-gray-400 dark:text-gray-500 font-medium'
            }`}
          >
            {line.syllableCount > 0 ? line.syllableCount : '-'}
          </div>
        ))}
        <div className="h-[50vh]"></div>
      </div>

      {/* 2. Editor Container */}
      <div className="relative flex-1 h-full max-w-4xl">
        
        {/* A. Visual Backdrop Layer */}
        {/* pointer-events-none ensures clicks go through to the textarea */}
        <div 
          ref={backdropRef}
          className={`absolute inset-0 ${paddingStyle} pointer-events-none whitespace-pre-wrap break-words editor-layer scrollbar-hidden`}
          style={{ ...fontStyle }}
          aria-hidden="true"
        >
          {lines.map((line, i) => {
            // Distinct Pill Styling for Headers
            if (line.isHeader) {
               return (
                 <div key={i} className="inline-block my-1">
                   <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-sm font-bold uppercase tracking-wide border border-indigo-200 dark:border-indigo-800/50">
                     {line.text.replace(/[\[\]]/g, '')}
                   </span>
                 </div>
               );
            }
            
            // Dimmed styling for Comments
            if (line.isComment) {
               return (
                 <div key={i} className="text-gray-400 dark:text-gray-600 italic">
                   {line.text}
                 </div>
               );
            }

            // Normal Content Lines
            return (
              <div key={i} className="text-gray-900 dark:text-gray-100 relative">
                {line.text.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  line.words.map((w, wIdx) => {
                    const shouldHyphenate = showSyllables && w.syllables.length > 1;
                    
                    if (shouldHyphenate) {
                      return (
                        <span key={wIdx}>
                          {w.syllables.map((part, partIdx) => (
                            <React.Fragment key={partIdx}>
                              {part}
                              {partIdx < w.syllables.length - 1 && (
                                <span className="text-indigo-300 dark:text-indigo-600 font-bold mx-[1px]">·</span>
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
          <div className="h-[50vh]"></div>
        </div>

        {/* B. Input Layer */}
        {/* text-transparent allows the backdrop to show through, while caret color remains visible */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          className={`absolute inset-0 w-full h-full ${paddingStyle} bg-transparent border-0 resize-none outline-none whitespace-pre-wrap break-words text-transparent caret-indigo-500 dark:caret-indigo-400 editor-layer`}
          style={{ ...fontStyle }}
          placeholder="Start writing..."
          autoFocus
        />
      </div>
    </div>
  );
};