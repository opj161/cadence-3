import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { Language } from '../types';
import { analyzeText } from '../services/syllableService';
import {
  setShowSyllablesEffect,
  setSyllableLinesEffect,
  showSyllablesField,
  syllableLinesField,
} from './syllableData';
import { syllableDecorationsField } from './syllableDecorations';

describe('syllable decorations', () => {
  it('renders syllable markers as inserted widgets instead of replacing editable text', () => {
    const doc = 'Strassen';
    const state = EditorState.create({
      doc,
      extensions: [syllableLinesField, showSyllablesField, syllableDecorationsField],
    });

    const nextState = state.update({
      effects: [
        setSyllableLinesEffect.of(analyzeText(doc, Language.DE)),
        setShowSyllablesEffect.of(true),
      ],
    }).state;

    const markerRanges: Array<{ from: number; to: number }> = [];

    nextState.field(syllableDecorationsField).between(0, nextState.doc.length, (from, to, value) => {
      if ((value.spec as { widget?: unknown }).widget) {
        markerRanges.push({ from, to });
      }
    });

    expect(markerRanges.length).toBeGreaterThan(0);
    expect(markerRanges.every(range => range.from === range.to)).toBe(true);
  });
});
