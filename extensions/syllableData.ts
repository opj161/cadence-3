import { StateEffect, StateField } from '@codemirror/state';
import type { LineStats } from '../types';

export const setSyllableLinesEffect = StateEffect.define<LineStats[]>();
export const setShowSyllablesEffect = StateEffect.define<boolean>();

export const syllableLinesField = StateField.define<LineStats[]>({
  create() {
    return [];
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setSyllableLinesEffect)) {
        return effect.value;
      }
    }

    return value;
  },
});

export const showSyllablesField = StateField.define<boolean>({
  create() {
    return true;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setShowSyllablesEffect)) {
        return effect.value;
      }
    }

    return value;
  },
});
