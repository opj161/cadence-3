import React, { useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import type { LineStats } from '../types';
import { Theme } from '../types';
import { createEditorTheme } from '../extensions/editorTheme';
import { pasteHandler } from '../extensions/pasteHandler';
import { setSyllableLinesEffect, syllableLinesField } from '../extensions/syllableData';
import { syllableDecorations } from '../extensions/syllableDecorations';
import { syllableGutter } from '../extensions/syllableGutter';

interface EditorProps {
  text: string;
  setText: (text: string) => void;
  lines: LineStats[];
  showSyllables: boolean;
  fontSize: number;
  theme: Theme;
}

export const Editor: React.FC<EditorProps> = ({
  text,
  setText,
  lines,
  showSyllables,
  fontSize,
  theme,
}) => {
  const viewRef = useRef<EditorView | null>(null);

  const extensions = useMemo<Extension[]>(() => [
    createEditorTheme(theme),
    EditorView.theme({
      '&': { fontSize: `${fontSize}px` },
    }),
    EditorView.lineWrapping,
    syllableLinesField,
    syllableGutter,
    syllableDecorations(showSyllables),
    pasteHandler,
    keymap.of([]),
  ], [fontSize, showSyllables, theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    view.dispatch({
      effects: setSyllableLinesEffect.of(lines),
    });
  }, [lines]);

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-gray-950">
      <CodeMirror
        value={text}
        height="100%"
        theme="none"
        extensions={extensions}
        onChange={value => setText(value)}
        onCreateEditor={view => {
          viewRef.current = view;
          view.dispatch({ effects: setSyllableLinesEffect.of(lines) });
        }}
        placeholder="Start writing..."
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: false,
          searchKeymap: true,
          foldKeymap: false,
          completionKeymap: false,
          lintKeymap: false,
          indentOnInput: false,
        }}
        className="h-full cadence-editor"
      />
    </div>
  );
};
