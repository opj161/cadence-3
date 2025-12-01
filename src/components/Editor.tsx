import React, { useRef } from 'react';
import { LineStats } from '../types/index';
import { useScrollSync } from '../hooks/useScrollSync';

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

  // Isolate complexity in the hook
  useScrollSync(textareaRef, [backdropRef, gutterRef]);

  const fontStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: '1.6',
    fontFamily: '"JetBrains Mono", monospace',
    letterSpacing: '0.01em',
  };

  // Shared classes to ensure exact pixel matching between layers
  const sharedLayoutClasses = "absolute inset-0 w-full h-full p-6 whitespace-pre-wrap break-words overflow-hidden";

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

      {/* 2. Editor Layers Container */}
      <div className="relative flex-1 h-full max-w-4xl">
        
        {/* A. Backdrop (Visualization) Layer */}
        <div 
          ref={backdropRef}
          className={`${sharedLayoutClasses} pointer-events-none z-0 scrollbar-hidden text-gray-900 dark:text-gray-100`}
          style={fontStyle}
          aria-hidden="true"
        >
          {lines.map((line, i) => (
             <div key={i} className="relative">
                {renderLineContent(line, showSyllables)}
             </div>
          ))}
          <div className="h-[50vh]"></div>
        </div>

        {/* B. Input Layer */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className={`${sharedLayoutClasses} z-10 bg-transparent border-0 resize-none outline-none text-transparent caret-indigo-500 dark:caret-indigo-400 overflow-y-scroll editor-layer`}
          style={fontStyle}
          placeholder="Start writing..."
          autoFocus
        />
      </div>
    </div>
  );
};

// Helper for pure rendering logic
const renderLineContent = (line: LineStats, showSyllables: boolean) => {
  if (line.isHeader) {
    return (
      <span className="inline-block my-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-sm font-bold uppercase tracking-wide border border-indigo-200 dark:border-indigo-800/50">
        {line.text.replace(/[\[\]]/g, '')}
      </span>
    );
  }
  
  if (line.isComment) {
    return <span className="text-gray-400 dark:text-gray-600 italic">{line.text}</span>;
  }

  if (line.text.length === 0) return <span>&nbsp;</span>;

  return line.words.map((w, wIdx) => {
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
  });
};