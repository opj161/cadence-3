import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { Editor } from './components/Editor';
import { StatsBar } from './components/StatsBar';
import { CreativeAssist } from './components/CreativeAssist';
import { Button } from './components/Button';
import { analyzeText, getDocumentStats } from './services/syllableService';
import { Language, Theme } from './types';
import { 
  Moon, Sun, Download, Trash2, 
  Sparkles, ToggleLeft, ToggleRight, Type
} from 'lucide-react';

const DEFAULT_TEXT = `[Verse 1]
The city sleeps under a blanket of gray
I search for the words that I cannot say
# This line needs a better rhyme
My heart beats a rhythm, a steady decay

[Chorus]
Cadence calling out my name
Lighting up the dark again
`;

export default function App() {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [showSyllables, setShowSyllables] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(16);
  const [isAssistOpen, setIsAssistOpen] = useState(false);

  // Performance Optimization:
  // Defer the heavy syllable analysis so typing remains buttery smooth.
  // The UI will update the textarea immediately, while the overlay catches up.
  const deferredText = useDeferredValue(text);

  // Apply theme to HTML tag
  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Expensive analysis runs on deferred text
  const lineStats = useMemo(() => analyzeText(deferredText, language), [deferredText, language]);
  const docStats = useMemo(() => getDocumentStats(lineStats), [lineStats]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  const handleExport = (type: 'txt' | 'html') => {
    let content = text;
    let mimeType = 'text/plain';
    
    if (type === 'html') {
      mimeType = 'text/html';
      content = `<html><body><pre>${text}</pre></body></html>`;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lyrics.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInsertAssist = (insertion: string) => {
    setText(prev => prev + (prev.endsWith('\n') ? '' : '\n') + insertion);
    setIsAssistOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shrink-0 z-20 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans">Cadence</h1>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Studio Edition</span>
          </div>
          
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
          
          {/* Language Toggle - Pill Design */}
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-full p-1 border border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => setLanguage(Language.EN)}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all duration-200 ${language === Language.EN ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage(Language.DE)}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all duration-200 ${language === Language.DE ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              DE
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Editor Controls Group */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
            <Button variant="ghost" size="sm" onClick={() => setShowSyllables(!showSyllables)} title="Toggle Visualizer">
               {showSyllables ? <ToggleRight className="text-indigo-500 w-5 h-5" /> : <ToggleLeft className="text-gray-400 w-5 h-5" />}
            </Button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
             <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.max(12, fontSize - 2))} title="Smaller Text">
              <Type className="w-3 h-3" />
              <span className="sr-only">Decrease Font</span>
            </Button>
            <span className="text-xs font-mono text-gray-400 w-6 text-center">{fontSize}</span>
            <Button variant="ghost" size="sm" onClick={() => setFontSize(Math.min(32, fontSize + 2))} title="Larger Text">
              <Type className="w-4 h-4" />
              <span className="sr-only">Increase Font</span>
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

          <Button variant="ghost" size="icon" onClick={() => handleExport('txt')} title="Export TXT">
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => setText('')} title="Clear Text">
            <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
             {theme === Theme.LIGHT ? <Moon className="w-4 h-4 text-gray-600" /> : <Sun className="w-4 h-4 text-gray-400" />}
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            className="ml-2 gap-2 shadow-lg shadow-indigo-500/20"
            onClick={() => setIsAssistOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">Assist</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        <Editor 
          text={text} 
          setText={setText} 
          lines={lineStats} 
          showSyllables={showSyllables}
          fontSize={fontSize}
        />
        
        <CreativeAssist 
          isOpen={isAssistOpen} 
          onClose={() => setIsAssistOpen(false)}
          contextText={text}
          language={language}
          onInsert={handleInsertAssist}
        />
      </main>

      {/* Footer Stats */}
      <StatsBar stats={docStats} />
    </div>
  );
}