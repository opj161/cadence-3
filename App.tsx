import React, { useEffect, useMemo, useState } from 'react';
import { Editor } from './components/Editor';
import { StatsBar } from './components/StatsBar';
import { CreativeAssist } from './components/CreativeAssist';
import { Button } from './components/Button';
import { analyzeText, detectLanguage, getDocumentStats } from './services/syllableService';
import { applyTheme, persistTheme, resolveInitialTheme } from './services/themeService';
import { Language, Theme } from './types';
import { Download, Moon, Sparkles, Sun, ToggleLeft, ToggleRight, Trash2, Type } from 'lucide-react';

const DEFAULT_TEXT = `[Strophe 1]\nWir ziehen durch die Strassen\nAtemlos durch die Nacht\n`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default function App() {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [language, setLanguage] = useState<Language>(Language.DE);
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme());
  const [showSyllables, setShowSyllables] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(16);
  const [isAssistOpen, setIsAssistOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const detectedLanguage = useMemo(() => detectLanguage(text), [text]);
  const languageMismatch = text.trim().length > 80 && detectedLanguage !== language;
  const lineStats = useMemo(() => analyzeText(text, language), [text, language]);
  const docStats = useMemo(() => getDocumentStats(lineStats), [lineStats]);

  const handleExport = (type: 'txt' | 'html') => {
    const mimeType = type === 'html' ? 'text/html' : 'text/plain';
    const content = type === 'html'
      ? `<!doctype html><html><body><pre>${escapeHtml(text)}</pre></body></html>`
      : text;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lyrics.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInsertAssist = (insertion: string) => {
    setText(prev => prev + (prev.endsWith('\n') ? '' : '\n') + insertion);
    setIsAssistOpen(false);
  };

  const languageButtonClass = (value: Language) =>
    `rounded-full px-4 py-1 text-xs font-bold transition-all duration-200 ${language === value
      ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-400'
      : 'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans selection:bg-indigo-500/30 dark:bg-gray-950">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:shadow-none">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Cadence</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Studio Edition</span>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
          <div className="flex rounded-full border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900">
            <button onClick={() => setLanguage(Language.EN)} className={languageButtonClass(Language.EN)}>EN</button>
            <button onClick={() => setLanguage(Language.DE)} className={languageButtonClass(Language.DE)}>DE</button>
          </div>
          {languageMismatch && (
            <button
              onClick={() => setLanguage(detectedLanguage)}
              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            >
              Looks like {detectedLanguage}; switch?
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900">
            <Button variant="ghost" size="sm" onClick={() => setShowSyllables(!showSyllables)} title="Toggle syllable markers">
              {showSyllables ? <ToggleRight className="h-5 w-5 text-indigo-500" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
            </Button>
            <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <Button variant="ghost" size="sm" onClick={() => setFontSize(value => Math.max(12, value - 2))} title="Smaller text">
              <Type className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center font-mono text-xs text-gray-400">{fontSize}</span>
            <Button variant="ghost" size="sm" onClick={() => setFontSize(value => Math.min(32, value + 2))} title="Larger text">
              <Type className="h-4 w-4" />
            </Button>
          </div>
          <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-800" />
          <Button variant="ghost" size="icon" onClick={() => handleExport('txt')} title="Export TXT">
            <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setText('')} title="Clear text">
            <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(prev => prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)} title="Toggle theme">
            {theme === Theme.LIGHT ? <Moon className="h-4 w-4 text-gray-600" /> : <Sun className="h-4 w-4 text-gray-400" />}
          </Button>
          <Button variant="primary" size="sm" className="ml-2 gap-2 shadow-lg shadow-indigo-500/20" onClick={() => setIsAssistOpen(true)}>
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Assist</span>
          </Button>
        </div>
      </header>

      <main className="relative flex flex-1 overflow-hidden">
        <Editor text={text} setText={setText} lines={lineStats} showSyllables={showSyllables} fontSize={fontSize} theme={theme} />
        <CreativeAssist isOpen={isAssistOpen} onClose={() => setIsAssistOpen(false)} contextText={text} language={language} onInsert={handleInsertAssist} />
      </main>

      <StatsBar stats={docStats} />
    </div>
  );
}
