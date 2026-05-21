import { EditorView } from '@codemirror/view';
import { Theme } from '../types';

export function createEditorTheme(theme: Theme) {
  const isDark = theme === Theme.DARK;

  return EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: isDark ? 'rgb(3 7 18)' : 'rgb(255 255 255)',
      color: isDark ? 'rgb(243 244 246)' : 'rgb(17 24 39)',
      fontFamily: 'var(--font-lyric)',
      lineHeight: '1.6',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-scroller': {
      height: '100%',
      overflow: 'auto',
      fontFamily: 'inherit',
      lineHeight: '1.6',
    },
    '.cm-content': {
      minHeight: '100%',
      padding: '1.5rem 2rem 50vh 0.95rem',
      caretColor: 'rgb(99 102 241)',
      color: isDark ? 'rgb(243 244 246)' : 'rgb(17 24 39)',
      whiteSpace: 'pre-wrap',
    },
    '.cm-line': {
      padding: '0',
      overflowWrap: 'anywhere',
    },
    '.cm-gutters': {
      backgroundColor: isDark ? 'rgb(15 23 42)' : 'rgb(248 250 252)',
      borderRight: `1px solid ${isDark ? 'rgb(30 41 59)' : 'rgb(226 232 240)'}`,
      color: 'rgb(148 163 184)',
    },
    '.cm-syllable-gutter': {
      minWidth: '3.5rem',
    },
    '.cm-gutterElement': {
      minHeight: '1.6em',
      padding: '0 0.9rem 0 0.25rem',
      textAlign: 'right',
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
    },
    '.cm-syllable-count': {
      color: 'rgb(100 116 139)',
      fontWeight: '600',
    },
    '.cm-activeLine': {
      backgroundColor: isDark ? 'rgb(99 102 241 / 0.08)' : 'rgb(99 102 241 / 0.06)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: isDark ? 'rgb(99 102 241 / 0.10)' : 'rgb(99 102 241 / 0.08)',
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: 'rgb(99 102 241 / 0.28) !important',
    },
    '.cm-cursor': {
      borderLeftColor: 'rgb(99 102 241)',
      borderLeftWidth: '2px',
    },
    '.cm-hyphenated-word': {
      color: 'inherit',
    },
    '.cm-hyphenated-word::selection': {
      backgroundColor: 'rgb(99 102 241 / 0.28)',
    },
    '.cm-section-header': {
      color: isDark ? 'rgb(165 180 252)' : 'rgb(79 70 229)',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    '.cm-section-header .cm-line': {
      paddingTop: '0.15rem',
      paddingBottom: '0.15rem',
    },
    '.cm-comment-line': {
      color: isDark ? 'rgb(100 116 139 / 0.72)' : 'rgb(100 116 139 / 0.75)',
      fontStyle: 'italic',
    },
  }, { dark: isDark });
}
