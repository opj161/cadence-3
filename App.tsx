import React, { useState, useEffect, useMemo } from 'react';
import { Editor } from './components/Editor';
import { StatsBar } from './components/StatsBar';
import { CreativeAssist } from './components/CreativeAssist';
import { Button } from './components/Button';
import { analyzeText, getDocumentStats } from './services/syllableService';
import { Language, Theme } from './types';
import { 
  Moon, Sun, Type, Download, Trash2, 
  Sparkles, Monitor, Dot, ToggleLeft, ToggleRight 
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
  const [theme, setTheme] = useState<Theme>(Theme.DARK); // Default to Studio Mode
  const [showSyllables, setShowSyllables] = useState<boolean>(true); // Default to TRUE so user sees value immediately
  const [fontSize, setFontSize] = useState<number>(16);
  const [isAssistOpen, setIsAssistOpen] = useState(false);

  // Apply theme to HTML tag
  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Real-time analysis
  // We use useMemo so we don't recalculate on every purely UI render (like sidebar toggle)
  const lineStats = useMemo(() => analyzeText(text, language), [text, language]);
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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Cadence</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Bilingual Editor</span>
          </div>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
          
          {/* Language Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button 
              onClick={() => setLanguage(Language.EN)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${language === Language.EN ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage(Language.DE)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${language === Language.DE ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
            >
              DE
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Editor Controls */}
          <Button variant="ghost" size="icon" onClick={() => setShowSyllables(!showSyllables)} title="Toggle Syllable Dots">
            {showSyllables ? <ToggleRight className="text-indigo-500" /> : <ToggleLeft />}
          </Button>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

          <Button variant="ghost" size="icon" onClick={() => setFontSize(Math.max(12, fontSize - 2))} title="Smaller Text">
            <span className="text-xs font-bold">A-</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setFontSize(Math.min(32, fontSize + 2))} title="Larger Text">
            <span className="text-lg font-bold">A+</span>
          </Button>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

          <Button variant="ghost" size="icon" onClick={() => handleExport('txt')} title="Export TXT">
            <Download className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => setText('')} title="Clear Text">
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
             {theme === Theme.LIGHT ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            className="ml-4 gap-2 hidden md:inline-flex"
            onClick={() => setIsAssistOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            <span>Assist</span>
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